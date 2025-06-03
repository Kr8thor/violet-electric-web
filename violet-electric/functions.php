<?php
// Enqueue Tailwind CSS and theme scripts
function violet_electric_enqueue_scripts() {
    wp_enqueue_style('tailwindcss', 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css', array(), '2.2.19');
    wp_enqueue_style('violet-electric-style', get_stylesheet_uri(), array('tailwindcss'), '1.0');
}
add_action('wp_enqueue_scripts', 'violet_electric_enqueue_scripts');

// Theme support
function violet_electric_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
    add_theme_support('menus');
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'violet-electric'),
    ));
}
add_action('after_setup_theme', 'violet_electric_setup'); 