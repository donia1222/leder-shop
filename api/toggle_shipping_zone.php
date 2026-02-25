<?php
require_once 'config.php';
setCORSHeaders();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit(); }

try {
    $pdo   = getDBConnection();
    $input = json_decode(file_get_contents('php://input'), true);
    $id      = intval($input['id'] ?? 0);
    $enabled = $input['enabled'] ? 1 : 0;

    if ($id <= 0) throw new Exception('ID inválido');

    error_log("[toggle_shipping_zone] id=$id enabled=$enabled");

    error_log("[toggle] id=$id input_raw=" . var_export($input['enabled'], true) . " computed_enabled=$enabled");

    $stmt = $pdo->prepare("UPDATE shipping_zones SET enabled = :enabled WHERE id = :id");
    $stmt->execute([':enabled' => $enabled, ':id' => $id]);
    $affected = $stmt->rowCount();

    // Read back from DB to confirm
    $check = $pdo->prepare("SELECT id, name, enabled FROM shipping_zones WHERE id = :id");
    $check->execute([':id' => $id]);
    $row = $check->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success'       => true,
        'id'            => $id,
        'sent'          => $enabled,
        'rows_affected' => $affected,
        'db_now'        => $row,   // <-- valor real en BD después del UPDATE
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
