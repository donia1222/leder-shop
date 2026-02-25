<?php
require_once 'config.php';
setCORSHeaders();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

try {
    $pdo = getDBConnection();

    // Ensure columns exist (migration)
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

    $stmt = $pdo->prepare("
        INSERT INTO payment_settings
            (id, paypal_email, stripe_secret_key, stripe_publishable_key, stripe_webhook_secret,
             twint_phone, bank_iban, bank_holder, bank_name,
             enable_paypal, enable_stripe, enable_twint, enable_invoice)
        VALUES
            (1, :paypal_email, :stripe_secret_key, :stripe_publishable_key, :stripe_webhook_secret,
             :twint_phone, :bank_iban, :bank_holder, :bank_name,
             :enable_paypal, :enable_stripe, :enable_twint, :enable_invoice)
        ON DUPLICATE KEY UPDATE
            paypal_email           = VALUES(paypal_email),
            stripe_secret_key      = VALUES(stripe_secret_key),
            stripe_publishable_key = VALUES(stripe_publishable_key),
            stripe_webhook_secret  = VALUES(stripe_webhook_secret),
            twint_phone            = VALUES(twint_phone),
            bank_iban              = VALUES(bank_iban),
            bank_holder            = VALUES(bank_holder),
            bank_name              = VALUES(bank_name),
            enable_paypal          = VALUES(enable_paypal),
            enable_stripe          = VALUES(enable_stripe),
            enable_twint           = VALUES(enable_twint),
            enable_invoice         = VALUES(enable_invoice),
            updated_at             = CURRENT_TIMESTAMP
    ");

    $stmt->execute([
        ':paypal_email'           => trim($data['paypal_email'] ?? ''),
        ':stripe_secret_key'      => trim($data['stripe_secret_key'] ?? ''),
        ':stripe_publishable_key' => trim($data['stripe_publishable_key'] ?? ''),
        ':stripe_webhook_secret'  => trim($data['stripe_webhook_secret'] ?? ''),
        ':twint_phone'            => trim($data['twint_phone'] ?? ''),
        ':bank_iban'              => trim($data['bank_iban'] ?? ''),
        ':bank_holder'            => trim($data['bank_holder'] ?? ''),
        ':bank_name'              => trim($data['bank_name'] ?? ''),
        ':enable_paypal'          => isset($data['enable_paypal'])  ? (int)(bool)$data['enable_paypal']  : 0,
        ':enable_stripe'          => isset($data['enable_stripe'])  ? (int)(bool)$data['enable_stripe']  : 0,
        ':enable_twint'           => isset($data['enable_twint'])   ? (int)(bool)$data['enable_twint']   : 0,
        ':enable_invoice'         => isset($data['enable_invoice']) ? (int)(bool)$data['enable_invoice'] : 1,
    ]);

    echo json_encode(['success' => true, 'message' => 'Einstellungen gespeichert']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
