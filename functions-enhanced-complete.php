<?php
/**
 * 🎯 COMPLETE ENHANCED UNIVERSAL EDITING SYSTEM
 * Full-Featured WordPress-React Integration
 * 
 * COMPLETE FEATURES:
 * ✅ Universal Editor Interface (professional gradient design)
 * ✅ Rich Text Integration (Quill & Lexical editors)
 * ✅ Universal Editing Components (text, images, colors, buttons)
 * ✅ Cross-Origin Communication (secure PostMessage)
 * ✅ Complete REST API Endpoints (all content types)
 * ✅ Content Persistence (dual storage system)
 * ✅ Image Management (WordPress media library)
 * ✅ Color Management (color picker system)
 * ✅ Security Enhancements (CORS, validation, sanitization)
 * ✅ Error Handling & Debugging (comprehensive logging)
 * ✅ Netlify Integration (auto-rebuild capabilities)
 * ✅ Text Direction Fix (LTR enforcement)
 * ✅ Enhanced Field Detection (finds all editable elements)
 * ✅ Professional WordPress Admin UI
 * ✅ ALL ORIGINAL FUNCTIONALITY PRESERVED
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get allowed origins for CORS configuration
 */
function _violet_get_allowed_origins() {
    $allowed_origins = array(
        'https://lustrous-dolphin-447351.netlify.app',
        'https://violetrainwater.com',
        'https://www.violetrainwater.com',
        'https://wp.violetrainwater.com'
    );
    
    $netlify_url_option = get_option('violet_netlify_url', '');
    if ($netlify_url_option) {
        $parsed_url = parse_url($netlify_url_option);
        if ($parsed_url && isset($parsed_url['scheme']) && isset($parsed_url['host'])) {
            $normalized_netlify_origin = $parsed_url['scheme'] . '://' . $parsed_url['host'];
            if (!in_array($normalized_netlify_origin, $allowed_origins)) {
                $allowed_origins[] = $normalized_netlify_origin;
            }
        }
    }
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        $allowed_origins[] = 'http://localhost:3000';
        $allowed_origins[] = 'http://localhost:3001';
        $allowed_origins[] = 'http://localhost:5173';
    }
    
    return array_unique($allowed_origins);
}

/**
 * Helper function to get content with fallback
 */
function violet_get_content($field, $default = '') {
    $content = get_option('violet_all_content', array());
    if (isset($content[$field])) {
        return $content[$field];
    }
    
    // Fallback to individual option
    $individual_option = get_option('violet_' . $field, $default);
    return $individual_option;
}

/**
 * Helper function to update single content field
 */
function violet_update_content($field, $value) {
    $content = get_option('violet_all_content', array());
    $content[$field] = $value;
    update_option('violet_all_content', $content);
    
    // Also update individual option for backward compatibility
    update_option('violet_' . $field, $value);
    
    wp_cache_flush();
    return true;
}

/**
 * Helper function for theme developers
 */
function violet_content($field, $default = '', $echo = true) {
    $value = violet_get_content($field, $default);
    if ($echo) {
        echo esc_html($value);
    }
    return $value;
}

/**
 * Get all Violet content fields
 */
function violet_get_all_content_fields() {
    