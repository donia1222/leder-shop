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

    $stmt = $pdo->prepare("INSERT INTO categories (slug, name, description) VALUES (:slug, :name, :description)");
    $stmt->execute([
        ':slug'        => $slug,
        ':name'        => $name,
        ':description' => $description
    ]);

    $new_id = intval($pdo->lastInsertId());

    echo json_encode([
        'success'  => true,
        'message'  => 'Categoría creada exitosamente',
        'category' => [
            'id'          => $new_id,
            'slug'        => $slug,
            'name'        => $name,
            'description' => $description
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
