# Auth Service Setup Script
# Run this script to set up the auth service

Write-Host "🔐 Setting up Werewolf Auth Service..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created. Please configure it with your settings." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✅ .env file already exists." -ForegroundColor Green
    Write-Host ""
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ Failed to install dependencies." -ForegroundColor Red
    exit 1
}

# Generate Prisma Client
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma Client generated successfully." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ Failed to generate Prisma Client." -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure your .env file with database credentials" -ForegroundColor White
Write-Host "2. Run 'npm run prisma:migrate' to create database tables" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host ""
