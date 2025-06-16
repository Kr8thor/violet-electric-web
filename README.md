# Violet Rainwater Professional Website

🌟 **A cutting-edge WordPress-React website with universal visual editing capabilities**

---

## 🎯 Overview

This is the source code for Violet Rainwater's professional website. It features a unique **universal editing system** that allows editing every aspect of the website directly through WordPress admin - no coding required!

### 🔗 Live Website
- **Production**: https://violetrainwater.com (coming soon)
- **Current**: https://lustrous-dolphin-447351.netlify.app

### 🛠️ Built With
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: WordPress (Headless CMS)
- **Hosting**: Netlify (Frontend) + WP Engine (Backend)
- **Special**: Universal Visual Editing System

---

## ✨ Key Features

### For Website Owner (Violet)
- ✏️ **Edit Everything**: Click any element to edit directly
- 🎨 **Visual Interface**: See changes in real-time
- 🖼️ **Media Management**: Upload images via WordPress
- 🎯 **No Code Required**: Professional editing without technical knowledge
- 💾 **Auto-Save**: Changes persist automatically

### For Developers
- 🏗️ **Modern Stack**: React + TypeScript + Vite
- 🎯 **Component-Based**: Modular, reusable components
- 🔧 **Universal Editing**: Custom EditableText components
- 📡 **Headless WordPress**: REST API + GraphQL
- 🚀 **Auto-Deploy**: Git push → Netlify build

---

## 🚀 Quick Start (For Developers)

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup
```bash
# Clone repository
git clone https://github.com/violetrain121/violet-electric-web.git
cd violet-electric-web

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Key Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run linter
npm run format   # Format code
```

---

## 📁 Project Structure

```
├── src/
│   ├── components/        # React components
│   │   ├── EditableText.tsx    # Core editing component
│   │   ├── Hero.tsx           # Homepage hero section
│   │   └── ...                # Other components
│   ├── pages/            # Page components
│   ├── utils/            # Helper functions
│   ├── contexts/         # React contexts
│   └── App.tsx          # Main app component
├── public/              # Static assets
├── functions.php        # WordPress integration (2,508 lines!)
├── package.json         # Dependencies
├── vite.config.ts      # Vite configuration
├── netlify.toml        # Netlify settings
└── README.md           # You are here
```

---

## 🔧 WordPress Integration

The magic happens in `functions.php` (2,508 lines of custom code!) which provides:

- 🎨 **Universal Editor Interface**: Visual editing in WordPress admin
- 📡 **REST API Endpoints**: Content management APIs
- 🔒 **CORS Configuration**: Secure cross-origin communication
- 💾 **Content Management**: Save and retrieve content
- 🔄 **Real-time Updates**: Live preview system

### Key WordPress URLs
- **Admin**: https://wp.violetrainwater.com/wp-admin/
- **Universal Editor**: Admin → 🎨 Universal Editor
- **API**: https://wp.violetrainwater.com/wp-json/violet/v1/

---

## 🎨 Editing System

### How It Works
1. **WordPress Admin** displays website in iframe
2. **EditableText** components mark editable content
3. **PostMessage** enables cross-origin communication
4. **REST API** saves changes to WordPress
5. **Netlify** rebuilds site automatically

### Making Components Editable
```typescript
import { EditableText } from '../components/EditableText';

function MyComponent() {
  return (
    <EditableText field="my_field_name">
      Default text content
    </EditableText>
  );
}
```

---

## 🚀 Deployment

### Automatic Deployment
- Push to `main` branch → Netlify auto-builds → Live in 2-4 minutes

### Manual Deployment
```bash
# Build locally
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### Environment Variables
Required in Netlify:
- `VITE_WORDPRESS_URL`: WordPress backend URL
- `VITE_WORDPRESS_API`: WordPress REST API URL

---

## 📚 Documentation

- 📖 **[HANDOVER_TO_VIOLETRAIN121.md](./HANDOVER_TO_VIOLETRAIN121.md)** - Complete owner's guide
- 📖 **[GITHUB_TRANSFER_GUIDE.md](./GITHUB_TRANSFER_GUIDE.md)** - Repository transfer instructions
- 📖 **[COMPLETE_PROJECT_INSTRUCTIONS.md](./COMPLETE_PROJECT_INSTRUCTIONS.md)** - Technical deep dive

---

## 🛠️ Development Notes

### Adding New Pages
1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Use EditableText for all content
4. Test in Universal Editor

### Styling
- Uses Tailwind CSS for styling
- Custom styles in `src/index.css`
- Component-specific styles inline

### State Management
- React Context for global state
- Local state for component-specific data
- WordPress as source of truth

---

## 🤝 Contributing

This is a private repository for Violet Rainwater's website. If you're a hired developer:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request
5. Wait for review

---

## 📞 Support

### For Violet (Website Owner)
- Check the handover guide first
- Use WordPress admin for all edits
- Contact your developer for technical issues

### For Developers
- Review the complete project instructions
- Check inline code comments
- Test in development before deploying

---

## 🔒 Security

- Never commit sensitive data
- Use environment variables for secrets
- Keep dependencies updated
- Follow WordPress security best practices

---

## 📄 License

This is a private commercial project. All rights reserved by Violet Rainwater.

---

## 🙏 Acknowledgments

- Built with ❤️ by Leo
- Powered by React, WordPress, and Netlify
- Special thanks to the open-source community

---

*Last updated: June 11, 2025*  
*Status: Production Ready ✅*  
*Universal Editing System: Fully Operational ✨*