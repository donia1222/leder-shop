<?php
require_once 'config.php';
setCORSHeaders();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

try {
    $pdo = getDBConnection();

    // Ensure table exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS payment_settings (
        id INT NOT NULL DEFAULT 1,
        paypal_email VARCHAR(255) NOT NULL DEFAULT '',
        stripe_secret_key VARCHAR(255) NOT NULL DEFAULT '',
        stripe_publishable_key VARCHAR(255) NOT NULL DEFAULT '',
        stripe_webhook_secret VARCHAR(255) NOT NULL DEFAULT '',
        twint_phone VARCHAR(50) NOT NULL DEFAULT '',
        bank_iban VARCHAR(50) NOT NULL DEFAULT '',
        bank_holder VARCHAR(255) NOT NULL DEFAULT '',
        bank_name VARCHAR(255) NOT NULL DEFAULT '',
        enable_paypal TINYINT(1) NOT NULL DEFAULT 0,
        enable_stripe TINYINT(1) NOT NULL DEFAULT 0,
        enable_twint TINYINT(1) NOT NULL DEFAULT 0,
        enable_invoice TINYINT(1) NOT NULL DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Migrations: add columns if missing
    $migrations = [
        "ALTER TABLE payment_settings ADD COLUMN bank_iban VARCHAR(50) NOT NULL DEFAULT ''",
        "ALTER TABLE payment_settings ADD COLUMN bank_holder VARCHAR(255) NOT NULL DEFAULT ''",
        "ALTER TABLE payment_settings ADD COLUMN bank_name VARCHAR(255) NOT NULL DEFAULT ''",
        "ALTER TABLE payment_settings ADD COLUMN enable_paypal TINYINT(1) NOT NULL DEFAULT 0",
        "ALTER TABLE payment_settings ADD COLUMN enable_stripe TINYINT(1) NOT NULL DEFAULT 0",
        "ALTER TABLE payment_settings ADD COLUMN enable_twint TINYINT(1) NOT NULL DEFAULT 0",
        "ALTER TABLE payment_settings ADD COLUMN enable_invoice TINYINT(1) NOT NULL DEFAULT 1",
    ];
    foreach ($migrations as $sql) {
        try { $pdo->exec($sql); } catch(Exception $e) {}
    }

    // Insert default row if empty
    $pdo->exec("INSERT IGNORE INTO payment_settings (id) VALUES (1)");

    $stmt = $pdo->query("SELECT paypal_email, stripe_publishable_key, twint_phone,
        bank_iban, bank_holder, bank_name,
        enable_paypal, enable_stripe, enable_twint, enable_invoice
        FROM payment_settings WHERE id = 1");
    $row = $stmt->fetch();

    // Cast booleans
    if ($row) {
        $row['enable_paypal']  = (bool)$row['enable_paypal'];
        $row['enable_stripe']  = (bool)$row['enable_stripe'];
        $row['enable_twint']   = (bool)$row['enable_twint'];
        $row['enable_invoice'] = (bool)$row['enable_invoice'];
    }

    echo json_encode(['success' => true, 'settings' => $row ?: [
        'paypal_email' => '', 'stripe_publishable_key' => '', 'twint_phone' => '',
        'bank_iban' => '', 'bank_holder' => '', 'bank_name' => '',
        'enable_paypal' => false, 'enable_stripe' => false,
        'enable_twint' => false, 'enable_invoice' => true,
    ]]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
