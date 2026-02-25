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
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $pdo = getDBConnection();

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        throw new Exception('Invalid JSON body');
    }

    $zones  = $input['zones']  ?? [];
    $ranges = $input['ranges'] ?? [];
    $rates  = $input['rates']  ?? [];

    $pdo->beginTransaction();

    // Replace zones
    $pdo->exec("DELETE FROM shipping_zones");
    $stmtZone = $pdo->prepare("INSERT INTO shipping_zones (id, name, countries, enabled) VALUES (:id, :name, :countries, :enabled)");
    foreach ($zones as $z) {
        $stmtZone->execute([
            ':id'        => intval($z['id']),
            ':name'      => trim($z['name']),
            ':countries' => trim($z['countries']),
            ':enabled'   => isset($z['enabled']) && $z['enabled'] ? 1 : 0,
        ]);
    }

    // Replace weight ranges
    $pdo->exec("DELETE FROM shipping_weight_ranges");
    $stmtRange = $pdo->prepare("INSERT INTO shipping_weight_ranges (id, min_kg, max_kg, label) VALUES (:id, :min_kg, :max_kg, :label)");
    foreach ($ranges as $r) {
        $stmtRange->execute([
            ':id'     => intval($r['id']),
            ':min_kg' => floatval($r['min_kg']),
            ':max_kg' => floatval($r['max_kg']),
            ':label'  => trim($r['label']),
        ]);
    }

    // Replace rates
    $pdo->exec("DELETE FROM shipping_rates");
    $stmtRate = $pdo->prepare("INSERT INTO shipping_rates (zone_id, range_id, price) VALUES (:zone_id, :range_id, :price)");
    foreach ($rates as $rate) {
        $stmtRate->execute([
            ':zone_id'  => intval($rate['zone_id']),
            ':range_id' => intval($rate['range_id']),
            ':price'    => floatval($rate['price']),
        ]);
    }

    $pdo->commit();

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
