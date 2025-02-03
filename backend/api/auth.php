<?php
// Start output buffering
ob_start();

// Include error handler
require_once __DIR__ . '/../utils/error_handler.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Include configuration
    require_once __DIR__ . '/../config/config.php';

    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    // Simple authentication logic (replace with your actual logic)
    if ($username === 'admin' && $password === 'admin123') {
        echo json_encode([
            'success' => true,
            'username' => $username,
            'role' => 'Admin'
        ]);
    } else if ($username === 'sales' && $password === 'sales123') {
        echo json_encode([
            'success' => true,
            'username' => $username,
            'role' => 'SalesPerson'
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid credentials'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Clear output buffer
while (ob_get_level()) {
    ob_end_clean();
}