import { EditorThemeClasses } from 'lexical';

// Editor configuration types
export type EditorType = 'quill' | 'lexical' | 'plain';

export interface EditorPreferences {
  defaultEditor: EditorType;
  autoSave: boolean;
  autoSaveDelay: number;
  spellCheck: boolean;
  enableMarkdown: boolean;
  enableRichText: boolean;
  maxLength: number;
  showWordCount: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface EditorFieldConfig {
  fieldType: string;
  preferredEditor: EditorType;
  maxLength: number;
  allowedFormats: string[];
  placeholder: string;
  enableImages: boolean;
  enableLinks: boolean;
  enableLists: boolean;
  enableCodeBlocks: boolean;
  autoFocus: boolean;
}

// Default editor preferences
export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  defaultEditor: 'quill',
  autoSave: true,
  autoSaveDelay: 3000,
  spellCheck: true,
  enableMarkdown: true,
  enableRichText: true,
  maxLength: 10000,
  showWordCount: true,
  theme: 'auto'
};

// Field-specific configurations
export const FIELD_CONFIGURATIONS: Record<string, EditorFieldConfig> = {
  // Hero section fields
  hero_title: {
    fieldType: 'hero_title',
    preferredEditor: 'lexical',
    maxLength: 100,
    allowedFormats: ['bold', 'italic', 'color'],
    placeholder: 'Enter your compelling headline...',
    enableImages: false,
    enableLinks: false,
    enableLists: false,
    enableCodeBlocks: false,
    autoFocus: true
  },

  hero_subtitle: {
    fieldType: 'hero_subtitle',
    preferredEditor: 'lexical',
    maxLength: 200,
    allowedFormats: ['bold', 'italic', 'underline', 'color'],
    placeholder: 'Add a supporting description...',
    enableImages: false,
    enableLinks: true,
    enableLists: false,
    enableCodeBlocks: false,
    autoFocus: false
  },

  hero_cta: {
    fieldType: 'hero_cta',
    preferredEditor: 'quill',
    maxLength: 50,
    allowedFormats: ['bold'],
    placeholder: 'Call-to-action text',
    enableImages: false,
    enableLinks: false,
    enableLists: false,
    enableCodeBlocks: false,
    autoFocus: false
  },

  // Button and link fields
  button_text: {
    fieldType: 'button_text',
    preferredEditor: 'plain',
    maxLength: 30,
    allowedFormats: ['bold'],
    placeholder: 'Button text',
    enableImages: false,
    enableLinks: false,
    enableLists: false,
    enableCodeBlocks: false,
    autoFocus: true
  },

  link_text: {
    fieldType: 'link_text',
    preferredEditor: 'plain',
    maxLength: 50,
    allowedFormats: ['bold', 'italic'],
    placeholder: 'Link text',
    enableImages: false,
    enableLinks: false,
    enableLists: false,
    enableCodeBlocks: false,
    autoFocus: true
  },

  nav_item: {
    fieldType: 'nav_item',
    preferredEditor: 'plain',
    maxLength: 20,
    allowedFormats: [],
    placeholder: 'Navigation item',
    enableImages: false,
    enableLinks: false,
    enableLists: false,
    enableCodeBlocks: false,
    autoFocus: true
  },

  // Content fields
  intro_description: {
    fieldType: 'description',
    preferredEditor: 'quill',
    maxLength: 500,
    allowedFormats: ['bold', 'italic', 'underline', 'color', 'link'],
    placeholder: 'Write your introduction...',
    enableImages: false,
    enableLinks: true,
    enableLists: false,
    enableCodeBlocks: false,
    autoFocus: false
  },

  paragraph_content: {
    fieldType: 'content',
    preferredEditor: 'lexical',
    maxLength: 2000,
    allowedFormats: ['bold', 'italic', 'underline', 'strikethrough', 'color', 'background', 'link', 'list', 'heading'],
    placeholder: 'Start writing your content...',
    enableImages: true,
    enableLinks: true,
    enableLists: true,
    enableCodeBlocks: false,
    autoFocus: false
  },

  article_content: {
    fieldType: 'article',
    preferredEditor: 'lexical',
    maxLength: 5000,
    allowedFormats: ['bold', 'italic', 'underline', 'strikethrough', 'color', 'background', 'link', 'list', 'heading', 'quote', 'code'],
    placeholder: 'Write your article content...',
    enableImages: true,
    enableLinks: true,
    enableLists: true,
    enableCodeBlocks: true,
    autoFocus: false
  },

  // Contact fields
  contact_email: {
    fieldType: 'email',
    preferredEditor: 'plain',
    maxLength: 100,
    allowedFormats: [],
    placeholder: 'email@example.com',
    enableImages: false,
    enableLinks: false,
    enableLists: false,
    enableCodeBlocks: false,
    autoFocus: true
  },

  contact_phone: {
    fieldType: 'phone',
    preferredEditor: 'plain',
    maxLength: 20,
    allowedFormats: [],
    placeholder: '+1 (555) 123-4567',
    enableImages: false,
    enableLinks: false,
    enableLists: false,
    enableCodeBlocks: false,
    autoFocus: true
  },

  // Default fallback
  default: {
    fieldType: 'default',
    preferredEditor: 'quill',
    maxLength: 1000,
    allowedFormats: ['bold', 'italic', 'underline', 'color', 'link'],
    placeholder: 'Start writing...',
    enableImages: true,
    enableLinks: true,
    enableLists: true,
    enableCodeBlocks: false,
    autoFocus: false
  }
};

// Quill toolbar configurations
export const QUILL_TOOLBAR_CONFIGS = {
  minimal: [
    ['bold', 'italic', 'underline'],
    ['clean']
  ],

  basic: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    ['clean']
  ],

  standard: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ],

  full: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link', 'image', 'video'],
    ['code-block'],
    ['blockquote'],
    ['clean']
  ]
};

// Lexical theme configuration
export const LEXICAL_THEME: EditorThemeClasses = {
  root: 'violet-lexical-root',
  paragraph: 'violet-lexical-paragraph',
  heading: {
    h1: 'violet-lexical-h1',
    h2: 'violet-lexical-h2',
    h3: 'violet-lexical-h3',
    h4: 'violet-lexical-h4',
    h5: 'violet-lexical-h5',
    h6: 'violet-lexical-h6',
  },
  list: {
    nested: {
      listitem: 'violet-lexical-nested-listitem',
    },
    ol: 'violet-lexical-list-ol',
    ul: 'violet-lexical-list-ul',
    listitem: 'violet-lexical-listitem',
  },
  link: 'violet-lexical-link',
  text: {
    bold: 'violet-lexical-text-bold',
    italic: 'violet-lexical-text-italic',
    underline: 'violet-lexical-text-underline',
    strikethrough: 'violet-lexical-text-strikethrough',
    code: 'violet-lexical-text-code',
  },
  code: 'violet-lexical-code',
  quote: 'violet-lexical-quote',
};

// Content sanitization rules
export const SANITIZATION_RULES = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'pre', 'code', 'span', 'div'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'src', 'alt', 'title', 'style', 'class',
    'color', 'background-color', 'font-size', 'text-align'
  ],
  ALLOWED_STYLES: [
    'color', 'background-color', 'font-size', 'font-weight', 'font-style',
    'text-decoration', 'text-align', 'margin', 'padding'
  ]
};

// Utility functions
export function getFieldConfig(fieldType: string): EditorFieldConfig {
  return FIELD_CONFIGURATIONS[fieldType] || FIELD_CONFIGURATIONS.default;
}

export function getQuillToolbar(fieldType: string): string[][] {
  const config = getFieldConfig(fieldType);
  
  if (config.allowedFormats.length <= 3) {
    return QUILL_TOOLBAR_CONFIGS.minimal;
  } else if (config.allowedFormats.length <= 6) {
    return QUILL_TOOLBAR_CONFIGS.basic;
  } else if (config.enableImages || config.enableCodeBlocks) {
    return QUILL_TOOLBAR_CONFIGS.full;
  } else {
    return QUILL_TOOLBAR_CONFIGS.standard;
  }
}

export function shouldUseRichText(fieldType: string): boolean {
  const config = getFieldConfig(fieldType);
  return config.allowedFormats.length > 1 || config.enableImages || config.enableLinks;
}

export function getMaxLength(fieldType: string): number {
  const config = getFieldConfig(fieldType);
  return config.maxLength;
}

export function getPlaceholder(fieldType: string, defaultPlaceholder?: string): string {
  const config = getFieldConfig(fieldType);
  return config.placeholder || defaultPlaceholder || 'Start writing...';
}

export function getPreferredEditor(fieldType: string, userPreference?: EditorType): EditorType {
  const config = getFieldConfig(fieldType);
  return userPreference || config.preferredEditor;
}

export function getEditorTitle(editorType: EditorType): string {
  switch (editorType) {
    case 'quill':
      return 'Quill Rich Editor';
    case 'lexical':
      return 'Lexical Advanced Editor';
    case 'plain':
      return 'Plain Text Editor';
    default:
      return 'Text Editor';
  }
}

// Storage functions for user preferences
export function saveEditorPreferences(preferences: Partial<EditorPreferences>): void {
  const current = getEditorPreferences();
  const updated = { ...current, ...preferences };
  localStorage.setItem('violet-editor-preferences', JSON.stringify(updated));
}

export function getEditorPreferences(): EditorPreferences {
  try {
    const saved = localStorage.getItem('violet-editor-preferences');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_EDITOR_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load editor preferences:', error);
  }
  
  return DEFAULT_EDITOR_PREFERENCES;
}

export function clearEditorPreferences(): void {
  localStorage.removeItem('violet-editor-preferences');
}

// Validation functions
export function validateContent(content: string, fieldType: string): { valid: boolean; errors: string[] } {
  const config = getFieldConfig(fieldType);
  const errors: string[] = [];
  
  // Check length
  const textContent = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
  if (textContent.length > config.maxLength) {
    errors.push(`Content exceeds maximum length of ${config.maxLength} characters`);
  }
  
  // Check for required content
  if (textContent.trim().length === 0 && config.fieldType !== 'email' && config.fieldType !== 'phone') {
    errors.push('Content cannot be empty');
  }
  
  // Email validation
  if (config.fieldType === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(textContent.trim())) {
      errors.push('Please enter a valid email address');
    }
  }
  
  // Phone validation
  if (config.fieldType === 'phone') {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = textContent.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      errors.push('Please enter a valid phone number');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Content transformation functions
export function convertPlainTextToHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

export function convertHtmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

// Keyboard shortcut configurations
export const KEYBOARD_SHORTCUTS = {
  save: 'Ctrl+S',
  bold: 'Ctrl+B',
  italic: 'Ctrl+I',
  underline: 'Ctrl+U',
  undo: 'Ctrl+Z',
  redo: 'Ctrl+Y',
  link: 'Ctrl+K',
  escape: 'Escape'
};

// Export all configurations as a single object for easy import
export const EDITOR_CONFIG = {
  preferences: DEFAULT_EDITOR_PREFERENCES,
  fields: FIELD_CONFIGURATIONS,
  quillToolbars: QUILL_TOOLBAR_CONFIGS,
  lexicalTheme: LEXICAL_THEME,
  sanitization: SANITIZATION_RULES,
  shortcuts: KEYBOARD_SHORTCUTS
};

export default EDITOR_CONFIG;
