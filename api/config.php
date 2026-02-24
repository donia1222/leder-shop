<?php
// URL base del sitio (usada para construir URLs de imágenes)
define('SITE_BASE_URL', 'https://web.lweb.ch/ledershop');

// Configuración de la base de datos
define('DB_HOST', 'your_host');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password'); // ⚠️ FALTA COMPLETAR
define('DB_CHARSET', 'utf8mb4');

// Configuración de CORS
define('ALLOWED_ORIGINS', [
    'http://localhost:3000',
    'http://localhost:3001',
       'http://localhost:3002',
    'http://localhost:3003',
       'http://localhost:3004',
    'http://localhost:3005',
    'https://hot-sauce-store-pink.vercel.app',
]);

// Función para conectar a la base de datos
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        throw new Exception("Database connection failed: " . $e->getMessage());
    }
}

// Función para configurar headers CORS
function setCORSHeaders() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, ALLOWED_ORIGINS)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header('Access-Control-Allow-Origin: *');
    }
    
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
}
?>

