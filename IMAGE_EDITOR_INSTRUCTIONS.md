# 🖼️ Image Editor Addition - Instructions for New Chat

## 📋 Project Context
**Current Status**: WordPress-Netlify integration with working rich text editor that has formatting toolbar (bold, italic, fonts, colors, alignment).

**Goal**: Add professional image editing capabilities to the existing editor.

## 🎯 Image Editing Features to Implement

### Core Features:
1. **Click-to-Edit Images**
   - Blue outline on hover in edit mode
   - Click to show image toolbar
   - Drag corners to resize
   - Maintain aspect ratio

2. **Image Toolbar Options**
   - Upload/Replace image
   - Resize (width/height inputs)
   - Alignment (left/center/right)
   - Alt text editor
   - Caption editor
   - Link URL
   - Remove image
   - Crop tool

3. **Drag & Drop Upload**
   - Drop zones when dragging files
   - Multiple image support
   - Progress indicators
   - Auto-optimization

4. **Advanced Features**
   - Image filters (brightness, contrast, blur)
   - Border styles and radius
   - Shadow effects
   - Image gallery creation
   - Lazy loading setup

## 📁 Current File Structure

```
C:\Users\Leo\violet-electric-web\
├── src/
│   ├── components/
│   │   ├── WordPressRichEditor.tsx (Main editor - needs image detection)
│   │   ├── EditorToolbar.tsx (Text toolbar - working)
│   │   ├── WordPressEditor.tsx (Base editor - working)
│   │   └── WordPressEditor.css (Styles - has toolbar styles)
│   └── App.tsx (Includes both editors)
```

## 🔧 Files to Create/Modify

### 1. **New Components to Create**

#### `ImageEditorToolbar.tsx`
```typescript
// Floating toolbar specifically for images
interface ImageToolbarProps {
  image: HTMLImageElement;
  position: { top: number; left: number };
  onUpdate: (updates: ImageUpdates) => void;
  onReplace: (file: File) => void;
  onRemove: () => void;
}
```

#### `ImageResizeHandles.tsx`
```typescript
// Resize handles component
interface ResizeHandlesProps {
  element: HTMLElement;
  onResize: (width: number, height: number) => void;
  maintainAspectRatio: boolean;
}
```

#### `ImageUploadZone.tsx`
```typescript
// Drag & drop upload zones
interface UploadZoneProps {
  onUpload: (files: FileList) => void;
  accepts: string[]; // ['image/jpeg', 'image/png', etc]
}
```

### 2. **Modifications to Existing Files**

#### Update `WordPressRichEditor.tsx`:
- Add image detection in `enableEditMode()`
- Handle image click events
- Manage image toolbar state
- Add drag & drop listeners

#### Update `WordPressEditor.css`:
- Image editing styles
- Resize handle styles
- Upload zone styles
- Image toolbar styles

## 💻 Implementation Plan

### Phase 1: Basic Image Editing (Day 1)
```typescript
// In WordPressRichEditor.tsx, add to enableEditMode():

// Make images editable
document.querySelectorAll('img').forEach((img) => {
  if (!img.dataset.violetEditable) {
    img.dataset.violetEditable = 'true';
    img.style.cursor = 'pointer';
    img.classList.add('violet-editable-image');
    
    img.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showImageToolbar(img);
    });
    
    img.addEventListener('mouseenter', () => {
      if (editorState.isEditMode) {
        img.style.outline = '2px dashed #0073aa';
      }
    });
  }
});
```

### Phase 2: Image Toolbar (Day 1)
```typescript
// ImageEditorToolbar.tsx structure
const ImageEditorToolbar = ({ image, position, onUpdate }) => {
  const [width, setWidth] = useState(image.naturalWidth);
  const [height, setHeight] = useState(image.naturalHeight);
  const [altText, setAltText] = useState(image.alt);
  
  return (
    <div className="violet-image-toolbar" style={{ position, ...styles }}>
      {/* Upload button */}
      {/* Size inputs */}
      {/* Alignment buttons */}
      {/* Alt text input */}
      {/* Effects panel */}
    </div>
  );
};
```

### Phase 3: Resize Handles (Day 2)
```typescript
// Add resize handles on image selection
const addResizeHandles = (img: HTMLImageElement) => {
  const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
  handles.forEach(position => {
    const handle = document.createElement('div');
    handle.className = `resize-handle resize-handle-${position}`;
    handle.dataset.position = position;
    // Add drag listeners
  });
};
```

## 📡 WordPress Integration

### New Endpoints Needed:
```php
// In functions.php additions:

// Image upload endpoint
register_rest_route('violet/v1', '/image/upload', [
    'methods' => 'POST',
    'callback' => 'violet_handle_image_upload',
    'permission_callback' => 'current_user_can("upload_files")'
]);

// Image metadata save
register_rest_route('violet/v1', '/image/metadata', [
    'methods' => 'POST', 
    'callback' => 'violet_save_image_metadata',
    'permission_callback' => 'current_user_can("manage_options")'
]);
```

### Message Types:
```typescript
// New postMessage types
'violet-image-upload': Image upload request
'violet-image-resize': Resize notification
'violet-image-metadata': Alt text/caption update
'violet-image-replace': Replace existing image
'violet-image-remove': Remove image
```

## 🎨 CSS Additions Needed

```css
/* Image editing styles */
.violet-editable-image {
  transition: all 0.2s ease;
  position: relative;
}

.violet-editable-image:hover {
  outline: 2px dashed #0073aa;
  outline-offset: 4px;
}

.violet-image-selected {
  outline: 2px solid #0073aa !important;
}

/* Resize handles */
.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #0073aa;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
}

.resize-handle-nw { top: -5px; left: -5px; cursor: nw-resize; }
.resize-handle-ne { top: -5px; right: -5px; cursor: ne-resize; }
/* ... etc for all handles */

/* Image toolbar */
.violet-image-toolbar {
  /* Similar to text toolbar but with image-specific controls */
}

/* Upload zone */
.violet-upload-zone {
  border: 3px dashed #0073aa;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  background: rgba(0, 115, 170, 0.05);
}

.violet-upload-zone.active {
  background: rgba(0, 115, 170, 0.1);
  border-color: #005a87;
}
```

## 🔧 Technical Implementation Details

### Image Upload Handler:
```typescript
const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  // Upload to WordPress Media Library
  const response = await fetch('/wp-json/wp/v2/media', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData
  });
  
  const media = await response.json();
  return media.source_url;
};
```

### Resize Logic:
```typescript
const handleResize = (img: HTMLImageElement, newWidth: number, newHeight: number) => {
  // Update img attributes
  img.width = newWidth;
  img.height = newHeight;
  
  // Update style
  img.style.width = `${newWidth}px`;
  img.style.height = `${newHeight}px`;
  
  // Save to WordPress
  saveImageMetadata(img);
};
```

### Image Detection:
```typescript
const detectImageType = (img: HTMLImageElement) => {
  const src = img.src.toLowerCase();
  const classes = img.className.toLowerCase();
  
  if (classes.includes('logo')) return 'logo_image';
  if (classes.includes('hero')) return 'hero_image';
  if (classes.includes('featured')) return 'featured_image';
  if (img.closest('.gallery')) return 'gallery_image';
  
  return 'content_image';
};
```

## 🧪 Testing Checklist

### Functionality:
- [ ] Images show blue outline on hover in edit mode
- [ ] Click image shows toolbar
- [ ] Resize handles appear on selection
- [ ] Drag resize maintains aspect ratio with Shift
- [ ] Upload replaces image successfully
- [ ] Alt text saves and persists
- [ ] Alignment buttons work
- [ ] Remove image works
- [ ] Undo/redo includes image changes

### Cross-browser:
- [ ] Chrome/Edge: All features work
- [ ] Firefox: Resize handles position correctly
- [ ] Safari: Upload works properly
- [ ] Mobile: Touch events work for resize

### Performance:
- [ ] Large images don't freeze UI
- [ ] Upload shows progress
- [ ] Resize is smooth
- [ ] No memory leaks with multiple edits

## 📚 Dependencies to Add

```json
{
  "react-dropzone": "^14.2.3",  // For drag & drop
  "react-image-crop": "^11.0.1", // For cropping
  "browser-image-compression": "^2.0.2" // For optimization
}
```

## 🚀 Quick Start for New Chat

1. **Context**: "I have a WordPress-Netlify integration with a working rich text editor (bold, italic, fonts, colors). The code is in C:\Users\Leo\violet-electric-web. I need to add image editing capabilities."

2. **Current Working Features**:
   - Text selection shows floating toolbar
   - Rich text formatting saves to WordPress
   - PostMessage communication established
   - Edit mode toggle works

3. **Image Features Needed**:
   - Click images to edit
   - Resize by dragging corners
   - Upload/replace images
   - Edit alt text and captions
   - Image alignment
   - Basic filters/effects

4. **Key Files**:
   - `src/components/WordPressRichEditor.tsx` - Main editor
   - `src/components/EditorToolbar.tsx` - Text toolbar
   - `src/components/WordPressEditor.css` - Styles

5. **WordPress Details**:
   - URL: https://wp.violetrainwater.com/wp-admin/
   - Has rich text endpoints working
   - Needs image upload endpoints

## 💡 Implementation Tips

1. **Start with click detection** - Get images responding to clicks first
2. **Reuse toolbar pattern** - Copy EditorToolbar.tsx structure for ImageEditorToolbar
3. **Use WordPress Media Library** - Don't reinvent image storage
4. **Progressive enhancement** - Basic features first, then advanced
5. **Test with real images** - Use various sizes and formats
6. **Mobile considerations** - Touch events for resize/drag

## 🎯 Success Criteria

Image editor is complete when:
- ✅ All images are clickable in edit mode
- ✅ Image toolbar appears on click
- ✅ Resize works smoothly
- ✅ Upload/replace works
- ✅ Alt text and metadata save
- ✅ Changes persist after save
- ✅ No console errors
- ✅ Mobile-friendly
- ✅ Integrates seamlessly with text editor

## 📝 Notes for Implementation

- Keep same postMessage pattern as text editor
- Maintain visual consistency with text toolbar
- Use same save/feedback patterns
- Consider image optimization on upload
- Handle errors gracefully (failed uploads, etc)
- Add loading states for uploads
- Consider batch operations for galleries

**This image editor will transform the WordPress-Netlify integration into a complete visual page builder!**