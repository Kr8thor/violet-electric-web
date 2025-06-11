// Auto-generated WordPress content types
export interface WordPressContent {
  hero_title: string;
  hero_subtitle: string;
  hero_subtitle_line2: string;
  hero_cta: string;
  hero_cta_secondary: string;
  contact_email: string;
  contact_phone: string;
  nav_about: string;
  nav_keynotes: string;
  nav_testimonials: string;
  nav_contact: string;
  auto_rebuild: string;
  content_initialized: string;
  footer_text: string;
  generic_text: string;
  keynote_setup_complete: string;
}

export const WORDPRESS_CONTENT: WordPressContent = {
  hero_title: "<span class=\"text-white violet-dynamic-content\" data-violet-field=\"hero_subtitle_line2\" data-violet-value=\"Change Your Life.\" data-original-content=\"Change Your Life.\" data-violet-editable=\"true\" data-violet-original=\"Change Your Life.\" data-violet-field-type=\"span_content\" style=\"cursor: text\">Change Your Life.</span>",
  hero_subtitle: "Transform your potential into reality with our innovative solutions",
  hero_subtitle_line2: "Change Your Life.",
  hero_cta: "Book a Discovery Call",
  hero_cta_secondary: "Watch Violet in Action",
  contact_email: "hello@violetrainwater.com",
  contact_phone: "TEST FROM WORDPRESS: 12:46:49 GMT+0n Standard Time)Change Your Life.",
  nav_about: "About",
  nav_keynotes: "Keynotes",
  nav_testimonials: "Testimonials",
  nav_contact: "Contact",
  auto_rebuild: "1",
  content_initialized: "1",
  footer_text: "© 2025 Violet Electric. All rights reserved.",
  generic_text: "Test at 1:Change Your Life.",
  keynote_setup_complete: "1",
};

// Environment variable getters with fallbacks
export function getWordPressField(field: keyof WordPressContent): string {
  const envKey = `VITE_WP_${field.toUpperCase()}` as const;
  return import.meta.env[envKey] || WORDPRESS_CONTENT[field] || '';
}
