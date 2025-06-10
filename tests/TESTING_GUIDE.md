# WordPress-React Content Persistence Testing & Fix Guide

## 🔍 Complete Testing Suite Created

I've created a comprehensive testing suite to diagnose and fix your WordPress-React content persistence issues. Here's what's available:

### 1. **Visual Debugger** (`tests/content-debugger.html`)
A beautiful, interactive debugging interface that:
- Shows real-time status of all system components
- Compares content across WordPress API, localStorage, and React components
- Provides one-click testing actions
- Displays detailed logs

**Usage:**
```javascript
// In your React app, create a new route or component:
import ContentDebugger from '../tests/content-debugger.html';

// Or inject it via browser console:
fetch('/tests/content-debugger.html')
  .then(r => r.text())
  .then(html => {
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);
  });
```

### 2. **Browser Console Test** (`tests/browser-console-test.js`)
Quick tests you can run directly in the browser console:
```javascript
// Load and run the test
fetch('/tests/browser-console-test.js')
  .then(r => r.text())
  .then(eval);
```

### 3. **Content Flow Test** (`tests/content-flow-test.js`)
Comprehensive test that verifies the entire content flow:
```javascript
// Run in console
fetch('/tests/content-flow-test.js')
  .then(r => r.text())
  .then(eval);
```

### 4. **Violet Debugger** (`src/utils/violetDebugger.ts`)
A powerful debugging utility with a floating panel:
```javascript
// Import in your app
import VioletDebugger from '@/utils/violetDebugger';

// Or load dynamically
import('@/utils/violetDebugger').then(() => {
  window.VioletDebugger.showPanel();
});
```

## 🔧 Common Issues & Solutions

### Issue 1: Content Saves to WordPress but Components Don't Update

**Symptoms:**
- WordPress API shows correct content ✅
- localStorage has the content ✅
- Components still show old values ❌

**Solution:**
```javascript
// In your EditableText component, ensure it subscribes to updates:
useEffect(() => {
  const handleUpdate = () => {
    // Force re-render
    setKey(prev => prev + 1);
  };
  
  window.addEventListener('violet-content-updated', handleUpdate);
  window.addEventListener('violet-force-component-update', handleUpdate);
  
  return () => {
    window.removeEventListener('violet-content-updated', handleUpdate);
    window.removeEventListener('violet-force-component-update', handleUpdate);
  };
}, []);
```

### Issue 2: ContentContext Not Updating

**Symptoms:**
- Context receives the message but doesn't trigger re-renders

**Solution:**
```javascript
// In ContentContext.tsx, add a force update mechanism:
const [updateTrigger, setUpdateTrigger] = useState(0);

const updateContent = useCallback((updates: Partial<VioletContent>) => {
  setContent(prev => ({ ...prev, ...updates }));
  setUpdateTrigger(prev => prev + 1); // Force re-render
}, []);

// Include updateTrigger in the context value
const value = useMemo(() => ({
  content,
  getField,
  updateContent,
  // This ensures components re-render
  _trigger: updateTrigger
}), [content, updateTrigger]);
```

### Issue 3: Message Handling Not Working

**Symptoms:**
- WordPress sends the message but React doesn't receive it

**Solution:**
Check the message origin in your listener:
```javascript
window.addEventListener('message', (event) => {
  // Log all messages for debugging
  if (event.data && event.data.type) {
    console.log('Message received:', event.data.type, 'from:', event.origin);
  }
  
  // Handle violet messages from any origin during testing
  if (event.data && event.data.type === 'violet-apply-saved-changes') {
    handleWordPressSave(event.data.savedChanges);
  }
});
```

## 🚀 Quick Fix Steps

### Step 1: Test Current State
```javascript
// Run in browser console
VioletDebugger.compareContentSources();
```

### Step 2: Force Sync WordPress Content
```javascript
// This will pull WordPress content and update everything
VioletDebugger.autoFix();
```

### Step 3: Test Save Flow
```javascript
// Simulate a WordPress save
VioletDebugger.simulateSave('hero_title', 'Test Value ' + Date.now());

// Wait 2 seconds, then check
setTimeout(() => {
  VioletDebugger.checkComponentValues();
}, 2000);
```

### Step 4: If Components Still Don't Update
```javascript
// Force all components to re-render
window.dispatchEvent(new CustomEvent('violet-force-component-update'));

// Or reload with fresh content
location.reload();
```

## 📊 Expected Test Results

When everything is working correctly:

1. **WordPress API Test**: ✅ Returns content fields
2. **localStorage Test**: ✅ Contains synced content
3. **Component Test**: ✅ Shows saved values
4. **Message Test**: ✅ Receives and processes saves
5. **Context Test**: ✅ Updates trigger re-renders

## 🔍 Debugging Checklist

- [ ] Is the React app running in the WordPress iframe? Check URL params: `?edit_mode=1&wp_admin=1`
- [ ] Is the WordPress API accessible? Test: `fetch('/wp-json/violet/v1/content')`
- [ ] Is localStorage being updated? Check: `localStorage.getItem('violet-content')`
- [ ] Are components subscribed to updates? Check component event listeners
- [ ] Is the ContentProvider at the root of your app? Check App.tsx
- [ ] Are messages being received? Check browser console for message logs

## 💡 Pro Tips

1. **Always test in the WordPress iframe context** - Some features only work when `edit_mode=1`

2. **Use the visual debugger** - It provides real-time feedback on what's working

3. **Check the browser console** - All debug utilities log detailed information

4. **Force refresh after fixes** - Some changes require a page reload to take effect

5. **Monitor the network tab** - Ensure WordPress API calls are succeeding

## 🆘 Emergency Fix

If nothing else works, this will force update everything:

```javascript
// Nuclear option - forces complete resync
(async () => {
  // 1. Fetch fresh content from WordPress
  const response = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content');
  const content = await response.json();
  
  // 2. Save to localStorage
  localStorage.setItem('violet-content', JSON.stringify({
    version: 'v1',
    timestamp: Date.now(),
    content: content
  }));
  
  // 3. Dispatch all update events
  window.dispatchEvent(new CustomEvent('violet-content-updated', { detail: content }));
  window.dispatchEvent(new CustomEvent('violet-content-synced', { detail: { content } }));
  window.dispatchEvent(new CustomEvent('violet-force-component-update'));
  
  // 4. Reload the page
  setTimeout(() => location.reload(), 1000);
})();
```

## 📱 Mobile Testing

The debugger works on mobile too! Just load it in your mobile browser:

```javascript
// Create a bookmarklet for easy mobile access
javascript:(function(){
  const s = document.createElement('script');
  s.src = '/tests/browser-console-test.js';
  document.body.appendChild(s);
})();
```

---

**Remember:** The key to fixing content persistence is ensuring the entire chain works:
1. WordPress saves content ✅
2. React receives the message ✅
3. Content is stored locally ✅
4. Components are notified ✅
5. Components re-render with new content ✅

Use the testing tools to identify which link in the chain is broken!