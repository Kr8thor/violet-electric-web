# 🚀 WordPress-React Content Persistence - Quick Test Reference

## Copy & Paste This Into Browser Console:

```javascript
// QUICK TEST - Run this first!
fetch('/tests/quick-test.js').then(r => r.text()).then(eval);
```

## If Test Shows "PARTIAL" (Content saves but UI doesn't update):

### Fix Option 1 - Immediate Workaround:
```javascript
// Add auto-refresh after save
localStorage.setItem('violet-auto-refresh', 'true');
window.addEventListener('message', (e) => {
  if (e.data.type === 'violet-apply-saved-changes') {
    setTimeout(() => location.reload(), 500);
  }
});
```

### Fix Option 2 - Force Component Updates:
```javascript
// Run this after save to force update
window.dispatchEvent(new CustomEvent('violet-force-component-update'));
```

## Visual Debugger:
```javascript
// Load beautiful debug interface
window.open('/tests/content-debugger.html', '_blank');
```

## Advanced Debug Panel:
```javascript
// Load floating debug panel
const s = document.createElement('script');
s.type = 'module';
s.textContent = `
  import VioletDebugger from '/src/utils/violetDebugger.js';
  window.VioletDebugger = VioletDebugger;
  VioletDebugger.showPanel();
`;
document.head.appendChild(s);
```

## Manual Content Update:
```javascript
// Update any field manually
const update = (field, value) => {
  const data = JSON.parse(localStorage.getItem('violet-content') || '{}');
  const content = data.content || data;
  content[field] = value;
  localStorage.setItem('violet-content', JSON.stringify({
    version: 'v1',
    timestamp: Date.now(),
    content: content
  }));
  window.dispatchEvent(new CustomEvent('violet-content-updated', { detail: content }));
};

// Example:
update('hero_title', 'My New Title');
location.reload();
```

## Check All Content:
```javascript
// See what's in each system
console.table({
  WordPress: await fetch('/wp-json/violet/v1/content').then(r => r.json()),
  LocalStorage: JSON.parse(localStorage.getItem('violet-content') || '{}').content,
  Components: Array.from(document.querySelectorAll('[data-violet-field]')).reduce((acc, el) => {
    acc[el.dataset.violetField] = el.textContent;
    return acc;
  }, {})
});
```

---
**Start with the QUICK TEST - it tells you exactly what's wrong in seconds!**