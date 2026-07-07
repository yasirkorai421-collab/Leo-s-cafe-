#!/bin/bash

# ============================================================================
# Setup Row Level Security (RLS) for Leo's Cafe
# ============================================================================
#
# This script applies RLS policies to your Supabase database
#
# Usage:
#   chmod +x scripts/setup-rls.sh
#   ./scripts/setup-rls.sh
#
# ============================================================================

set -e  # Exit on error

echo "🔒 Leo's Cafe - RLS Setup Script"
echo "================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DIRECT_URL" ]; then
  echo "❌ ERROR: DIRECT_URL environment variable is not set"
  echo ""
  echo "Please set your direct Supabase database URL:"
  echo "  export DIRECT_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'"
  echo ""
  echo "You can find this in:"
  echo "  Supabase Dashboard → Settings → Database → Connection String → URI"
  exit 1
fi

echo "✅ Database URL configured"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
  echo "❌ ERROR: psql is not installed"
  echo ""
  echo "Install PostgreSQL client:"
  echo "  macOS: brew install postgresql"
  echo "  Ubuntu: sudo apt-get install postgresql-client"
  echo "  Windows: Download from https://www.postgresql.org/download/windows/"
  exit 1
fi

echo "✅ psql is installed"
echo ""

# Check if migration file exists
MIGRATION_FILE="prisma/migrations/add_rls_policies.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ ERROR: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "✅ Migration file found"
echo ""

# Confirm before proceeding
echo "⚠️  WARNING: This will enable Row Level Security on your database"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Aborted"
  exit 0
fi

echo ""
echo "🚀 Applying RLS policies..."
echo ""

# Apply migration
psql "$DIRECT_URL" -f "$MIGRATION_FILE"

RESULT=$?

if [ $RESULT -eq 0 ]; then
  echo ""
  echo "✅ RLS policies applied successfully!"
  echo ""
  echo "Next steps:"
  echo "  1. Verify RLS is enabled:"
  echo "     See docs/RLS_SECURITY.md for verification queries"
  echo ""
  echo "  2. Test user isolation:"
  echo "     Ensure users can only see their own data"
  echo ""
  echo "  3. Update application code:"
  echo "     Ensure all API routes use correct Supabase client"
  echo ""
else
  echo ""
  echo "❌ ERROR: Failed to apply RLS policies"
  echo ""
  echo "Troubleshooting:"
  echo "  1. Check database URL is correct"
  echo "  2. Verify you have admin access to the database"
  echo "  3. Check for syntax errors in migration file"
  echo "  4. Review error message above"
  exit 1
fi
