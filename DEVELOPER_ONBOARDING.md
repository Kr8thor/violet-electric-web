# 👨‍💻 Developer Onboarding Guide
## Violet Rainwater Website - WordPress-React Universal Editing System

**For**: Future developers working on this project  
**Owner**: Violet Rainwater (@violetrain121)  
**Repository**: https://github.com/violetrain121/violet-electric-web

---

## 🚀 Project Overview

You're working on a **cutting-edge WordPress-React headless website** with a custom universal editing system. This allows the client to edit EVERYTHING visually through WordPress admin without touching code.

### 🎯 Key Innovation
Unlike typical headless setups, this project features a **universal visual editing system** where:
- Every text element is editable via WordPress admin
- All images can be replaced through WordPress media library
- Colors, buttons, links - everything is editable
- Changes save to WordPress and display on the React frontend
- No page builders or plugins - custom built system

---

## 🏗️ Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   WordPress Admin   │────▶│   React Frontend     │────▶│     Netlify     │
│  (Edit Interface)   │     │  (Display Layer)     │     │      (CDN)      │
└─────────────────────┘     └──────────────────────┘     └─────────────────┘
         │                           │                             │
         ▼                           ▼                             ▼
   WP Engine Hosting          GitHub Repository            Global Delivery
```

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.2.0 - UI library
- **TypeScript** 5.2.2 - Type safety
- **Vite** 5.2.0 - Build tool
- **Tailwind CSS** 3.4.1 - Styling
- **React Router** 6.22.1 - Routing
- **Apollo Client** 3.8.8 - GraphQL

### Backend
- **WordPress** 6.4+ - Content management
- **Custom REST API** - Content delivery
- **WP GraphQL** - Alternative data fetching
- **Custom Functions** - 2,508 lines in functions.php!

### Infrastructure
- **Netlify** - Frontend hosting & auto-deployment
- **WP Engine** - WordPress hosting
- **GitHub** - Version control
- **PostMessage API** - Cross-origin communication

---

## 🏃‍♂️ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/violetrain121/violet-electric-web.git
cd violet-electric-web

# 2. Install dependencies
npm install

# 3. Create .env.local file
echo "VITE_WORDPRESS_URL=https://wp.violetrainwater.com" > .env.local
echo "VITE_WORDPRESS_API=https://wp.violetrainwater.com/wp-json/violet/v1" >> .env.local

# 4. Start development server
npm run dev

# 5. Open in browser
# http://localhost:5173
```

---

## 🔑 Key Files to Understand

### 1. **functions.php** (The Brain - 2,508 lines)
Located in WordPress theme. Contains:
- Universal editor interface code
- REST API endpoints
- Content management functions
- Cross-origin communication handlers
- Security configurations

**Key sections:**
- Lines 1-200: Core utilities
- Lines 401-600: Admin interfaces
- Lines 601-1000: REST endpoints
- Lines 1001-1600: Universal editor
- Lines 1601-2000: React editor

### 2. **EditableText.tsx** (Core Component)
```typescript
// This component makes any text editable
<EditableText field="field_name">
  Default content
</EditableText>
```

### 3. **WordPressCommunication.ts** (Message Bridge)
Handles PostMessage communication between WordPress and React:
- Sends messages to WordPress
- Receives editing commands
- Manages save operations

### 4. **VioletRuntimeContentFixed.tsx** (Content Manager)
- Loads content from WordPress
- Manages local state
- Handles content persistence
- Triple failsafe storage system

---

## 🎨 Universal Editing System

### How It Works
1. **WordPress Admin** loads React site in iframe
2. **Edit Mode** activated via button
3. **Click any element** to edit (blue outline appears)
4. **Popup editor** for making changes
5. **Batch save** all changes at once
6. **Content persists** in WordPress database

### Making New Components Editable

```typescript
// 1. Import EditableText
import { EditableText } from '../components/EditableText';

// 2. Wrap your content
function MyComponent() {
  return (
    <div>
      <EditableText field="my_heading" defaultValue="Default Heading">
        {(content) => <h1>{content}</h1>}
      </EditableText>
      
      <EditableText field="my_paragraph">
        Default paragraph text here
      </EditableText>
    </div>
  );
}

// 3. That's it! It's now editable in WordPress
```

### Adding Other Editable Types

```typescript
// Editable Image
import { EditableImage } from '../components/EditableImage';

<EditableImage 
  field="hero_image" 
  defaultSrc="/default-image.jpg"
  alt="Hero image"
/>

// Editable Button
import { EditableButton } from '../components/EditableButton';

<EditableButton 
  field="cta_button"
  defaultText="Click Me"
  defaultUrl="/contact"
/>

// Editable Color
import { EditableColor } from '../components/EditableColor';

<EditableColor field="primary_color" defaultColor="#6B46C1">
  {(color) => (
    <div style={{ backgroundColor: color }}>
      Colored content
    </div>
  )}
</EditableColor>
```

---

## 📡 API Endpoints

### Content Endpoints
```
GET  /wp-json/violet/v1/content           # Get all content
POST /wp-json/violet/v1/save              # Save single field
POST /wp-json/violet/v1/save-batch        # Save multiple fields
GET  /wp-json/violet/v1/debug              # Debug information
```

### Example Usage
```javascript
// Fetch content
const response = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/content');
const content = await response.json();

// Save content
const saveResponse = await fetch('https://wp.violetrainwater.com/wp-json/violet/v1/save-batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    changes: [
      { field_name: 'hero_title', field_value: 'New Title' },
      { field_name: 'hero_subtitle', field_value: 'New Subtitle' }
    ]
  })
});
```

---

## 🚀 Deployment

### Automatic (Recommended)
1. Push to `main` branch
2. Netlify automatically builds
3. Live in 2-4 minutes

### Manual
```bash
# Build locally
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### Build Settings (Netlify)
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18.x

---

## 🐛 Common Issues & Solutions

### Issue: "Changes not saving"
**Solution:**
1. Check browser console for errors
2. Verify WordPress REST API is accessible
3. Check CORS headers in functions.php
4. Ensure user is logged into WordPress

### Issue: "Edit mode not working"
**Solution:**
1. Verify you're in WordPress admin → Universal Editor
2. Click "Enable Editing Mode" button
3. Check that iframe URL has `?edit_mode=1` parameter
4. Clear browser cache

### Issue: "Build fails on Netlify"
**Solution:**
1. Check build logs for specific error
2. Ensure all dependencies are in package.json
3. Verify environment variables are set
4. Check Node version compatibility

### Issue: "CORS errors"
**Solution:**
1. Check allowed origins in functions.php
2. Verify domain is whitelisted
3. Check browser network tab for details
4. Test with simple fetch first

---

## 🔧 Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-section

# Make changes
# Test locally with npm run dev
# Test editing in WordPress admin

# Commit changes
git add .
git commit -m "Add: New testimonials section with editing"

# Push and create PR
git push origin feature/new-section
```

### 2. Testing Checklist
- [ ] Component renders correctly
- [ ] Editable in WordPress admin
- [ ] Changes save properly
- [ ] Content persists on refresh
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Lighthouse score acceptable

### 3. Code Standards
- Use TypeScript for type safety
- Follow existing component patterns
- Comment complex logic
- Keep components small and focused
- Use Tailwind classes for styling
- Test on multiple browsers

---

## 📚 Additional Resources

### Project Documentation
- `README.md` - Project overview
- `HANDOVER_TO_VIOLETRAIN121.md` - Owner's guide
- `COMPLETE_PROJECT_INSTRUCTIONS.md` - Deep technical dive
- Inline code comments - Best source of truth

### External Resources
- [React Documentation](https://react.dev/)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [Netlify Docs](https://docs.netlify.com/)
- [Vite Guide](https://vitejs.dev/guide/)

### Getting Help
1. Check existing documentation
2. Review code comments
3. Look at similar components
4. Test in isolation
5. Ask in developer communities

---

## 🎯 Pro Tips

### 1. **Always Test Editing**
After adding any new component, test that it's editable in WordPress admin.

### 2. **Use Existing Patterns**
Look at Hero.tsx or other components for examples of proper implementation.

### 3. **Keep It Simple**
The editing system is powerful but complex. Don't over-engineer solutions.

### 4. **Document Changes**
Update comments and documentation when adding new features.

### 5. **Performance Matters**
The site should be fast. Check bundle size and optimize images.

---

## 🤝 Working with the Client

### Communication Tips
- Violet is non-technical - explain in simple terms
- Focus on what she can do, not how it works
- Provide visual examples when possible
- Be patient and supportive

### Client Priorities
1. Easy content editing
2. Professional appearance
3. Fast loading times
4. Mobile responsiveness
5. Reliability

### Support Approach
- First, check if it's user error
- Provide step-by-step instructions
- Use screenshots when helpful
- Offer to do screen sharing if needed

---

## ⚡ Emergency Contacts

### If Something Breaks
1. **Check Netlify build logs** first
2. **WordPress admin** might have error messages
3. **Browser console** for JavaScript errors
4. **Network tab** for API issues

### Rollback Procedure
```bash
# Find last working commit
git log --oneline

# Revert to that commit
git revert [commit-hash]

# Push to trigger rebuild
git push origin main
```

---

## 🎉 Welcome to the Project!

This is a unique and innovative project that pushes the boundaries of what's possible with WordPress and React. The universal editing system is custom-built and provides an amazing user experience for the client.

**Key things to remember:**
- The client can edit EVERYTHING visually
- No traditional page builders involved
- Performance and UX are top priorities
- The code is well-documented
- You're maintaining something special

Good luck, and enjoy working on this cutting-edge project!

---

*Developer Guide Version 1.0*  
*Last Updated: June 11, 2025*  
*Project Status: Production Ready*