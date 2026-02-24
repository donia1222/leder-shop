<?php
require_once 'config.php';

setCORSHeaders();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'])) {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

try {
    $pdo = getDBConnection();

    $stmt = $pdo->query("SELECT id, slug, name, description, created_at FROM categories ORDER BY id ASC");
    $categories = $stmt->fetchAll();

    foreach ($categories as &$cat) {
        $cat['id'] = intval($cat['id']);
    }

    echo json_encode([
        'success' => true,
        'categories' => $categories,
        'total' => count($categories)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>
