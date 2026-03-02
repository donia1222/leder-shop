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
    $parent_id   = !empty($_POST['parent_id']) ? intval($_POST['parent_id']) : null;

    if ($id <= 0) throw new Exception('ID de categoría requerido');
    if (empty($name)) throw new Exception('El nombre es requerido');

    // Verificar que existe
    $stmt = $pdo->prepare("SELECT id, slug FROM categories WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $existing = $stmt->fetch();
    if (!$existing) throw new Exception('Kategorie nicht gefunden');

    // Verificar que el parent_id existe y no crea referencia circular
    if ($parent_id !== null) {
        if ($parent_id === $id) throw new Exception('Eine Kategorie kann nicht ihr eigenes Elternteil sein');
        $stmt = $pdo->prepare("SELECT id, parent_id FROM categories WHERE id = :id");
        $stmt->execute([':id' => $parent_id]);
        $parent = $stmt->fetch();
        if (!$parent) throw new Exception('Übergeordnete Kategorie nicht gefunden');
        if ($parent['parent_id'] !== null) throw new Exception('Nur zwei Ebenen erlaubt');
    }

    // Actualizar nombre, descripción y parent_id (el slug no cambia para no romper productos)
    $stmt = $pdo->prepare("UPDATE categories SET name = :name, description = :description, parent_id = :parent_id WHERE id = :id");
    $stmt->execute([':name' => $name, ':description' => $description, ':parent_id' => $parent_id, ':id' => $id]);

    echo json_encode([
        'success' => true,
        'message' => 'Kategorie erfolgreich aktualisiert',
        'category' => ['id' => $id, 'slug' => $existing['slug'], 'name' => $name, 'description' => $description, 'parent_id' => $parent_id]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Datenbankfehler: ' . $e->getMessage()]);
}
?>
