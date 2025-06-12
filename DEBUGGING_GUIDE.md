# 🔧 Technical Debugging Guide
## WordPress-React Universal Editing System Troubleshooting

**For:** Developers and technical administrators  
**Scope:** Common issues, diagnostic procedures, and solutions  
**Updated:** January 2025

---

## 🚨 Emergency Quick Fixes

### **System Completely Down**
```bash
# 1. Check service status
curl -I https://wp.violetrainwater.com/wp-admin/
curl -I https://lustrous-dolphin-447351.netlify.app/

# 2. Check WordPress REST API
curl https://wp.violetrainwater.com/wp-json/violet/v1/debug

# 3. Check Netlify deployment
# Visit: https://app.netlify.com/sites/lustrous-dolphin-447351/deploys

# 4. Emergency rollback
# WordPress: Restore from WP Engine backup
# React: Revert to previous GitHub commit
```

### **Universal Editor Won't Load**
```javascript
// Run in WordPress admin console:
console.log('Testing Universal Editor...');

// Check if menu exists
const menu = document.querySelector('a[href*="violet-universal-editor"]');
console.log('Universal Editor menu:', menu ? '✅ Found' : '❌ Missing');

// Check functions.php loading
console.log('Functions loaded:', typeof violet_get_content !== 'undefined' ? '✅ Yes' : '❌ No');

// Quick fix attempt
if (!menu) {
    console.log('💡 Solution: Upload enhanced functions.php to WordPress theme');
}
```

---

## 🔍 Diagnostic Procedures

### **System Health Check (Run First)**
```javascript
// Comprehensive system diagnostic - run in WordPress admin console
function systemHealthCheck() {
    console.log('🔍 SYSTEM HEALTH CHECK');
    console.log('=====================');
    
    const checks = {
        wordpress: {
            admin: window.location.href.includes('wp-admin'),
            menu: !!document.querySelector('a[href*="violet-universal-editor"]'),
            functions: typeof violetSaveAllChanges !== 'undefined'
        },
        iframe: {
            element: !!document.getElementById('violet-site-iframe'),
            loaded: false,
            communication: false
        },
        api: {
            endpoints: false,
            cors: false
        }
    };
    
    // Check iframe
    const iframe = document.getElementById('violet-site-iframe');
    if (iframe) {
        checks.iframe.loaded = iframe.src.includes('lustrous-dolphin-447351.netlify.app');
    }
    
    // Test API endpoint
    fetch('/wp-json/violet/v1/debug')
        .then(r => r.json())
        .then(data => {
            checks.api.endpoints = data.status === 'success';
            checks.api.cors = true;
            displayHealthResults(checks);
        })
        .catch(error => {
            console.log('❌ API test failed:', error.message);
            displayHealthResults(checks);
        });
    
    return checks;
}

function displayHealthResults(checks) {
    console.log('📊 HEALTH CHECK RESULTS:');
    console.log(`WordPress Admin: ${checks.wordpress.admin ? '✅' : '❌'}`);
    console.log(`Universal Editor Menu: ${checks.wordpress.menu ? '✅' : '❌'}`);
    console.log(`Functions Loaded: ${checks.wordpress.functions ? '✅' : '❌'}`);
    console.log(`Iframe Element: ${checks.iframe.element ? '✅' : '❌'}`);
    console.log(`Iframe Loaded: ${checks.iframe.loaded ? '✅' : '❌'}`);
    console.log(`API Endpoints: ${checks.api.endpoints ? '✅' : '❌'}`);
    console.log(`CORS Working: ${checks.api.cors ? '✅' : '❌'}`);
    
    const score = Object.values(checks).reduce((acc, category) => {
        return acc + Object.values(category).filter(Boolean).length;
    }, 0);
    
    console.log(`\n🎯 HEALTH SCORE: ${score}/7`);
    
    if (score < 4) {
        console.log('🚨 CRITICAL: Multiple system failures detected');
        console.log('   1. Check functions.php is properly uploaded');
        console.log('   2. Verify WordPress theme is active');
        console.log('   3. Check WP Engine hosting status');
    } else if (score < 6) {
        console.log('⚠️ WARNING: Some issues need attention');
        console.log('   1. Check iframe and communication settings');
        console.log('   2. Test API endpoints manually');
    } else {
        console.log('✅ GOOD: System appears healthy');
    }
}

// Make available globally
window.systemHealthCheck = systemHealthCheck;
```

### **Communication Debug (PostMessage Issues)**
```javascript
// Test WordPress ↔ React communication
function debugCommunication() {
    console.log('🔗 COMMUNICATION DEBUG');
    console.log('======================');
    
    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.log('❌ No iframe found - open Universal Editor first');
        return;
    }
    
    let messagesSent = 0;
    let messagesReceived = 0;
    const messageLog = [];
    
    // Listen for all messages
    const messageListener = (event) => {
        messagesReceived++;
        messageLog.push({
            type: event.data?.type || 'unknown',
            origin: event.origin,
            timestamp: Date.now()
        });
        console.log(`📨 Received [${messagesReceived}]: ${event.data?.type} from ${event.origin}`);
    };
    
    window.addEventListener('message', messageListener);
    
    // Send test messages
    const sendTest = (type, data = {}) => {
        try {
            iframe.contentWindow.postMessage({
                type: type,
                timestamp: Date.now(),
                debug: true,
                ...data
            }, '*');
            messagesSent++;
            console.log(`📤 Sent [${messagesSent}]: ${type}`);
        } catch (error) {
            console.log(`❌ Failed to send ${type}:`, error.message);
        }
    };
    
    // Test sequence
    console.log('🚀 Starting communication test...');
    sendTest('violet-test-ping');
    setTimeout(() => sendTest('violet-test-access'), 1000);
    setTimeout(() => sendTest('violet-enable-editing'), 2000);
    
    // Results after 5 seconds
    setTimeout(() => {
        console.log('\n📊 COMMUNICATION RESULTS:');
        console.log(`Messages sent: ${messagesSent}`);
        console.log(`Messages received: ${messagesReceived}`);
        console.log('Message log:', messageLog);
        
        if (messagesReceived === 0) {
            console.log('🚨 CRITICAL: No communication from React app');
            console.log('   Check: Iframe URL, CORS settings, React app loading');
        } else if (messagesReceived < messagesSent) {
            console.log('⚠️ WARNING: Partial communication');
            console.log('   Check: Message handlers in React app');
        } else {
            console.log('✅ GOOD: Communication working');
        }
        
        // Cleanup
        window.removeEventListener('message', messageListener);
    }, 5000);
}

window.debugCommunication = debugCommunication;
```

### **Edit Functionality Debug**
```javascript
// Test all editing functions
function debugEditFunctions() {
    console.log('✏️ EDIT FUNCTIONALITY DEBUG');
    console.log('============================');
    
    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.log('❌ No iframe - open Universal Editor first');
        return;
    }
    
    // Test edit button
    const editButton = document.getElementById('violet-enable-editing');
    if (editButton) {
        console.log('✅ Edit button found:', editButton.textContent);
        
        // Simulate click
        console.log('🖱️ Testing edit button click...');
        editButton.click();
        
        setTimeout(() => {
            const isActive = editButton.textContent.includes('Disable');
            console.log(`Edit mode active: ${isActive ? '✅' : '❌'}`);
        }, 1000);
    } else {
        console.log('❌ Edit button not found');
    }
    
    // Test save button
    setTimeout(() => {
        const saveButton = document.getElementById('violet-save-all');
        if (saveButton) {
            const isVisible = saveButton.style.display !== 'none';
            console.log(`Save button: ${isVisible ? '✅ Visible' : '❌ Hidden'}`);
        } else {
            console.log('❌ Save button not found');
        }
    }, 2000);
    
    // Test iframe content access
    setTimeout(() => {
        try {
            if (iframe.contentDocument) {
                const editableElements = iframe.contentDocument.querySelectorAll('[data-violet-field]');
                console.log(`✅ Editable elements found: ${editableElements.length}`);
                
                editableElements.forEach((el, i) => {
                    if (i < 5) { // Show first 5
                        console.log(`   ${i + 1}. ${el.dataset.violetField}: "${el.textContent.slice(0, 30)}..."`);
                    }
                });
            } else {
                console.log('⚠️ Cannot access iframe content (CORS) - normal for cross-origin');
            }
        } catch (error) {
            console.log('⚠️ Iframe access blocked (normal):', error.message);
        }
    }, 3000);
}

window.debugEditFunctions = debugEditFunctions;
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: "Uncaught SyntaxError" in Console**
**Symptoms:** JavaScript errors prevent editing system from loading  
**Common Causes:**
- Modern JavaScript syntax in older browsers
- Corrupted functions.php file
- Plugin conflicts

**Diagnostic Steps:**
```javascript
// Check for syntax errors
try {
    console.log('Testing JavaScript syntax...');
    // Run basic functions
    if (typeof violetSaveAllChanges === 'function') {
        console.log('✅ Main functions loaded');
    } else {
        console.log('❌ Main functions missing');
    }
} catch (error) {
    console.log('❌ Syntax error detected:', error.message);
}
```

**Solutions:**
1. **Replace functions.php** with known working version
2. **Check browser compatibility** (Chrome 90+, Firefox 88+, Safari 14+)
3. **Disable other plugins** temporarily
4. **Clear browser cache** and try again

### **Issue 2: Iframe Shows "Refused to Connect"**
**Symptoms:** White iframe or connection error message  
**Common Causes:**
- Incorrect iframe URL
- CORS/X-Frame-Options blocking
- Netlify site down

**Diagnostic Steps:**
```javascript
// Check iframe configuration
const iframe = document.getElementById('violet-site-iframe');
if (iframe) {
    console.log('Iframe URL:', iframe.src);
    console.log('Expected: https://lustrous-dolphin-447351.netlify.app');
    
    // Test direct access
    fetch(iframe.src.split('?')[0])
        .then(r => console.log('Direct access:', r.status))
        .catch(e => console.log('Access failed:', e.message));
}
```

**Solutions:**
1. **Check Netlify status:** https://www.netlifystatus.com/
2. **Verify CORS settings** in functions.php
3. **Update iframe URL** if Netlify domain changed
4. **Test direct site access** in new tab

### **Issue 3: Edit Mode Doesn't Activate**
**Symptoms:** No blue outlines appear, elements not clickable  
**Common Causes:**
- React app not responding to messages
- JavaScript errors in React app
- PostMessage communication blocked

**Diagnostic Steps:**
```javascript
// Test edit mode activation
function testEditMode() {
    const iframe = document.getElementById('violet-site-iframe');
    console.log('Testing edit mode activation...');
    
    // Send enable editing message
    iframe.contentWindow.postMessage({
        type: 'violet-enable-editing',
        timestamp: Date.now()
    }, '*');
    
    // Check for response
    const listener = (event) => {
        if (event.data?.type === 'violet-editing-activated') {
            console.log('✅ Edit mode activated successfully');
        }
    };
    
    window.addEventListener('message', listener);
    setTimeout(() => window.removeEventListener('message', listener), 5000);
}

testEditMode();
```

**Solutions:**
1. **Check React app console** for JavaScript errors
2. **Refresh iframe** and try again
3. **Check Netlify deploy logs** for build errors
4. **Verify edit mode parameters** in iframe URL

### **Issue 4: Changes Don't Save**
**Symptoms:** Save button works but changes don't persist  
**Common Causes:**
- REST API endpoint issues
- WordPress permissions
- Database connection problems

**Diagnostic Steps:**
```javascript
// Test save functionality
function testSaveFunction() {
    const testData = {
        changes: [{
            field_name: 'test_field',
            field_value: 'test_value_' + Date.now()
        }]
    };
    
    console.log('Testing save function...');
    
    fetch('/wp-json/violet/v1/content/save-batch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wpApiSettings ? wpApiSettings.nonce : 'test'
        },
        body: JSON.stringify(testData)
    })
    .then(r => r.json())
    .then(data => {
        console.log('Save test result:', data);
        if (data.success) {
            console.log('✅ Save functionality working');
        } else {
            console.log('❌ Save failed:', data.message);
        }
    })
    .catch(error => {
        console.log('❌ Save request failed:', error.message);
    });
}

testSaveFunction();
```

**Solutions:**
1. **Check WordPress user permissions** (edit_posts capability)
2. **Verify REST API endpoints** are registered
3. **Check database connectivity** via WordPress dashboard
4. **Test with simple content** first

---

## 🔧 Advanced Debugging Tools

### **Network Traffic Analysis**
```javascript
// Monitor all network requests
function monitorNetworkTraffic() {
    console.log('📡 MONITORING NETWORK TRAFFIC');
    console.log('==============================');
    
    // Override fetch to log requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        console.log(`🔗 Fetch request: ${args[0]}`);
        return originalFetch.apply(this, args)
            .then(response => {
                console.log(`📨 Response: ${response.status} ${response.statusText}`);
                return response;
            })
            .catch(error => {
                console.log(`❌ Fetch error: ${error.message}`);
                throw error;
            });
    };
    
    console.log('✅ Network monitoring active');
    console.log('To disable: location.reload()');
}

window.monitorNetworkTraffic = monitorNetworkTraffic;
```

### **Performance Profiling**
```javascript
// Measure system performance
function profilePerformance() {
    console.log('⚡ PERFORMANCE PROFILING');
    console.log('========================');
    
    const startTime = performance.now();
    let metrics = {
        pageLoad: 0,
        iframeLoad: 0,
        editActivation: 0,
        saveOperation: 0
    };
    
    // Measure iframe load time
    const iframe = document.getElementById('violet-site-iframe');
    if (iframe) {
        iframe.onload = function() {
            metrics.iframeLoad = performance.now() - startTime;
            console.log(`📊 Iframe load time: ${metrics.iframeLoad.toFixed(2)}ms`);
        };
    }
    
    // Measure edit activation time
    const editButton = document.getElementById('violet-enable-editing');
    if (editButton) {
        editButton.addEventListener('click', function() {
            const editStart = performance.now();
            setTimeout(() => {
                metrics.editActivation = performance.now() - editStart;
                console.log(`📊 Edit activation time: ${metrics.editActivation.toFixed(2)}ms`);
            }, 1000);
        });
    }
    
    // Measure save operation time
    const saveButton = document.getElementById('violet-save-all');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const saveStart = performance.now();
            // Monitor for save completion
            const checkSave = setInterval(() => {
                if (saveButton.style.display === 'none') {
                    metrics.saveOperation = performance.now() - saveStart;
                    console.log(`📊 Save operation time: ${metrics.saveOperation.toFixed(2)}ms`);
                    clearInterval(checkSave);
                }
            }, 100);
        });
    }
    
    return metrics;
}

window.profilePerformance = profilePerformance;
```

### **Memory Usage Monitoring**
```javascript
// Monitor memory usage during editing sessions
function monitorMemoryUsage() {
    console.log('💾 MEMORY USAGE MONITORING');
    console.log('==========================');
    
    if (performance.memory) {
        const logMemory = () => {
            const memory = performance.memory;
            console.log('Memory Usage:');
            console.log(`  Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`  Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`  Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
        };
        
        logMemory();
        
        // Monitor every 30 seconds
        const interval = setInterval(logMemory, 30000);
        
        console.log('✅ Memory monitoring active');
        console.log('To stop: clearInterval(' + interval + ')');
        
        return interval;
    } else {
        console.log('❌ Memory monitoring not available in this browser');
    }
}

window.monitorMemoryUsage = monitorMemoryUsage;
```

---

## 📋 Debugging Checklists

### **New Issue Checklist**
```
□ Can reproduce the issue consistently?
□ Does issue occur in different browsers?
□ Is issue present in WordPress admin and/or React frontend?
□ Any JavaScript errors in browser console?
□ Has anything changed recently (code, plugins, settings)?
□ Is the issue affecting one user or all users?
□ Does issue persist after clearing browser cache?
□ Are there any network errors in browser DevTools?
```

### **System Recovery Checklist**
```
□ WordPress admin accessible?
□ WordPress REST API responding?
□ Netlify site loading correctly?
□ Functions.php properly uploaded?
□ Universal Editor menu visible?
□ Iframe loading without errors?
□ PostMessage communication working?
□ Save functionality operational?
```

### **Performance Issue Checklist**
```
□ Page load time under 3 seconds?
□ Edit activation under 1 second?
□ Save operation under 2 seconds?
□ No memory leaks during extended use?
□ Network requests completing successfully?
□ Browser console free of errors?
□ CPU usage reasonable during editing?
□ Mobile device performance acceptable?
```

---

## 🚨 Emergency Contacts & Escalation

### **Hosting Issues**
- **WP Engine Support:** https://my.wpengine.com/support
- **Netlify Support:** https://www.netlify.com/support/

### **Development Issues**
- **GitHub Repository:** https://github.com/Kr8thor/violet-electric-web/issues
- **Project Documentation:** PROJECT_KNOWLEDGE_INSTRUCTIONS.md

### **Emergency Procedures**
1. **Document the issue** with screenshots and console errors
2. **Try quick fixes** from this guide first
3. **Check service status** for all platforms
4. **Contact appropriate support** based on issue type
5. **Escalate to development team** if custom code issue

---

*Last Updated: January 2025*  
*For User-Friendly Guide: See USER_GUIDE_CONTENT_EDITING.md*  
*For Complete Project Info: See PROJECT_KNOWLEDGE_INSTRUCTIONS.md*