# Quick Debug Code for WordPress Save Issue

## Add this to your functions.php temporarily to debug the save issue:

```php
// Add debug logging to the save function
add_action('rest_api_init', function() {
    register_rest_route('violet/v1', '/debug-save', array(
        'methods' => 'POST',
        'callback' => function($request) {
            $test_value = 'Debug Test ' . time();
            
            // Test 1: Direct option save
            $result1 = update_option('violet_test_direct', $test_value);
            $verify1 = get_option('violet_test_direct');
            
            // Test 2: Delete and add
            delete_option('violet_test_delete_add');
            $result2 = add_option('violet_test_delete_add', $test_value);
            $verify2 = get_option('violet_test_delete_add');
            
            // Test 3: Check database directly
            global $wpdb;
            $db_check = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT option_value FROM {$wpdb->options} WHERE option_name = %s",
                    'violet_test_direct'
                )
            );
            
            // Test 4: Check autoload
            $autoload_check = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT autoload FROM {$wpdb->options} WHERE option_name = %s",
                    'violet_hero_title'
                )
            );
            
            return array(
                'test1_update' => $result1,
                'test1_verify' => $verify1,
                'test1_matches' => ($verify1 === $test_value),
                'test2_add' => $result2,
                'test2_verify' => $verify2,
                'test2_matches' => ($verify2 === $test_value),
                'db_direct' => $db_check,
                'hero_title_autoload' => $autoload_check,
                'current_hero_title' => get_option('violet_hero_title'),
                'all_violet_options' => $wpdb->get_results(
                    "SELECT option_name, option_value FROM {$wpdb->options} 
                     WHERE option_name LIKE 'violet_%' 
                     ORDER BY option_name"
                )
            );
        },
        'permission_callback' => '__return_true'
    ));
});
```

## Test in browser console:
```javascript
// Run this in the WordPress admin console
fetch('/wp-json/violet/v1/debug-save', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
})
.then(r => r.json())
.then(data => {
    console.log('Debug Save Results:', data);
    if (!data.test1_matches) {
        console.error('❌ update_option is not working!');
    }
    if (!data.test2_matches) {
        console.error('❌ add_option is not working!');
    }
    console.log('Current hero_title in DB:', data.current_hero_title);
    console.log('All violet options:', data.all_violet_options);
});
```

## Common WordPress Save Issues:

1. **Object Cache**: Some hosts cache options
   ```php
   // Add to save function:
   wp_cache_delete('violet_' . $field_name, 'options');
   ```

2. **Autoload Issues**: 
   ```php
   // Force autoload:
   update_option($option_name, $value, 'yes');
   ```

3. **Database Permissions**: Check if wp_options table is writable

4. **Option Name Length**: WordPress limits option names to 191 characters

5. **Serialization Issues**: Complex data might not save properly
