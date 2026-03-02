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

    $name        = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $parent_id   = !empty($_POST['parent_id']) ? intval($_POST['parent_id']) : null;

    if (empty($name)) {
        throw new Exception('El nombre de la categoría es requerido');
    }

    // Generar slug a partir del nombre: minúsculas, espacios → guión, solo alfanumérico y guiones
    $slug = strtolower($name);
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
    $slug = trim($slug, '-');

    if (empty($slug)) {
        throw new Exception('No se pudo generar un slug válido para la categoría');
    }

    // Verificar que el slug no exista ya
    $stmt = $pdo->prepare("SELECT id FROM categories WHERE slug = :slug");
    $stmt->execute([':slug' => $slug]);
    if ($stmt->fetch()) {
        throw new Exception('Ya existe una categoría con ese nombre');
    }

    // Verificar que el parent_id existe y no tiene ya un padre (solo 2 niveles)
    if ($parent_id !== null) {
        $stmt = $pdo->prepare("SELECT id, parent_id FROM categories WHERE id = :id");
        $stmt->execute([':id' => $parent_id]);
        $parent = $stmt->fetch();
        if (!$parent) throw new Exception('Kategorie übergeordnet nicht gefunden');
        if ($parent['parent_id'] !== null) throw new Exception('Nur zwei Ebenen erlaubt');
    }

    $stmt = $pdo->prepare("INSERT INTO categories (slug, name, description, parent_id) VALUES (:slug, :name, :description, :parent_id)");
    $stmt->execute([
        ':slug'        => $slug,
        ':name'        => $name,
        ':description' => $description,
        ':parent_id'   => $parent_id
    ]);

    $new_id = intval($pdo->lastInsertId());

    echo json_encode([
        'success'  => true,
        'message'  => 'Categoría creada exitosamente',
        'category' => [
            'id'          => $new_id,
            'slug'        => $slug,
            'name'        => $name,
            'description' => $description,
            'parent_id'   => $parent_id
        ]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>
