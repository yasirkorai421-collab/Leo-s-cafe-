#!/bin/bash
# Pre-Deployment Check Script for Leo's Cafe

echo "🚀 Leo's Cafe - Pre-Deployment Check"
echo "======================================"

# Check Node.js version
echo ""
echo "📦 Checking Node.js version..."
node_version=$(node -v)
echo "Node.js version: $node_version"

# Check if required environment variables are set
echo ""
echo "🔐 Checking environment variables..."
required_vars=(
  "DATABASE_URL"
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
)

missing_vars=()
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
  echo "❌ Missing environment variables:"
  printf '   - %s\n' "${missing_vars[@]}"
  echo ""
  echo "⚠️  Please set these variables in your .env file or deployment platform"
else
  echo "✅ All required environment variables are set"
fi

# Run TypeScript check
echo ""
echo "🔍 Running TypeScript type check..."
if npm run type-check 2>/dev/null || npx tsc --noEmit; then
  echo "✅ TypeScript check passed"
else
  echo "❌ TypeScript check failed"
  exit 1
fi

# Generate Prisma Client
echo ""
echo "🗄️  Generating Prisma Client..."
if npx prisma generate; then
  echo "✅ Prisma Client generated"
else
  echo "❌ Prisma Client generation failed"
  exit 1
fi

# Run build
echo ""
echo "🏗️  Building for production..."
if npm run build; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
  exit 1
fi

echo ""
echo "======================================"
echo "✅ All pre-deployment checks passed!"
echo ""
echo "📝 Next steps:"
echo "1. Review PRODUCTION_OPTIMIZATION_REPORT.md"
echo "2. Set environment variables in Vercel/deployment platform"
echo "3. Push to GitHub (git push origin main)"
echo "4. Monitor deployment logs"
echo ""
echo "🎉 Ready for deployment!"
