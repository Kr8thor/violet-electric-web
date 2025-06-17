<?php
// Enhanced error logging for save debugging
error_log('Violet Save Debug: Total changes processed = ' . count($changes));
error_log('Violet Save Debug: Saved count = ' . $saved_count);
error_log('Violet Save Debug: Failed count = ' . $failed_count);

// Log each change for debugging
foreach ($changes as $i => $change) {
    error_log('Violet Save Debug Change ' . $i . ': ' . json_encode($change));
}

// Log current content state
$content_keys = array_keys($current_content);
error_log('Violet Save Debug: Total content fields = ' . count($content_keys));
error_log('Violet Save Debug: Content keys = ' . implode(', ', $content_keys));
?>