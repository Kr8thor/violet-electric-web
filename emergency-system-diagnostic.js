/**
 * EMERGENCY SYSTEM DIAGNOSTIC
 * Run this in WordPress admin console to diagnose all issues
 */

console.log('🚨 EMERGENCY DIAGNOSTIC STARTING...');
console.log('='.repeat(50));

const diagnostic = {
    wordpress: {},
    react: {},
    communication: {},
    content: {},
    issues: [],
    fixes: []
};

// 1. WordPress Environment Check
console.log('📋 1. WORDPRESS ENVIRONMENT CHECK');
diagnostic.wordpress = {
    iframe: !!document.getElementById('violet-site-iframe'),
    saveFunction: typeof window.violetSaveAllChanges,
    pendingChanges: typeof window.violetPendingChanges,
    connectionStatus: document.getElementById('violet-connection-status')?.textContent,
    config: typeof window.violetConfig !== 'undefined' ? {
        netlifyOrigin: window.violetConfig?.netlifyOrigin,
        saveUrl: window.violetConfig?.batchSaveUrl
    } : 'undefined'
};

Object.entries(diagnostic.wordpress).forEach(([key, value]) => {
    const status = key === 'iframe' && value ? '✅' : 
                  typeof value === 'function' ? '✅' : 
                  value ? '✅' : '❌';
    console.log(`  ${status} ${key}: ${value}`);
});

// 2. React App Communication Test
console.log('\n📱 2. REACT APP COMMUNICATION TEST');
const iframe = document.getElementById('violet-site-iframe');

if (iframe) {
    // Test basic access
    try {
        const iframeWindow = iframe.contentWindow;
        diagnostic.react = {
            accessible: !!iframeWindow,
            url: iframe.src,
            readyState: iframe.readyState
        };
        
        console.log('  ✅ Iframe window accessible');
        console.log('  📍 URL:', iframe.src);
        
        // Send test message
        iframe.contentWindow.postMessage({
            type: 'violet-diagnostic-ping',
            timestamp: Date.now(),
            from: 'emergency-diagnostic'
        }, '*');
        
        console.log('  📤 Test message sent to React app');
        
    } catch (error) {
        console.log('  ❌ Iframe access error:', error.message);
        diagnostic.react.error = error.message;
    }
} else {
    console.log('  ❌ No iframe found');
}

// 3. Message Communication Test
console.log('\n💬 3. COMMUNICATION TEST');
let messageReceived = false;
let readyMessageReceived = false;

const messageListener = (event) => {
    if (event.data?.type?.includes('violet')) {
        messageReceived = true;
        console.log(`  📨 Received: ${event.data.type}`);
        
        if (event.data.type === 'violet-iframe-ready') {
            readyMessageReceived = true;
            console.log('  ✅ React app ready signal received!');
        }
        
        if (event.data.type === 'violet-diagnostic-pong') {
            console.log('  ✅ React app responded to diagnostic ping!');
        }
    }
};

window.addEventListener('message', messageListener);

// Wait for messages
setTimeout(() => {
    diagnostic.communication = {
        messageReceived,
        readyMessageReceived,
        listenerActive: true
    };
    
    if (!readyMessageReceived) {
        console.log('  ❌ No ready message from React app');
        diagnostic.issues.push('React app not sending ready message');
        diagnostic.fixes.push('Check React app initialization in main.tsx');
    }
    
    // 4. Content System Test
    console.log('\n📦 4. CONTENT SYSTEM TEST');
    
    // Check WordPress content API
    fetch('/wp-json/violet/v1/content')
        .then(response => response.json())
        .then(data => {
            console.log('  ✅ WordPress content API working:', Object.keys(data).length, 'fields');
            diagnostic.content.wordpressApi = 'working';
            diagnostic.content.fieldCount = Object.keys(data).length;
        })
        .catch(error => {
            console.log('  ❌ WordPress content API error:', error.message);
            diagnostic.content.wordpressApi = 'failed';
            diagnostic.issues.push('WordPress content API not accessible');
        });
    
    // Check if iframe has localStorage access
    if (iframe && iframe.contentWindow) {
        try {
            iframe.contentWindow.postMessage({
                type: 'violet-diagnostic-storage-check',
                timestamp: Date.now()
            }, '*');
        } catch (error) {
            console.log('  ❌ Cannot test iframe storage:', error.message);
        }
    }
    
    // 5. Generate Diagnostic Report
    setTimeout(() => {
        console.log('\n📊 5. DIAGNOSTIC SUMMARY');
        console.log('='.repeat(50));
        
        if (diagnostic.issues.length === 0) {
            console.log('✅ No critical issues detected');
        } else {
            console.log('❌ Issues found:');
            diagnostic.issues.forEach((issue, i) => {
                console.log(`  ${i + 1}. ${issue}`);
            });
            
            console.log('\n🔧 Suggested fixes:');
            diagnostic.fixes.forEach((fix, i) => {
                console.log(`  ${i + 1}. ${fix}`);
            });
        }
        
        console.log('\n📋 Full diagnostic data:');
        console.log(diagnostic);
        
        // Store diagnostic results globally
        window.violetDiagnostic = diagnostic;
        
        console.log('\n💡 Access full results with: window.violetDiagnostic');
        console.log('🚨 EMERGENCY DIAGNOSTIC COMPLETE');
        
    }, 3000);
    
}, 2000);

// 6. Emergency Communication Fix
console.log('\n⚡ 6. EMERGENCY COMMUNICATION FIX');

const emergencyCommFix = () => {
    console.log('  🔧 Applying emergency communication fix...');
    
    // Force iframe reload if not responding
    if (iframe && !readyMessageReceived) {
        const currentSrc = iframe.src;
        console.log('  🔄 Forcing iframe reload...');
        
        // Add debug parameters
        const url = new URL(currentSrc);
        url.searchParams.set('emergency_fix', '1');
        url.searchParams.set('debug', '1');
        url.searchParams.set('timestamp', Date.now().toString());
        
        iframe.src = url.toString();
        
        diagnostic.fixes.push('Emergency iframe reload applied');
    }
    
    // Override connection status
    const statusEl = document.getElementById('violet-connection-status');
    if (statusEl && statusEl.textContent === 'Testing connection...') {
        statusEl.textContent = '🔧 Emergency fix applied';
        statusEl.style.color = 'orange';
    }
};

// Apply fix after initial checks
setTimeout(emergencyCommFix, 5000);

console.log('🏁 Diagnostic running... Check results in 10 seconds');
