// ============================================================================
// 🚨 EMERGENCY CORS FIX - CRITICAL FOR OPTIONS REQUESTS
// ============================================================================

// URGENT: Handle OPTIONS requests BEFORE WordPress processes anything
add_action('plugins_loaded', 'violet_emergency_cors_fix', -999999);
function violet_emergency_cors_fix() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        // Get the origin
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
        $allowed_origins = array(
            'https://lustrous-dolphin-447351.netlify.app',
            'https://violetrainwater.com',
            'https://www.violetrainwater.com'
        );
        
        // Always allow if it's from allowed origins
        if ($origin && in_array($origin, $allowed_origins, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        }
        
        // Set all required CORS headers
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-WP-Nonce');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
        
        // Return 200 OK and exit immediately
        http_response_code(200);
        exit();
    }
}

// Even more aggressive - handle at the very earliest possible moment
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    $allowed_origins = array(
        'https://lustrous-dolphin-447351.netlify.app',
        'https://violetrainwater.com',
        'https://www.violetrainwater.com'
    );
    
    if ($origin && in_array($origin, $allowed_origins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-WP-Nonce');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
        http_response_code(200);
        exit();
    }
}
