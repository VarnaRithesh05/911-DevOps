# List All Test Cases Script
# This script extracts and displays all test cases from Jest test files

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   911-DevOps Test Cases Summary" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Function to extract test cases from a file
function Get-TestCases {
    param($filePath)
    
    $content = Get-Content $filePath -Raw
    $fileName = Split-Path $filePath -Leaf
    
    # Extract describe blocks and test cases
    $describes = [regex]::Matches($content, "describe\('([^']+)'")
    $tests = [regex]::Matches($content, "test\('([^']+)'")
    
    Write-Host "📄 File: $fileName" -ForegroundColor Yellow
    Write-Host "   Tests found: $($tests.Count)" -ForegroundColor Green
    Write-Host ""
    
    $testNumber = 1
    foreach ($test in $tests) {
        Write-Host "   $testNumber. $($test.Groups[1].Value)" -ForegroundColor White
        $testNumber++
    }
    Write-Host ""
}

# Find all test files
$testFiles = Get-ChildItem -Filter "*.test.js"

if ($testFiles.Count -eq 0) {
    Write-Host "❌ No test files found!" -ForegroundColor Red
    exit 1
}

Write-Host "Found $($testFiles.Count) test file(s)" -ForegroundColor Green
Write-Host ""

foreach ($file in $testFiles) {
    Get-TestCases $file.FullName
}

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "To run tests, use:" -ForegroundColor Cyan
Write-Host "  npm test                    # Run all tests" -ForegroundColor White
Write-Host "  npm run test:coverage       # Run with coverage" -ForegroundColor White
Write-Host "  npm run test:watch          # Watch mode" -ForegroundColor White
Write-Host "=======================================" -ForegroundColor Cyan
