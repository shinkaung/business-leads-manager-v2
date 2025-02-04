<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo json_encode([
    'server' => $_SERVER,
    'env' => getenv(),
    'base_path' => defined('BASE_PATH') ? BASE_PATH : 'undefined',
    'document_root' => $_SERVER['DOCUMENT_ROOT'],
    'script_filename' => $_SERVER['SCRIPT_FILENAME'],
    'php_version' => phpversion()
], JSON_PRETTY_PRINT); 