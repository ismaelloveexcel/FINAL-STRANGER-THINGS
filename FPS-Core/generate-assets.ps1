# Stranger Things Asset Generator - PowerShell Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STRANGER THINGS - MESHY ASSET GENERATOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set API key
$env:MESHY_API_KEY = "msy_TgknSgucpW7n9PSmXXjCvEktvsqEEHCl1U2Y"

# Try to find node in common locations
$nodePaths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:APPDATA\npm\node.exe",
    "$env:ProgramFiles\nodejs\node.exe"
)

$nodeExe = $null
foreach ($path in $nodePaths) {
    if (Test-Path $path) {
        $nodeExe = $path
        Write-Host "Found Node.js at: $nodeExe" -ForegroundColor Green
        break
    }
}

if (-not $nodeExe) {
    Write-Host "Searching for Node.js in system..." -ForegroundColor Yellow
    $nodeExe = (Get-Command node -ErrorAction SilentlyContinue).Source
}

if (-not $nodeExe) {
    Write-Host "ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Using Node: $nodeExe" -ForegroundColor Green
Write-Host ""
Write-Host "Starting asset generation..." -ForegroundColor Yellow
Write-Host "This will take 30-60 minutes." -ForegroundColor Yellow
Write-Host ""

# Run the generation script
& $nodeExe generate-models.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! All models generated!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Models saved to: public\models\" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Check the models in public\models\" -ForegroundColor White
    Write-Host "2. Enable models in game" -ForegroundColor White
    Write-Host "3. Run: npm run dev" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERROR: Generation failed" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"
