<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class('bg-white text-gray-900'); ?>>
<header class="w-full py-6 bg-gradient-to-r from-purple-600 to-blue-400 shadow">
    <div class="container mx-auto flex items-center justify-between">
        <?php if (has_custom_logo()) {
            the_custom_logo();
        } else { ?>
            <a href="<?php echo home_url(); ?>" class="text-2xl font-bold text-white">Violet Electric</a>
        <?php } ?>
        <?php
        wp_nav_menu(array(
            'theme_location' => 'primary',
            'container' => false,
            'menu_class' => 'flex space-x-6 text-white font-semibold',
        ));
        ?>
    </div>
</header>

</body>
</html> 