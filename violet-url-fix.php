<?php
/*
Plugin Name: Violet Editor URL Fix
Description: Forces the correct Netlify URL for the React editor
Version: 1.0
*/

// Force the correct URL
add_filter('option_violet_netlify_url', function($value) {
    return 'https://lustrous-dolphin-447351.netlify.app';
});

// Also fix it in the database
add_action('admin_init', function() {
    update_option('violet_netlify_url', 'https://lustrous-dolphin-447351.netlify.app');
});
