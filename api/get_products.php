<?php
require_once 'config.php';

// Configurar CORS
setCORSHeaders();
header('Content-Type: application/json; charset=utf-8');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

try {
    // Obtener conexión a la base de datos
    $pdo = getDBConnection();
    
    // Obtener un producto específico por ID
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        
        if ($id <= 0) {
            throw new Exception('ID de producto inválido');
        }
        
        $sql = "SELECT * FROM products WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $product = $stmt->fetch();
        
        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Producto no encontrado']);
            exit();
        }
        
        // Agregar URLs completas de las imágenes
        $db_image_url = $product['image_url'] ?? null; // URL guardada desde el Excel
        $image_urls = [];
        $image_fields = ['image', 'image2', 'image3', 'image4'];

        foreach ($image_fields as $field) {
            if (!empty($product[$field])) {
                $image_urls[] = getUploadBaseUrl() . $product[$field];
            } else {
                $image_urls[] = null;
            }
        }

        $product['image_urls'] = $image_urls;
        $base_url = $image_urls[0] ?? $db_image_url;
        $product['image_url'] = $base_url;

        if ($base_url && !preg_match('/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/', $base_url)) {
            $product['image_url_candidates'] = [
                $base_url . '.jpg',
                $base_url . '.JPG',
                $base_url . '.jpeg',
                $base_url . '.JPEG',
                $base_url . '.png',
            ];
        } else {
            $product['image_url_candidates'] = $base_url ? [$base_url] : [];
        }
        
        // Convertir tipos de datos
        $product['id'] = intval($product['id']);
        $product['price'] = floatval($product['price']);
        $product['stock'] = intval($product['stock'] ?? 0);
        $product['heat_level'] = intval($product['heat_level']);
        $product['rating'] = floatval($product['rating']);
        $product['weight_kg'] = floatval($product['weight_kg'] ?? 0);
        
        echo json_encode([
            'success' => true,
            'product' => $product
        ]);
        
    } else {
        // Obtener parámetros de filtro
        $search = $_GET['search'] ?? '';
        $category = $_GET['category'] ?? '';
        $stock_status = $_GET['stock_status'] ?? ''; // Nuevo filtro por estado de stock
        
        // Construir consulta SQL base
        $sql = "SELECT * FROM products WHERE 1=1";
        $params = [];
        
        // Añadir filtro de búsqueda
        if (!empty($search)) {
            $sql .= " AND (name LIKE :search 
                     OR description LIKE :search 
                     OR badge LIKE :search 
                     OR origin LIKE :search)";
            $params[':search'] = '%' . trim($search) . '%';
        }
        
        // Añadir filtro de categoría
        if (!empty($category)) {
            $sql .= " AND category = :category";
            $params[':category'] = $category;
        }
        
        // Añadir filtro de stock
        if (!empty($stock_status)) {
            if ($stock_status === 'in_stock') {
                $sql .= " AND stock > 0";
            } elseif ($stock_status === 'out_of_stock') {
                $sql .= " AND stock = 0";
            } elseif ($stock_status === 'low_stock') {
                $sql .= " AND stock > 0 AND stock <= 10"; // Considerar bajo stock si hay 10 o menos
            }
        }
        
        $sql .= " ORDER BY category, created_at DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll();
        
        // Procesar cada producto
        foreach ($products as &$product) {
            // Agregar URLs completas de las imágenes
            $db_image_url = $product['image_url'] ?? null; // URL guardada desde el Excel
            $image_urls = [];
            $image_fields = ['image', 'image2', 'image3', 'image4'];

            foreach ($image_fields as $field) {
                if (!empty($product[$field])) {
                    $image_urls[] = getUploadBaseUrl() . $product[$field];
                } else {
                    $image_urls[] = null;
                }
            }

            $product['image_urls'] = $image_urls;
            // Prioridad: imagen subida manualmente → URL del Excel → null
            $base_url = $image_urls[0] ?? $db_image_url;
            $product['image_url'] = $base_url;

            // Generar variantes de extensión para que el frontend pruebe en orden
            if ($base_url && !preg_match('/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/', $base_url)) {
                $product['image_url_candidates'] = [
                    $base_url . '.jpg',
                    $base_url . '.JPG',
                    $base_url . '.jpeg',
                    $base_url . '.JPEG',
                    $base_url . '.png',
                ];
            } else {
                $product['image_url_candidates'] = $base_url ? [$base_url] : [];
            }
            
            // Convertir tipos de datos
            $product['id'] = intval($product['id']);
            $product['price'] = floatval($product['price']);
            $product['stock'] = intval($product['stock'] ?? 0);
            $product['heat_level'] = intval($product['heat_level']);
            $product['rating'] = floatval($product['rating']);
            $product['weight_kg'] = floatval($product['weight_kg'] ?? 0);
            
            // Asegurar que category no sea null
            if (empty($product['category'])) {
                $product['category'] = 'hot-sauce';
            }
            
            // Añadir estado de stock
            if ($product['stock'] == 0) {
                $product['stock_status'] = 'out_of_stock';
            } elseif ($product['stock'] <= 10) {
                $product['stock_status'] = 'low_stock';
            } else {
                $product['stock_status'] = 'in_stock';
            }
        }
        
        // Separar productos por categoría para estadísticas
        $hot_sauces = array_filter($products, function($p) {
            return $p['category'] === 'hot-sauce' || empty($p['category']);
        });
        
        $bbq_sauces = array_filter($products, function($p) {
            return $p['category'] === 'bbq-sauce';
        });
        
        // Estadísticas de stock
        $total_stock = array_sum(array_column($products, 'stock'));
        $out_of_stock_count = count(array_filter($products, function($p) {
            return $p['stock'] == 0;
        }));
        $low_stock_count = count(array_filter($products, function($p) {
            return $p['stock'] > 0 && $p['stock'] <= 10;
        }));
        
        echo json_encode([
            'success' => true,
            'products' => $products,
            'total' => count($products),
            'stats' => [
                'total_products' => count($products),
                'hot_sauces' => count($hot_sauces),
                'bbq_sauces' => count($bbq_sauces),
                'total_stock' => $total_stock,
                'out_of_stock' => $out_of_stock_count,
                'low_stock' => $low_stock_count,
                'in_stock' => count($products) - $out_of_stock_count
            ]
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error de base de datos: ' . $e->getMessage()
    ]);
}
?>