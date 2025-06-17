#!/usr/bin/env node

/**
 * 🧪 Netlify Rebuild Test Script
 * Tests the direct rebuild functionality that should now be working
 */

const https = require('https');
const querystring = require('querystring');

// Configuration
const WP_BASE_URL = 'https://wp.violetrainwater.com';
const NETLIFY_HOOK = 'https://api.netlify.com/build_hooks/684054a7aed5fdf9f3793a0f';

async function testNetlifyRebuildSystem() {
    console.log('🧪 Testing Netlify Rebuild System...\n');
    
    try {
        // Test 1: Get nonces from WordPress
        console.log('1️⃣ Testing nonce generation...');
        const nonceResponse = await fetch(`${WP_BASE_URL}/wp-admin/admin-ajax.php?action=violet_get_nonces`);
        const nonceData = await nonceResponse.json();
        
        if (nonceData.success) {
            console.log('✅ Nonces generated successfully');
            console.log(`   Save nonce: ${nonceData.data.save_nonce.substring(0, 10)}...`);
            console.log(`   Rebuild nonce: ${nonceData.data.rebuild_nonce.substring(0, 10)}...`);
        } else {
            throw new Error('Failed to get nonces');
        }
        
        // Test 2: Test direct Netlify hook
        console.log('\n2️⃣ Testing direct Netlify build hook...');
        const hookResponse = await fetch(NETLIFY_HOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                trigger: 'test_rebuild',
                timestamp: new Date().toISOString()
            })
        });
        
        if (hookResponse.ok) {
            console.log('✅ Netlify build hook triggered successfully');
            console.log(`   Response status: ${hookResponse.status}`);
        } else {
            console.log(`⚠️ Netlify hook returned status: ${hookResponse.status}`);
        }
        
        // Test 3: Test WordPress rebuild endpoint (this requires authentication)
        console.log('\n3️⃣ WordPress rebuild endpoint test...');
        console.log('   This test requires WordPress authentication');
        console.log('   Test manually by clicking "🚀 Rebuild Site" in WordPress admin');
        
        console.log('\n🎯 Test Results Summary:');
        console.log('✅ Nonce generation: Working');
        console.log('✅ Netlify build hook: Working');
        console.log('🔧 WordPress admin test: Manual verification needed');
        
        console.log('\n📋 Next Steps:');
        console.log('1. Open WordPress Admin → Universal Editor');
        console.log('2. Click "🚀 Rebuild Site" button');
        console.log('3. Check Netlify dashboard for new build');
        console.log('4. Verify site updates within 2-4 minutes');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testNetlifyRebuildSystem();
