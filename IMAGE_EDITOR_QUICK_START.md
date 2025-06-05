# 🖼️ Image Editor Addition - Quick Start Guide for New Chat

## 📋 Copy This Context for New Chat:

"I have a WordPress-Netlify integration with a working rich text editor that includes:
- Floating toolbar for text formatting (bold, italic, fonts, colors, alignment)
- Auto-save functionality via postMessage
- Edit mode toggle
- Files located at: C:\Users\Leo\violet-electric-web

I need to add image editing capabilities to this existing editor. The current implementation uses:
- WordPressRichEditor.tsx as the main editor component
- EditorToolbar.tsx for the text formatting toolbar
- PostMessage communication between WordPress iframe and React app
- WordPress REST API endpoints for saving content

Please add image editing features including:
1. Click images to show editing toolbar
2. Resize images by dragging corners
3. Upload/replace images
4. Edit alt text and captions
5. Image alignment options
6. Basic image filters/effects"

## 🎯 Current Implementation Details

### Working Files:
- `src/components/WordPressRichEditor.tsx` - Main editor with text selection
- `src/components/EditorToolbar.tsx` - Floating toolbar component
- `src/components/WordPressEditor.css` - All editor styles
- `src/App.tsx` - Includes both WordPressEditor and WordPressRichEditor

### Working Features:
- ✅ Text becomes editable with contentEditable
- ✅ Text selection shows floating toolbar
- ✅ Formatting saves via postMessage to WordPress
- ✅ Visual feedback on save (green border)
- ✅ Keyboard shortcuts (Ctrl+B, I, U)

### WordPress Integration:
- Admin URL: https://wp.violetrainwater.com/wp-admin/
- REST endpoints: /wp-json/violet/v1/content/rich
- PostMessage types: violet-save-content, violet-enable-editing, etc.
- Auto-rebuild on save via Netlify webhook

## 🔧 Image Editor Requirements

### Phase 1: Basic Image Interaction
```typescript
// Add to enableEditMode() in WordPressRichEditor.tsx:
document.querySelectorAll('img').forEach((img) => {
  img.dataset.violetEditable = 'true';
  img.classList.add('violet-editable-image');
  img.addEventListener('click', handleImageClick);
});
```

### Phase 2: Image Toolbar Component
Create `ImageEditorToolbar.tsx` with:
- Upload button
- Width/height inputs
- Alignment buttons (left/center/right)
- Alt text field
- Remove button

### Phase 3: Resize Handles
Add 8 resize handles (corners + sides) that appear on image selection

### Phase 4: WordPress Integration
Add image upload endpoint to handle WordPress Media Library uploads

## 💻 Key Code Patterns to Follow

### 1. Toolbar Positioning (same as text toolbar):
```typescript
const rect = image.getBoundingClientRect();
setToolbarPosition({
  top: rect.top - 60 + window.scrollY,
  left: rect.left + (rect.width / 2) + window.scrollX
});
```

### 2. PostMessage Pattern:
```typescript
window.parent.postMessage({
  type: 'violet-image-update',
  data: {
    src: newImageUrl,
    alt: altText,
    width: width,
    height: height
  }
}, '*');
```

### 3. Save Pattern:
```typescript
// Same auto-save approach as text
const handleImageChange = (updates) => {
  saveToWordPress(updates);
  showVisualFeedback();
};
```

## 🎨 Required CSS Classes

```css
.violet-editable-image { cursor: pointer; transition: all 0.2s; }
.violet-editable-image:hover { outline: 2px dashed #0073aa; }
.violet-image-toolbar { /* Similar to .violet-editor-toolbar */ }
.resize-handle { position: absolute; width: 10px; height: 10px; }
```

## 🚀 Implementation Order

1. **Day 1 Morning**: Image click detection and basic toolbar
2. **Day 1 Afternoon**: Upload functionality and WordPress integration  
3. **Day 2 Morning**: Resize handles and drag functionality
4. **Day 2 Afternoon**: Alt text, alignment, and polish

## 📝 WordPress Functions to Add

```php
// Add to functions.php:
register_rest_route('violet/v1', '/image/upload', [...]);
register_rest_route('violet/v1', '/image/metadata', [...]);
```

## ✅ Success Metrics

- Images respond to clicks in edit mode
- Toolbar appears above selected images
- Upload replaces images successfully
- Resize maintains aspect ratio
- Alt text saves and persists
- Works on mobile devices
- No console errors
- Integrates seamlessly with text editing

## 💡 Quick Tips

1. Reuse the EditorToolbar.tsx pattern for ImageEditorToolbar.tsx
2. Use the same floating toolbar CSS with image-specific controls
3. Keep the same postMessage communication pattern
4. Use WordPress Media Library API for uploads
5. Test with various image sizes and formats

---

**Time Estimate**: 2 days for full implementation
**Priority**: Start with click detection and toolbar, then add features incrementally