<?php
require_once 'config.php';

setCORSHeaders();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

try {
    $pdo = getDBConnection();

    $id          = intval($_POST['id'] ?? 0);
    $name        = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');

    if ($id <= 0) throw new Exception('ID de categoría requerido');
    if (empty($name)) throw new Exception('El nombre es requerido');

    // Verificar que existe
    $stmt = $pdo->prepare("SELECT id, slug FROM categories WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $existing = $stmt->fetch();
    if (!$existing) throw new Exception('Kategorie nicht gefunden');

    // Actualizar solo nombre y descripción (el slug no cambia para no romper productos)
    $stmt = $pdo->prepare("UPDATE categories SET name = :name, description = :description WHERE id = :id");
    $stmt->execute([':name' => $name, ':description' => $description, ':id' => $id]);

    echo json_encode([
        'success' => true,
        'message' => 'Kategorie erfolgreich aktualisiert',
        'category' => ['id' => $id, 'slug' => $existing['slug'], 'name' => $name, 'description' => $description]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Datenbankfehler: ' . $e->getMessage()]);
}
?>
