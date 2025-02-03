<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo json_encode([
    'status' => 'ok',
    'method' => $_SERVER['REQUEST_METHOD'],
    'headers' => getallheaders(),
    'input' => file_get_contents('php://input'),
    'request_uri' => $_SERVER['REQUEST_URI'],
    'script_filename' => $_SERVER['SCRIPT_FILENAME']
]);