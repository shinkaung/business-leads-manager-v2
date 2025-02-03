<?php
function handleApiError($errno, $errstr, $errfile, $errline) {
    $error = [
        'success' => false,
        'error' => [
            'message' => $errstr,
            'code' => $errno
        ]
    ];
    
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode($error);
    exit(1);
}

set_error_handler('handleApiError'); 