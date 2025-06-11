/**
 * 🔧 TEXT DIRECTION FIX - WordPress Admin
 * 
 * Add this to WordPress Admin Console to fix RTL text direction issues:
 * 1. Go to WordPress Admin
 * 2. Open browser console (F12)
 * 3. Paste this entire script
 * 4. Enable editing mode
 */

console.log('🔧 FIXING TEXT DIRECTION ISSUES');
console.log('================================');

// Fix 1: Ensure all editable elements use LTR direction
function fixTextDirection() {
    console.log('📝 Applying text direction fixes...');
    
    // Add global CSS for text direction
    const style = document.createElement('style');
    style.id = 'violet-text-direction-fix';
    style.textContent = `
        /* Fix text direction for all editable elements */
        [contenteditable="true"],
        [data-violet-field],
        .violet-editable-element,
        input[type="text"],
        textarea,
        [role="textbox"] {
            direction: ltr !important;
            text-align: left !important;
            unicode-bidi: normal !important;
        }
        
        /* Fix prompt/modal inputs */
        input[type="text"]:focus,
        textarea:focus,
        [contenteditable="true"]:focus {
            direction: ltr !important;
            text-align: left !important;
        }
        
        /* Fix any RTL overrides */
        * {
            direction: ltr !important;
        }
        
        /* Specific fixes for contentEditable */
        [contenteditable] * {
            direction: ltr !important;
            text-align: inherit !important;
        }
        
        /* WordPress admin specific fixes */
        .wp-admin [contenteditable],
        .wp-admin input[type="text"],
        .wp-admin textarea {
            direction: ltr !important;
            text-align: left !important;
        }
    `;
    
    document.head.appendChild(style);
    console.log('✅ Text direction CSS applied');
}

// Fix 2: Override prompt/modal text direction
function fixPromptDirection() {
    console.log('💬 Fixing prompt/modal text direction...');
    
    // Override the built-in prompt function
    const originalPrompt = window.prompt;
    window.prompt = function(message, defaultText) {
        // Use a custom modal instead of built-in prompt
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 90%;
        `;
        
        const messageEl = document.createElement('p');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            margin-bottom: 20px;
            font-size: 16px;
            color: #333;
            direction: ltr !important;
            text-align: left !important;
        `;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = defaultText || '';
        input.style.cssText = `
            width: 100%;
            padding: 12px;
            font-size: 16px;
            border: 2px solid #ddd;
            border-radius: 6px;
            margin-bottom: 20px;
            direction: ltr !important;
            text-align: left !important;
            unicode-bidi: normal !important;
        `;
        
        const buttons = document.createElement('div');
        buttons.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        `;
        
        const okBtn = document.createElement('button');
        okBtn.textContent = 'OK';
        okBtn.style.cssText = `
            padding: 10px 20px;
            background: #0073aa;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        `;
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.cssText = `
            padding: 10px 20px;
            background: #666;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        `;
        
        return new Promise((resolve) => {
            okBtn.onclick = () => {
                resolve(input.value);
                document.body.removeChild(modal);
            };
            
            cancelBtn.onclick = () => {
                resolve(null);
                document.body.removeChild(modal);
            };
            
            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    resolve(input.value);
                    document.body.removeChild(modal);
                } else if (e.key === 'Escape') {
                    resolve(null);
                    document.body.removeChild(modal);
                }
            };
            
            buttons.appendChild(okBtn);
            buttons.appendChild(cancelBtn);
            dialog.appendChild(messageEl);
            dialog.appendChild(input);
            dialog.appendChild(buttons);
            modal.appendChild(dialog);
            document.body.appendChild(modal);
            
            // Focus and select all text
            setTimeout(() => {
                input.focus();
                input.select();
            }, 100);
        });
    };
    
    console.log('✅ Prompt direction override installed');
}

// Fix 3: Monitor and fix iframe content
function fixIframeContent() {
    console.log('🖼️ Setting up iframe content monitoring...');
    
    const iframe = document.getElementById('violet-site-iframe');
    if (!iframe) {
        console.log('⚠️ Iframe not found yet');
        return;
    }
    
    const observer = new MutationObserver(() => {
        try {
            if (iframe.contentDocument) {
                const iframeDoc = iframe.contentDocument;
                
                // Apply text direction fix to iframe
                let iframeStyle = iframeDoc.getElementById('violet-iframe-text-fix');
                if (!iframeStyle) {
                    iframeStyle = iframeDoc.createElement('style');
                    iframeStyle.id = 'violet-iframe-text-fix';
                    iframeStyle.textContent = `
                        * {
                            direction: ltr !important;
                        }
                        [contenteditable="true"],
                        [data-violet-field],
                        input, textarea {
                            direction: ltr !important;
                            text-align: left !important;
                            unicode-bidi: normal !important;
                        }
                    `;
                    iframeDoc.head.appendChild(iframeStyle);
                    console.log('✅ Iframe text direction fixed');
                }
            }
        } catch (e) {
            // Cross-origin restrictions - expected
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}

// Fix 4: Override edit functions to ensure LTR
function fixEditFunctions() {
    console.log('✏️ Overriding edit functions...');
    
    // Store original functions
    const originalTextEdit = window.violetEditText || function() {};
    const originalImageEdit = window.violetEditImage || function() {};
    
    // Override with LTR fixes
    window.violetEditText = function(data) {
        setTimeout(() => {
            const inputs = document.querySelectorAll('input[type="text"], textarea');
            inputs.forEach(input => {
                input.style.direction = 'ltr';
                input.style.textAlign = 'left';
                input.style.unicodeBidi = 'normal';
            });
        }, 100);
        
        return originalTextEdit(data);
    };
    
    console.log('✅ Edit functions overridden with LTR fixes');
}

// Apply all fixes
function applyAllFixes() {
    console.log('🚀 Applying all text direction fixes...');
    
    fixTextDirection();
    fixPromptDirection();
    fixIframeContent();
    fixEditFunctions();
    
    console.log('✅ ALL TEXT DIRECTION FIXES APPLIED!');
    console.log('\n📋 TESTING:');
    console.log('1. Enable editing mode');
    console.log('2. Click any text element');
    console.log('3. Text should now type left-to-right');
    console.log('4. If issues persist, refresh page and run this script again');
}

// Auto-apply fixes
applyAllFixes();

// Make function available globally
window.fixTextDirection = applyAllFixes;

console.log('\n🛠️ HELPER FUNCTION AVAILABLE:');
console.log('fixTextDirection() - Re-apply all fixes');
