<?php
require_once '../config/config.php';
require_once '../utils/AirtableClient.php';

$client = new AirtableClient(AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        try {
            error_log('Fetching records from Airtable...');
            $result = $client->get();
            error_log('Fetched records: ' . json_encode($result));
            echo json_encode($result);
        } catch (Exception $e) {
            error_log('Error fetching records: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Extract fields from the first record
            $fields = $data['records'][0]['fields'] ?? null;
            if (!$fields) {
                throw new Exception('Fields data is required');
            }
            
            $result = $client->create(['fields' => $fields]);
            echo json_encode($result);
        } catch (Exception $e) {
            error_log('Create record error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PATCH':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $recordId = $_GET['id'] ?? '';
            if (!$recordId) {
                throw new Exception('Record ID is required');
            }
            
            // Extract the fields from the first record
            $fields = $data['records'][0]['fields'] ?? null;
            if (!$fields) {
                throw new Exception('Fields data is required');
            }
            
            $result = $client->update($recordId, ['fields' => $fields]);
            echo json_encode($result);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        try {
            $recordId = $_GET['id'] ?? '';
            if (!$recordId) {
                throw new Exception('Record ID is required');
            }
            $result = $client->delete($recordId);
            echo json_encode($result);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}