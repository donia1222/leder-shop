<?php
require_once 'config.php';

setCORSHeaders();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = getDBConnection();

    // Create tables if they don't exist
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS shipping_zones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            countries TEXT NOT NULL,
            enabled TINYINT(1) NOT NULL DEFAULT 1
        )
    ");
    // Add enabled column if missing (migration)
    try { $pdo->exec("ALTER TABLE shipping_zones ADD COLUMN enabled TINYINT(1) NOT NULL DEFAULT 1"); } catch (PDOException $e) {}

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS shipping_weight_ranges (
            id INT AUTO_INCREMENT PRIMARY KEY,
            min_kg DECIMAL(6,3) NOT NULL,
            max_kg DECIMAL(6,3) NOT NULL,
            label VARCHAR(50) NOT NULL
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS shipping_rates (
            id INT AUTO_INCREMENT PRIMARY KEY,
            zone_id INT NOT NULL,
            range_id INT NOT NULL,
            price DECIMAL(8,2) NOT NULL DEFAULT 0,
            UNIQUE KEY zone_range (zone_id, range_id)
        )
    ");

    // Add weight_kg column to products if missing
    try {
        $pdo->exec("ALTER TABLE products ADD COLUMN weight_kg DECIMAL(5,3) NOT NULL DEFAULT 0.500");
    } catch (PDOException $e) {
        // Column already exists — ignore
    }

    // Seed default zones if empty
    $count = $pdo->query("SELECT COUNT(*) FROM shipping_zones")->fetchColumn();
    if ($count == 0) {
        $pdo->exec("
            INSERT INTO shipping_zones (name, countries) VALUES
            ('Schweiz', 'CH'),
            ('Europa', 'DE,FR,IT,AT,ES,NL,BE,PL,PT,CZ,DK,SE,FI,NO,HU,RO,HR,SK,SI,LU,LI'),
            ('International', '*')
        ");
    }

    // Seed default weight ranges if empty
    $count = $pdo->query("SELECT COUNT(*) FROM shipping_weight_ranges")->fetchColumn();
    if ($count == 0) {
        $pdo->exec("
            INSERT INTO shipping_weight_ranges (min_kg, max_kg, label) VALUES
            (0,     0.5,   '0–0.5 kg'),
            (0.5,   1,     '0.5–1 kg'),
            (1,     3,     '1–3 kg'),
            (3,     5,     '3–5 kg'),
            (5,     10,    '5–10 kg'),
            (10,    9999,  '10+ kg')
        ");
    }

    // Fetch data
    $zones  = $pdo->query("SELECT * FROM shipping_zones ORDER BY id")->fetchAll(PDO::FETCH_ASSOC);
    $ranges = $pdo->query("SELECT * FROM shipping_weight_ranges ORDER BY min_kg")->fetchAll(PDO::FETCH_ASSOC);
    $rates  = $pdo->query("SELECT * FROM shipping_rates")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'zones'   => $zones,
        'ranges'  => $ranges,
        'rates'   => $rates,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
