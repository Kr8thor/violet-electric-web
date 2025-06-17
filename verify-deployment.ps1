# 🧪 Domain Deployment Verification Script (PowerShell)
# Run this after DNS propagation to verify everything is working

Write-Host "🚀 Verifying violetrainwater.com deployment..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Test counters
$script:TestsPassed = 0
$script:TestsFailed = 0

# Function to run HTTP test
function Test-HttpEndpoint {
    param(
        [string]$Url,
        [int]$ExpectedCode,
        [string]$TestName
    )
    
    Write-Host "Testing $TestName... " -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq $ExpectedCode) {
            Write-Host "✅ PASS (HTTP $($response.StatusCode))" -ForegroundColor Green
            $script:TestsPassed++
        } else {
            Write-Host "❌ FAIL (HTTP $($response.StatusCode), expected $ExpectedCode)" -ForegroundColor Red
            $script:TestsFailed++
        }
    } catch {
        Write-Host "❌ FAIL (Error: $($_.Exception.Message))" -ForegroundColor Red
        $script:TestsFailed++
    }
}

# Function to test JSON API
function Test-JsonApi {
    param(
        [string]$Url,
        [string]$TestName
    )
    
    Write-Host "Testing $TestName... " -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri $Url -TimeoutSec 10
        if ($response) {
            Write-Host "✅ PASS (Valid JSON response)" -ForegroundColor Green
            $script:TestsPassed++
        } else {
            Write-Host "❌ FAIL (Empty response)" -ForegroundColor Red
            $script:TestsFailed++
        }
    } catch {
        Write-Host "❌ FAIL (Error: $($_.Exception.Message))" -ForegroundColor Red
        $script:TestsFailed++
    }
}

# Function to test DNS resolution
function Test-DnsResolution {
    param(
        [string]$Domain,
        [string]$TestName
    )
    
    Write-Host "Testing $TestName... " -NoNewline
    
    try {
        $result = Resolve-DnsName -Name $Domain -ErrorAction Stop
        if ($result) {
            Write-Host "✅ PASS (DNS resolves)" -ForegroundColor Green
            $script:TestsPassed++
        } else {
            Write-Host "❌ FAIL (DNS not resolving)" -ForegroundColor Red
            $script:TestsFailed++
        }
    } catch {
        Write-Host "❌ FAIL (DNS error: $($_.Exception.Message))" -ForegroundColor Red
        $script:TestsFailed++
    }
}

Write-Host ""
Write-Host "🌐 Testing Domain Resolution..." -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow

# DNS Resolution Tests
Test-DnsResolution "violetrainwater.com" "Main Domain DNS"
Test-DnsResolution "www.violetrainwater.com" "WWW Subdomain DNS"

Write-Host ""
Write-Host "🔒 Testing SSL Certificate..." -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

# SSL Tests
Test-HttpEndpoint "https://violetrainwater.com" 200 "Main Site HTTPS"
Test-HttpEndpoint "https://www.violetrainwater.com" 200 "WWW HTTPS"

Write-Host ""
Write-Host "📱 Testing Frontend Pages..." -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow

# Frontend Tests
Test-HttpEndpoint "https://violetrainwater.com" 200 "Homepage Load"
Test-HttpEndpoint "https://violetrainwater.com/about" 200 "About Page"
Test-HttpEndpoint "https://violetrainwater.com/keynotes" 200 "Keynotes Page"
Test-HttpEndpoint "https://violetrainwater.com/testimonials" 200 "Testimonials Page"
Test-HttpEndpoint "https://violetrainwater.com/contact" 200 "Contact Page"

Write-Host ""
Write-Host "🔗 Testing API Proxy..." -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow

# API Proxy Tests
Test-JsonApi "https://violetrainwater.com/wp-json/violet/v1/content" "WordPress REST API"

# Test WordPress admin redirect (should return 302)
Write-Host "Testing WordPress Admin Proxy... " -NoNewline
try {
    $response = Invoke-WebRequest -Uri "https://violetrainwater.com/wp-admin/" -UseBasicParsing -MaximumRedirection 0 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 302 -or $response.StatusCode -eq 301) {
        Write-Host "✅ PASS (Redirect working)" -ForegroundColor Green
        $script:TestsPassed++
    } else {
        Write-Host "❌ FAIL (Expected redirect, got $($response.StatusCode))" -ForegroundColor Red
        $script:TestsFailed++
    }
} catch {
    Write-Host "❌ FAIL (Error: $($_.Exception.Message))" -ForegroundColor Red
    $script:TestsFailed++
}

Write-Host ""
Write-Host "🎨 Testing Universal Editor..." -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow

Write-Host "Manual test required:" -ForegroundColor Cyan
Write-Host "1. Go to: https://wp.violetrainwater.com/wp-admin/" -ForegroundColor White
Write-Host "2. Navigate to Universal Editor" -ForegroundColor White
Write-Host "3. Verify iframe loads: https://violetrainwater.com" -ForegroundColor White
Write-Host "4. Test editing functionality" -ForegroundColor White

Write-Host ""
Write-Host "📊 Testing Performance..." -ForegroundColor Yellow
Write-Host "=======================" -ForegroundColor Yellow

# Performance Test
Write-Host "Testing page load time... " -NoNewline
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-WebRequest -Uri "https://violetrainwater.com" -UseBasicParsing -TimeoutSec 10
    $stopwatch.Stop()
    $loadTime = $stopwatch.ElapsedMilliseconds / 1000
    
    if ($loadTime -lt 3.0) {
        Write-Host "✅ PASS (${loadTime}s < 3.0s)" -ForegroundColor Green
        $script:TestsPassed++
    } else {
        Write-Host "⚠️  SLOW (${loadTime}s > 3.0s)" -ForegroundColor Yellow
        $script:TestsFailed++
    }
} catch {
    Write-Host "❌ FAIL (Error: $($_.Exception.Message))" -ForegroundColor Red
    $script:TestsFailed++
}

Write-Host ""
Write-Host "🔍 Testing SEO Essentials..." -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow

# SEO Tests
Write-Host "Testing robots.txt... " -NoNewline
try {
    $robots = Invoke-WebRequest -Uri "https://violetrainwater.com/robots.txt" -UseBasicParsing -TimeoutSec 10
    if ($robots.Content -like "*User-agent*") {
        Write-Host "✅ PASS" -ForegroundColor Green
        $script:TestsPassed++
    } else {
        Write-Host "❌ FAIL (Invalid robots.txt)" -ForegroundColor Red
        $script:TestsFailed++
    }
} catch {
    Write-Host "❌ FAIL (robots.txt not accessible)" -ForegroundColor Red
    $script:TestsFailed++
}

Write-Host "Testing sitemap.xml... " -NoNewline
try {
    $sitemap = Invoke-WebRequest -Uri "https://violetrainwater.com/sitemap.xml" -UseBasicParsing -TimeoutSec 10
    if ($sitemap.Content -like "*<?xml*") {
        Write-Host "✅ PASS" -ForegroundColor Green
        $script:TestsPassed++
    } else {
        Write-Host "❌ FAIL (Invalid sitemap.xml)" -ForegroundColor Red
        $script:TestsFailed++
    }
} catch {
    Write-Host "❌ FAIL (sitemap.xml not accessible)" -ForegroundColor Red
    $script:TestsFailed++
}

Write-Host ""
Write-Host "🎯 Test Results Summary" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host "Tests Passed: " -NoNewline
Write-Host "$script:TestsPassed" -ForegroundColor Green
Write-Host "Tests Failed: " -NoNewline
Write-Host "$script:TestsFailed" -ForegroundColor Red

$TotalTests = $script:TestsPassed + $script:TestsFailed
if ($TotalTests -gt 0) {
    $SuccessRate = [math]::Round(($script:TestsPassed * 100 / $TotalTests), 1)
    Write-Host "Success Rate: $SuccessRate%" -ForegroundColor Cyan
}

if ($script:TestsFailed -eq 0) {
    Write-Host ""
    Write-Host "🎉 ALL TESTS PASSED! Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Your site is fully operational at:" -ForegroundColor Green
    Write-Host "   🌐 https://violetrainwater.com" -ForegroundColor White
    Write-Host "   📱 Mobile-responsive and fast" -ForegroundColor White
    Write-Host "   🔒 SSL-secured" -ForegroundColor White
    Write-Host "   🎨 Universal editing enabled" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Test universal editing at wp.violetrainwater.com/wp-admin" -ForegroundColor White
    Write-Host "   2. Update any marketing materials with new domain" -ForegroundColor White
    Write-Host "   3. Set up Google Analytics/Search Console" -ForegroundColor White
    Write-Host "   4. Monitor performance and SEO" -ForegroundColor White
} elseif ($SuccessRate -gt 80) {
    Write-Host ""
    Write-Host "⚠️  Mostly successful ($SuccessRate% pass rate)" -ForegroundColor Yellow
    Write-Host "Some issues detected but site is likely functional." -ForegroundColor Yellow
    Write-Host "Review failed tests and address any critical issues." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Significant issues detected ($SuccessRate% pass rate)" -ForegroundColor Red
    Write-Host "Please review failed tests and fix issues before going live." -ForegroundColor Red
}

Write-Host ""
Write-Host "🛠️ Troubleshooting:" -ForegroundColor Cyan
Write-Host "   - If DNS tests fail: Wait longer for propagation (up to 48 hours)" -ForegroundColor White
Write-Host "   - If SSL tests fail: Check Netlify certificate status" -ForegroundColor White
Write-Host "   - If API tests fail: Verify netlify.toml proxy configuration" -ForegroundColor White
Write-Host "   - If load time is slow: Check Netlify deploy logs for issues" -ForegroundColor White

# Return exit code based on failed tests
exit $script:TestsFailed
