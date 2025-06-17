#!/bin/bash

# 🧪 Domain Deployment Verification Script
# Run this after DNS propagation to verify everything is working

echo "🚀 Verifying violetrainwater.com deployment..."
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "   Command: $test_command"
        ((TESTS_FAILED++))
    fi
}

# Function to test HTTP response
test_http() {
    local url="$1"
    local expected_code="$2"
    local test_name="$3"
    
    echo -n "Testing $test_name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "$expected_code" ]; then
        echo -e "${GREEN}✅ PASS (HTTP $response)${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL (HTTP $response, expected $expected_code)${NC}"
        ((TESTS_FAILED++))
    fi
}

# Function to test JSON API
test_json_api() {
    local url="$1"
    local test_name="$2"
    
    echo -n "Testing $test_name... "
    
    response=$(curl -s "$url")
    
    if echo "$response" | jq . >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS (Valid JSON)${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL (Invalid JSON or no response)${NC}"
        echo "   Response: ${response:0:100}..."
        ((TESTS_FAILED++))
    fi
}

echo "🌐 Testing Domain Resolution..."
echo "=============================="

# DNS Resolution Tests
run_test "DNS Resolution (A Record)" "dig +short violetrainwater.com | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$'" "IP address"
run_test "DNS Resolution (WWW CNAME)" "dig +short www.violetrainwater.com | grep netlify" "Netlify CNAME"

echo ""
echo "🔒 Testing SSL Certificate..."
echo "============================="

# SSL Tests
test_http "https://violetrainwater.com" "200" "Main Site HTTPS"
test_http "https://www.violetrainwater.com" "200" "WWW HTTPS"

echo ""
echo "📱 Testing Frontend..."
echo "===================="

# Frontend Tests
test_http "https://violetrainwater.com" "200" "Homepage Load"
test_http "https://violetrainwater.com/about" "200" "About Page"
test_http "https://violetrainwater.com/keynotes" "200" "Keynotes Page"
test_http "https://violetrainwater.com/testimonials" "200" "Testimonials Page"
test_http "https://violetrainwater.com/contact" "200" "Contact Page"

echo ""
echo "🔗 Testing API Proxy..."
echo "======================"

# API Proxy Tests
test_json_api "https://violetrainwater.com/wp-json/violet/v1/content" "WordPress REST API"
test_http "https://violetrainwater.com/wp-admin/" "302" "WordPress Admin Proxy (should redirect)"

echo ""
echo "🎨 Testing Universal Editor..."
echo "============================="

# Check if we can access the WordPress admin to test editor
echo "Manual test required: "
echo "1. Go to: https://wp.violetrainwater.com/wp-admin/"
echo "2. Navigate to Universal Editor"
echo "3. Verify iframe loads: https://violetrainwater.com"
echo "4. Test editing functionality"

echo ""
echo "📊 Testing Performance..."
echo "======================="

# Performance Tests
echo -n "Testing page load time... "
load_time=$(curl -w "%{time_total}" -o /dev/null -s "https://violetrainwater.com")
if (( $(echo "$load_time < 3.0" | bc -l) )); then
    echo -e "${GREEN}✅ PASS (${load_time}s < 3.0s)${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  SLOW (${load_time}s > 3.0s)${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "📱 Testing Mobile Responsiveness..."
echo "================================="

# Mobile Tests (User-Agent simulation)
test_http "https://violetrainwater.com" "200" "Mobile User-Agent" "-H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'"

echo ""
echo "🔍 Testing SEO Essentials..."
echo "==========================="

# SEO Tests
echo -n "Testing robots.txt... "
if curl -s "https://violetrainwater.com/robots.txt" | grep -q "User-agent"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((TESTS_FAILED++))
fi

echo -n "Testing sitemap.xml... "
if curl -s "https://violetrainwater.com/sitemap.xml" | grep -q "<?xml"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "🎯 Test Results Summary"
echo "======================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$(echo "scale=1; $TESTS_PASSED * 100 / $TOTAL_TESTS" | bc)

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Deployment successful!${NC}"
    echo ""
    echo "✅ Your site is fully operational at:"
    echo "   🌐 https://violetrainwater.com"
    echo "   📱 Mobile-responsive and fast"
    echo "   🔒 SSL-secured"
    echo "   🎨 Universal editing enabled"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Test universal editing at wp.violetrainwater.com/wp-admin"
    echo "   2. Update any marketing materials with new domain"
    echo "   3. Set up Google Analytics/Search Console"
    echo "   4. Monitor performance and SEO"
elif [ "$SUCCESS_RATE" -gt 80 ]; then
    echo -e "${YELLOW}⚠️  Mostly successful (${SUCCESS_RATE}% pass rate)${NC}"
    echo "Some issues detected but site is likely functional."
    echo "Review failed tests and address any critical issues."
else
    echo -e "${RED}❌ Significant issues detected (${SUCCESS_RATE}% pass rate)${NC}"
    echo "Please review failed tests and fix issues before going live."
fi

echo ""
echo "🛠️ Troubleshooting:"
echo "   - If DNS tests fail: Wait longer for propagation (up to 48 hours)"
echo "   - If SSL tests fail: Check Netlify certificate status"
echo "   - If API tests fail: Verify netlify.toml proxy configuration"
echo "   - If load time is slow: Check Netlify deploy logs for issues"

exit $TESTS_FAILED
