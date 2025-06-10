<?php
/**
 * Fix WordPress Iframe URL Issue
 * Run this in WordPress to fix the React app not loading
 */

// Check current option value
$current_url = get_option('violet_netlify_url');
echo "Current Netlify URL in database: " . $current_url . "\n";

// The correct URL
$correct_url = 'https://lustrous-dolphin-447351.netlify.app';

// Update the option
update_option('violet_netlify_url', $correct_url);
echo "Updated to: " . $correct_url . "\n";

// Verify
$new_url = get_option('violet_netlify_url');
echo "Verified new URL: " . $new_url . "\n";

// Also check and set related options
update_option('violet_auto_rebuild', '1');
echo "Auto rebuild enabled\n";

// Clear any caches
if (function_exists('wp_cache_flush')) {
    wp_cache_flush();
    echo "Cache cleared\n";
}

echo "\nDone! Now refresh your Edit Frontend page and the React app should load correctly.\n";
