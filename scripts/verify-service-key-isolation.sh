#!/bin/bash

# ============================================================================
# Verify Service Role Key Isolation
# ============================================================================
#
# This script checks that the Supabase service role key is not exposed
# to the client-side code.
#
# Usage:
#   chmod +x scripts/verify-service-key-isolation.sh
#   ./scripts/verify-service-key-isolation.sh
#
# ============================================================================

set -e

echo "🔒 Service Role Key Isolation Verification"
echo "==========================================="
echo ""

PASS=0
FAIL=0

# Check 1: No NEXT_PUBLIC_ prefix on service key
echo "Check 1: Verifying service key is not public..."
if grep -r "NEXT_PUBLIC.*SERVICE" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=.next \
  --exclude="*.md" \
  --exclude="*.sh" 2>/dev/null | grep -v "docs/" | grep -q .; then
  echo "❌ FAIL: Found NEXT_PUBLIC_*SERVICE variables"
  grep -r "NEXT_PUBLIC.*SERVICE" . \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=.next \
    --exclude="*.md" \
    --exclude="*.sh" | grep -v "docs/"
  FAIL=$((FAIL + 1))
else
  echo "✅ PASS: No public service keys found"
  PASS=$((PASS + 1))
fi
echo ""

# Check 2: Client utilities use anon key only
echo "Check 2: Verifying client utilities use anon key..."
if grep -r "SUPABASE_SERVICE_ROLE_KEY" utils/supabase/ 2>/dev/null | grep -q .; then
  echo "❌ FAIL: Service key found in client utilities"
  grep -r "SUPABASE_SERVICE_ROLE_KEY" utils/supabase/
  FAIL=$((FAIL + 1))
else
  echo "✅ PASS: Client utilities only use anon key"
  PASS=$((PASS + 1))
fi
echo ""

# Check 3: Check environment files have correct naming
echo "Check 3: Verifying environment variable naming..."
if [ -f ".env.production" ]; then
  if grep "NEXT_PUBLIC.*SERVICE.*ROLE" .env.production 2>/dev/null | grep -q .; then
    echo "❌ FAIL: Service key has NEXT_PUBLIC_ prefix in .env.production"
    grep "NEXT_PUBLIC.*SERVICE.*ROLE" .env.production
    FAIL=$((FAIL + 1))
  else
    echo "✅ PASS: .env.production has correct naming"
    PASS=$((PASS + 1))
  fi
else
  echo "⚠️  SKIP: .env.production not found"
fi
echo ""

# Check 4: Service key only in server-side files
echo "Check 4: Verifying service key only in server-side code..."
SERVER_FILES=$(grep -rl "SUPABASE_SERVICE_ROLE_KEY" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=.next \
  --exclude="*.md" \
  --exclude="*.sh" \
  --include="*.ts" \
  --include="*.tsx" 2>/dev/null || true)

if [ -z "$SERVER_FILES" ]; then
  echo "⚠️  WARNING: No TypeScript files found using service key"
  echo ""
else
  # Check if any client components use service key
  CLIENT_VIOLATIONS=0
  for file in $SERVER_FILES; do
    if grep -q "^['\"]use client['\"]" "$file" 2>/dev/null; then
      echo "❌ FAIL: Service key used in client component: $file"
      CLIENT_VIOLATIONS=$((CLIENT_VIOLATIONS + 1))
    fi
  done
  
  if [ $CLIENT_VIOLATIONS -eq 0 ]; then
    echo "✅ PASS: Service key only in server-side code"
    PASS=$((PASS + 1))
  else
    echo "❌ FAIL: Found $CLIENT_VIOLATIONS client component(s) using service key"
    FAIL=$((FAIL + 1))
  fi
fi
echo ""

# Check 5: Build and verify bundle (if possible)
echo "Check 5: Checking if build artifacts exist..."
if [ -d ".next/static" ]; then
  echo "  Checking production bundle for service key..."
  if grep -r "service_role" .next/static/ 2>/dev/null | grep -q .; then
    echo "❌ FAIL: Service key found in production bundle!"
    echo "  This is a CRITICAL security vulnerability!"
    grep -r "service_role" .next/static/ | head -5
    FAIL=$((FAIL + 1))
  else
    echo "✅ PASS: No service key in production bundle"
    PASS=$((PASS + 1))
  fi
else
  echo "⚠️  SKIP: No build artifacts found (run 'npm run build' first)"
fi
echo ""

# Summary
echo "==========================================="
echo "Summary:"
echo "  ✅ Passed: $PASS"
echo "  ❌ Failed: $FAIL"
echo "==========================================="
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 All checks passed! Service role key is properly isolated."
  exit 0
else
  echo "⚠️  $FAIL check(s) failed. Please review the issues above."
  echo ""
  echo "See docs/SERVICE_ROLE_SECURITY.md for guidance."
  exit 1
fi
