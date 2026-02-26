<?php
require_once 'config.php';

setCORSHeaders();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Método no permitido']); exit(); }

try {
    $pdo = getDBConnection();

    $title = trim($_POST['title'] ?? '');
    $upload_dir = 'upload/';
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);

    $image_name = null;
    $allowed = ['jpg','jpeg','png','gif','webp'];

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $allowed)) throw new Exception('Tipo de archivo no permitido');
        if ($_FILES['image']['size'] > 8 * 1024 * 1024) throw new Exception('Imagen demasiado grande (máx 8MB)');
        $name = uniqid() . '_' . time() . '.' . $ext;
        if (!move_uploaded_file($_FILES['image']['tmp_name'], $upload_dir . $name)) throw new Exception('Error subiendo imagen');
        $image_name = $name;
    } elseif (!empty($_POST['image_url']) && preg_match('/^https?:\/\//', $_POST['image_url'])) {
        $image_name = trim($_POST['image_url']);
    } else {
        throw new Exception('Se requiere una imagen');
    }

    $stmt = $pdo->prepare("INSERT INTO gallery_images (title, image) VALUES (:title, :image)");
    $stmt->execute([
        ':title' => $title ?: null,
        ':image' => $image_name,
    ]);

    $base = getUploadBaseUrl();
    $image_url = preg_match('/^https?:\/\//', $image_name) ? $image_name : $base . $image_name;

    echo json_encode([
        'success' => true,
        'message' => 'Imagen añadida',
        'image_id' => intval($pdo->lastInsertId()),
        'image_url' => $image_url,
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
