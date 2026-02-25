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
    $country   = strtoupper(trim($input['country']   ?? 'CH'));
    $weight_kg = floatval($input['weight_kg'] ?? 0);

    // Load only enabled zones
    $zones = $pdo->query("SELECT * FROM shipping_zones WHERE enabled = 1 ORDER BY id")->fetchAll(PDO::FETCH_ASSOC);

    // Detect zone: first match wins (CH → Schweiz, then Europa, then International)
    $matched_zone = null;
    $fallback_zone = null;

    foreach ($zones as $zone) {
        $countries_raw = trim($zone['countries']);
        if ($countries_raw === '*') {
            $fallback_zone = $zone;
            continue;
        }
        $list = array_map('trim', explode(',', strtoupper($countries_raw)));
        if (in_array($country, $list)) {
            $matched_zone = $zone;
            break;
        }
    }

    if (!$matched_zone) {
        $matched_zone = $fallback_zone;
    }

    if (!$matched_zone) {
        echo json_encode(['success' => true, 'price' => 0, 'zone' => '', 'range' => '']);
        exit();
    }

    // Find matching weight range
    $stmt = $pdo->prepare("
        SELECT * FROM shipping_weight_ranges
        WHERE min_kg <= :w AND max_kg > :w2
        ORDER BY min_kg ASC
        LIMIT 1
    ");
    $stmt->execute([':w' => $weight_kg, ':w2' => $weight_kg]);
    $range = $stmt->fetch(PDO::FETCH_ASSOC);

    // Fallback: pick the last (heaviest) range if nothing matched
    if (!$range) {
        $range = $pdo->query("SELECT * FROM shipping_weight_ranges ORDER BY min_kg DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
    }

    if (!$range) {
        echo json_encode(['success' => true, 'price' => 0, 'zone' => $matched_zone['name'], 'range' => '']);
        exit();
    }

    // Fetch rate
    $stmt = $pdo->prepare("SELECT price FROM shipping_rates WHERE zone_id = :z AND range_id = :r");
    $stmt->execute([':z' => $matched_zone['id'], ':r' => $range['id']]);
    $rate_row = $stmt->fetch(PDO::FETCH_ASSOC);
    $price = $rate_row ? floatval($rate_row['price']) : 0;

    echo json_encode([
        'success' => true,
        'price'   => $price,
        'zone'    => $matched_zone['name'],
        'range'   => $range['label'],
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
