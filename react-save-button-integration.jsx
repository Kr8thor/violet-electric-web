// ============================================================================
// REACT APP INTEGRATION FOR SAVE BUTTON FIX
// Add this to your React app to work with the fixed save button
// ============================================================================

import React, { useEffect, useState, createContext, useContext } from 'react';

// Content Context for managing saved content
const VioletContentContext = createContext();

// Content Provider Component
export function VioletContentProvider({ children }) {
    const [content, setContent] = useState(() => {
        // Initialize with localStorage content
        try {
            const saved = localStorage.getItem('violet-content');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('Error loading violet content:', e);
            return {};
        }
    });

    useEffect(() => {
        // Listen for save messages from WordPress admin
        const handleMessage = (event) => {
            // Security check - only accept from WordPress origins
            const allowedOrigins = [
                'https://wp.violetrainwater.com',
                'https://violetrainwater.com'
            ];
            
            const isValidOrigin = allowedOrigins.some(origin => 
                event.origin === origin || event.origin.includes(origin.replace('https://', ''))
            );
            
            if (!isValidOrigin) {
                return;
            }

            if (event.data.type === 'violet-save-content') {
                console.log('✅ Received saved content from WordPress:', event.data.content);
                
                setContent(prevContent => {
                    const newContent = { ...prevContent, ...event.data.content };
                    // Persist to localStorage
                    localStorage.setItem('violet-content', JSON.stringify(newContent));
                    return newContent;
                });

                // Show success notification
                showNotification('✅ Content updated successfully!', 'success');
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const getContent = (fieldName, defaultValue) => {
        return content[fieldName] || defaultValue;
    };

    const setContent = (fieldName, value) => {
        setContent(prevContent => {
            const newContent = { ...prevContent, [fieldName]: value };
            localStorage.setItem('violet-content', JSON.stringify(newContent));
            return newContent;
        });
    };

    return (
        <VioletContentContext.Provider value={{ content, getContent, setContent }}>
            {children}
        </VioletContentContext.Provider>
    );
}

// Hook to use content in components
export function useVioletContent() {
    const context = useContext(VioletContentContext);
    if (!context) {
        throw new Error('useVioletContent must be used within VioletContentProvider');
    }
    return context;
}

// Simple hook for direct localStorage access (alternative approach)
export function useVioletContentSimple() {
    const [content, setContentState] = useState(() => {
        try {
            const saved = localStorage.getItem('violet-content');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.type === 'violet-save-content') {
                const newContent = { ...content, ...event.data.content };
                localStorage.setItem('violet-content', JSON.stringify(newContent));
                setContentState(newContent);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [content]);

    const getContent = (fieldName, defaultValue) => {
        return content[fieldName] || defaultValue;
    };

    return { content, getContent };
}

// Notification helper function
function showNotification(message, type) {
    const notif = document.createElement('div');
    notif.innerHTML = message;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00a32a' : '#d63939'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 10000;
        font-weight: 700;
        box-shadow: 0 6px 25px rgba(0,0,0,0.4);
        max-width: 350px;
        font-size: 14px;
        animation: slideInRight 0.4s ease-out;
    `;
    
    // Add animation styles if not present
    if (!document.getElementById('violet-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'violet-notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notif);
    setTimeout(() => {
        if (document.body.contains(notif)) {
            notif.style.animation = 'slideInRight 0.4s ease-out reverse';
            setTimeout(() => {
                if (document.body.contains(notif)) {
                    document.body.removeChild(notif);
                }
            }, 400);
        }
    }, 4000);
}

// ============================================================================
// COMPONENT EXAMPLES - UPDATE YOUR COMPONENTS LIKE THIS
// ============================================================================

// Example 1: Using Context Provider (Recommended)
function App() {
    return (
        <VioletContentProvider>
            <div className="app">
                <Header />
                <Hero />
                <Contact />
                <Footer />
            </div>
        </VioletContentProvider>
    );
}

// Example 2: Hero Component with Dynamic Content
function Hero() {
    const { getContent } = useVioletContent();

    return (
        <section className="hero bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
            <div className="container mx-auto px-4 text-center">
                <h1 
                    className="text-5xl font-bold mb-6" 
                    data-violet-field="hero_title"
                >
                    {getContent('hero_title', 'Transform Your Digital Presence')}
                </h1>
                <p 
                    className="text-xl mb-8 max-w-2xl mx-auto" 
                    data-violet-field="hero_subtitle"
                >
                    {getContent('hero_subtitle', 'We create beautiful, responsive websites that help your business grow and connect with customers.')}
                </p>
                <button 
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    data-violet-field="hero_cta"
                >
                    {getContent('hero_cta', 'Get Started Today')}
                </button>
            </div>
        </section>
    );
}

// Example 3: Contact Component with Dynamic Content
function Contact() {
    const { getContent } = useVioletContent();

    return (
        <section className="contact py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">Get In Touch</h2>
                <div className="max-w-md mx-auto text-center">
                    <div className="mb-4">
                        <a 
                            href={`mailto:${getContent('contact_email', 'hello@example.com')}`}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                            data-violet-field="contact_email"
                        >
                            {getContent('contact_email', 'hello@violetrainwater.com')}
                        </a>
                    </div>
                    <div>
                        <a 
                            href={`tel:${getContent('contact_phone', '+1234567890')}`}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                            data-violet-field="contact_phone"
                        >
                            {getContent('contact_phone', '+1 (555) 123-4567')}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Example 4: Simple Component without Context (Alternative)
function SimpleHero() {
    const { getContent } = useVioletContentSimple();

    return (
        <h1 data-violet-field="hero_title">
            {getContent('hero_title', 'Default Hero Title')}
        </h1>
    );
}

// Example 5: Direct localStorage Component (Simplest)
function DirectContentComponent() {
    const getContent = (field, defaultValue) => {
        try {
            const saved = localStorage.getItem('violet-content');
            if (saved) {
                const content = JSON.parse(saved);
                return content[field] || defaultValue;
            }
        } catch (e) {
            console.error('Error loading content:', e);
        }
        return defaultValue;
    };

    return (
        <div>
            <h1 data-violet-field="hero_title">
                {getContent('hero_title', 'Default Title')}
            </h1>
            <p data-violet-field="hero_subtitle">
                {getContent('hero_subtitle', 'Default subtitle')}
            </p>
        </div>
    );
}

// ============================================================================
// TYPESCRIPT DEFINITIONS (Optional)
// ============================================================================

interface VioletContent {
    [key: string]: string;
}

interface VioletContentContextType {
    content: VioletContent;
    getContent: (fieldName: string, defaultValue: string) => string;
    setContent: (fieldName: string, value: string) => void;
}

// ============================================================================
// USAGE INSTRUCTIONS
// ============================================================================

/*
HOW TO USE:

1. ADD TO YOUR MAIN APP COMPONENT:
   - Wrap your app with <VioletContentProvider>
   - Import useVioletContent in components that need dynamic content

2. UPDATE YOUR COMPONENTS:
   - Replace hardcoded text with getContent('field_name', 'default_value')
   - Keep data-violet-field attributes for editing to work

3. IMPORTANT ATTRIBUTES:
   - Always include data-violet-field="field_name" on editable elements
   - Use consistent field names (hero_title, hero_subtitle, contact_email, etc.)

4. FIELD NAMING CONVENTIONS:
   - hero_title, hero_subtitle, hero_cta
   - contact_email, contact_phone
   - navigation_item, footer_text
   - Any custom field names you prefer

5. THE SAVE BUTTON WILL NOW:
   ✅ Save to WordPress database
   ✅ Send changes to React app via postMessage
   ✅ Store in localStorage for persistence
   ✅ Update components immediately
   ✅ Survive page refreshes

EXAMPLE IMPLEMENTATION:

// App.jsx
import { VioletContentProvider } from './VioletContent';

function App() {
    return (
        <VioletContentProvider>
            <Header />
            <Hero />
            <Contact />
        </VioletContentProvider>
    );
}

// Hero.jsx
import { useVioletContent } from './VioletContent';

function Hero() {
    const { getContent } = useVioletContent();
    
    return (
        <h1 data-violet-field="hero_title">
            {getContent('hero_title', 'Default Hero Title')}
        </h1>
    );
}

That's it! Your save button will now work perfectly.
*/