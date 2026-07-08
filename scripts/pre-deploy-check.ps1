# Pre-Deployment Check Script for Leo's Cafe (PowerShell)

Write-Host "🚀 Leo's Cafe - Pre-Deployment Check" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "📦 Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node -v
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green

# Check if .env.local exists
Write-Host ""
Write-Host "🔐 Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local not found - make sure environment variables are set" -ForegroundColor Yellow
}

# Run TypeScript check
Write-Host ""
Write-Host "🔍 Running TypeScript type check..." -ForegroundColor Yellow
$tscResult = npx tsc --noEmit 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript check passed (0 errors)" -ForegroundColor Green
} else {
    Write-Host "❌ TypeScript check failed" -ForegroundColor Red
    Write-Host $tscResult
    exit 1
}

# Generate Prisma Client
Write-Host ""
Write-Host "🗄️  Generating Prisma Client..." -ForegroundColor Yellow
$prismaResult = npx prisma generate 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma Client generated" -ForegroundColor Green
} else {
    Write-Host "❌ Prisma Client generation failed" -ForegroundColor Red
    Write-Host $prismaResult
    exit 1
}

# Run lint
Write-Host ""
Write-Host "🧹 Running linter..." -ForegroundColor Yellow
$lintResult = npm run lint 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Lint passed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Lint warnings found (non-blocking)" -ForegroundColor Yellow
}

# Run build
Write-Host ""
Write-Host "🏗️  Building for production..." -ForegroundColor Yellow
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Write-Host $buildResult
    exit 1
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ All pre-deployment checks passed!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Review PRODUCTION_OPTIMIZATION_REPORT.md"
Write-Host "2. Set environment variables in Vercel"
Write-Host "3. Push to GitHub: git push origin main"
Write-Host "4. Monitor deployment in Vercel dashboard"
Write-Host ""
Write-Host "🎉 Ready for deployment!" -ForegroundColor Green
