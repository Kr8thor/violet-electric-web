/**
 * Vite Plugin: WordPress Content Fetcher
 * Fetches WordPress content at BUILD TIME and injects as environment variables
 */

import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

interface WordPressConfig {
  apiUrl: string;
  fallbackContent?: Record<string, string>;
  outputPath?: string;
}

export function wordpressContentPlugin(config: WordPressConfig): Plugin {
  return {
    name: 'wordpress-content',
    async buildStart() {
      console.log('🔄 Fetching WordPress content at build time...');
      
      // Helper function to clean HTML content and extract text
      const cleanContent = (value: string): string => {
        if (!value || typeof value !== 'string') return '';
        
        // If it looks like HTML, extract the text content
        if (value.includes('<') && value.includes('>')) {
          // Basic HTML to text extraction
          const textMatch = value.match(/>([^<]+)</);
          if (textMatch && textMatch[1]) {
            const cleanText = textMatch[1].trim();
            console.log(`🧹 Cleaned HTML content: "${value.substring(0, 50)}..." → "${cleanText}"`);
            return cleanText;
          }
        }
        
        // Clean any remaining HTML tags
        const withoutTags = value.replace(/<[^>]*>/g, '').trim();
        
        // Clean any WordPress test markers or timestamps
        const withoutTestMarkers = withoutTags
          .replace(/TEST FROM WORDPRESS:.*$/i, '')
          .replace(/WORDPRESS:.*$/i, '')
          .replace(/Test at \d+:.*$/i, '')
          .trim();
        
        return withoutTestMarkers || value;
      };
      
      try {
        // Fetch content from WordPress API
        const response = await fetch(`${config.apiUrl}/wp-json/violet/v1/content`);
        
        let wordpressContent: Record<string, string> = {};
        
        if (response.ok) {
          const rawContent = await response.json();
          
          // Clean all WordPress content
          wordpressContent = Object.fromEntries(
            Object.entries(rawContent).map(([key, value]) => [
              key, 
              cleanContent(value as string)
            ])
          );
          
          console.log('✅ WordPress content fetched and cleaned:', Object.keys(wordpressContent));
        } else {
          console.warn('⚠️ WordPress API not available, using fallback content');
          wordpressContent = config.fallbackContent || {};
        }

        // Merge with fallback content (WordPress takes priority)
        const finalContent = {
          // Fallback content as base
          hero_title: 'Welcome to Violet Electric',
          hero_subtitle: 'Transform your potential with cutting-edge solutions', 
          hero_subtitle_line2: 'Change Your Life.',
          hero_cta: 'Book Your Session',
          hero_cta_secondary: 'Watch Violet in Action',
          contact_email: 'hello@violetrainwater.com',
          contact_phone: '+1 (555) 123-4567',
          nav_about: 'About',
          nav_keynotes: 'Keynotes', 
          nav_testimonials: 'Testimonials',
          nav_contact: 'Contact',
          // WordPress content overrides defaults
          ...wordpressContent
        };

        // Generate environment variables file
        const envContent = Object.entries(finalContent)
          .map(([key, value]) => `VITE_WP_${key.toUpperCase()}="${value.replace(/"/g, '\\"')}"`)
          .join('\n');

        // Write to .env.production
        fs.writeFileSync('.env.production', envContent);
        console.log('✅ WordPress content written to .env.production');

        // Also create a TypeScript file for type safety
        const tsContent = `// Auto-generated WordPress content types
export interface WordPressContent {
${Object.keys(finalContent).map(key => `  ${key}: string;`).join('\n')}
}

export const WORDPRESS_CONTENT: WordPressContent = {
${Object.entries(finalContent).map(([key, value]) => `  ${key}: "${value.replace(/"/g, '\\"')}",`).join('\n')}
};

// Environment variable getters with fallbacks
export function getWordPressField(field: keyof WordPressContent): string {
  const envKey = \`VITE_WP_\${field.toUpperCase()}\` as const;
  return import.meta.env[envKey] || WORDPRESS_CONTENT[field] || '';
}
`;

        fs.writeFileSync('src/wordpress-content.ts', tsContent);
        console.log('✅ TypeScript definitions generated');

        // Output summary
        console.log(`📊 Build-time content summary:`);
        console.log(`   • ${Object.keys(finalContent).length} content fields`);
        console.log(`   • WordPress API: ${response.ok ? 'Connected' : 'Fallback used'}`);
        console.log(`   • Environment variables: Generated`);
        console.log(`   • TypeScript types: Generated`);

      } catch (error) {
        console.error('❌ Failed to fetch WordPress content:', error);
        
        // Create fallback content
        const fallbackContent = config.fallbackContent || {
          hero_title: 'Welcome to Violet Electric',
          hero_subtitle: 'Transform your potential with cutting-edge solutions',
          hero_cta: 'Book Your Session'
        };

        const envContent = Object.entries(fallbackContent)
          .map(([key, value]) => `VITE_WP_${key.toUpperCase()}="${value}"`)
          .join('\n');

        fs.writeFileSync('.env.production', envContent);
        console.log('✅ Fallback content written to .env.production');
      }
    }
  };
}

export default wordpressContentPlugin;