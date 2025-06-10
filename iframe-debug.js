// Debug script for WordPress iframe issue
(function() {
    console.log('🔍 Violet Debug: Script starting...');
    
    // Check if config exists
    if (window.violetConfig) {
        console.log('✅ Config found:', {
            netlifyAppUrl: window.violetConfig.netlifyAppUrl,
            netlifyAppBaseUrl: window.violetConfig.netlifyAppBaseUrl,
            netlifyOrigin: window.violetConfig.netlifyOrigin,
            allowedOrigins: window.violetConfig.allowedMessageOrigins
        });
    } else {
        console.error('❌ Config not found!');
    }
    
    // Wait for DOM and check iframe
    function checkIframe() {
        const iframe = document.getElementById('violet-site-iframe');
        if (iframe) {
            console.log('✅ Iframe found:', {
                src: iframe.src,
                style: iframe.style.cssText,
                parent: iframe.parentElement
            });
            
            // Check computed styles
            const computed = window.getComputedStyle(iframe);
            console.log('📐 Iframe computed styles:', {
                display: computed.display,
                visibility: computed.visibility,
                width: computed.width,
                height: computed.height,
                position: computed.position
            });
            
            // Check parent container
            const container = iframe.closest('.violet-preview-container-final');
            if (container) {
                const containerComputed = window.getComputedStyle(container);
                console.log('📦 Container computed styles:', {
                    display: containerComputed.display,
                    visibility: containerComputed.visibility,
                    width: containerComputed.width,
                    height: containerComputed.height,
                    overflow: containerComputed.overflow
                });
            }
            
            // Force iframe src if empty
            if (!iframe.src || iframe.src === 'about:blank' || iframe.src === window.location.href) {
                console.log('⚠️ Iframe src is empty or invalid, attempting to set it...');
                
                if (window.violetConfig && window.violetConfig.netlifyAppUrl) {
                    const dynamicWpOrigin = window.location.origin;
                    const queryString = 'edit_mode=1&wp_admin=1&t=' + new Date().getTime() + 
                                       '&wp_origin=' + encodeURIComponent(dynamicWpOrigin);
                    const newSrc = window.violetConfig.netlifyAppUrl + '?' + queryString;
                    
                    console.log('🔧 Setting iframe src to:', newSrc);
                    iframe.src = newSrc;
                    
                    // Monitor iframe loading
                    iframe.onload = function() {
                        console.log('✅ Iframe loaded successfully!');
                        // Check if content is visible
                        try {
                            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                            console.log('📄 Iframe document ready:', !!iframeDoc);
                        } catch (e) {
                            console.log('🔒 Cross-origin iframe - cannot access content (this is normal)');
                        }
                    };
                    
                    iframe.onerror = function() {
                        console.error('❌ Iframe failed to load!');
                    };
                } else {
                    console.error('❌ Cannot set iframe src - config.netlifyAppUrl is missing!');
                }
            }
        } else {
            console.error('❌ Iframe not found!');
        }
    }
    
    // Run checks
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkIframe);
    } else {
        // Small delay to ensure everything is initialized
        setTimeout(checkIframe, 500);
    }
    
    // Also expose debug function globally
    window.violetDebugIframe = checkIframe;
    
    console.log('💡 You can run violetDebugIframe() at any time to check the iframe status');
})();
