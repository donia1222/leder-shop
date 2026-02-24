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
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit();
}

try {
    $body = file_get_contents('php://input');
    $data = json_decode($body, true);

    if (json_last_error() !== JSON_ERROR_NONE || !isset($data['products']) || !is_array($data['products'])) {
        throw new Exception('JSON inválido o falta el campo "products"');
    }

    $products = $data['products'];

    if (count($products) === 0) {
        throw new Exception('La lista de productos está vacía');
    }

    $pdo = getDBConnection();
    $pdo->beginTransaction();

    $inserted = 0;
    $updated  = 0;
    $skipped  = 0;
    $deleted  = 0;
    $errors   = [];

    // IDs válidos del Excel (para el sync final)
    $excelIds = [];

    // Cache de categorías ya procesadas en esta importación
    $categoriesCreated = [];

    foreach ($products as $index => $p) {
        try {
            // --- Validación mínima ---
            $id          = isset($p['id'])    ? intval($p['id'])            : 0;
            $name        = isset($p['name'])  ? trim($p['name'])            : '';
            $description = isset($p['description']) ? trim($p['description']) : '';
            $price       = isset($p['price']) ? floatval($p['price'])       : 0.0;
            $stock       = isset($p['stock']) ? intval($p['stock'])         : 0;
            $supplier    = isset($p['supplier']) ? trim($p['supplier'])     : '';
            $origin      = isset($p['origin'])   ? trim($p['origin'])       : '';
            $category    = isset($p['category']) ? trim($p['category'])     : '';
            $categoryName = isset($p['category_name']) ? trim($p['category_name']) : $category;
            $image_url   = isset($p['image_url']) && $p['image_url'] !== '' ? trim($p['image_url']) : null;

            if ($id <= 0 || $name === '') {
                $skipped++;
                $errors[] = "Fila $index: ID o nombre vacío, omitido.";
                continue;
            }

            // Registrar ID válido para el sync
            $excelIds[] = $id;

            // --- Auto-crear categoría si no existe ---
            if ($category !== '' && !isset($categoriesCreated[$category])) {
                $stmtCat = $pdo->prepare("SELECT id FROM categories WHERE slug = :slug");
                $stmtCat->execute([':slug' => $category]);
                if (!$stmtCat->fetch()) {
                    $stmtInsertCat = $pdo->prepare(
                        "INSERT INTO categories (slug, name) VALUES (:slug, :name)"
                    );
                    $stmtInsertCat->execute([
                        ':slug' => $category,
                        ':name' => $categoryName
                    ]);
                }
                $categoriesCreated[$category] = true;
            }

            // --- UPSERT: INSERT si no existe, UPDATE si ya existe ---
            $sql = "INSERT INTO products
                        (id, name, description, price, stock, supplier, origin, category,
                         heat_level, rating, badge, image_url)
                    VALUES
                        (:id, :name, :description, :price, :stock, :supplier, :origin, :category,
                         1, 0.0, '', :image_url)
                    ON DUPLICATE KEY UPDATE
                        name        = VALUES(name),
                        description = VALUES(description),
                        price       = VALUES(price),
                        stock       = VALUES(stock),
                        supplier    = VALUES(supplier),
                        origin      = VALUES(origin),
                        category    = VALUES(category),
                        image_url   = IF(VALUES(image_url) IS NOT NULL, VALUES(image_url), image_url),
                        updated_at  = CURRENT_TIMESTAMP";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id'          => $id,
                ':name'        => $name,
                ':description' => $description,
                ':price'       => $price,
                ':stock'       => $stock,
                ':supplier'    => $supplier,
                ':origin'      => $origin,
                ':category'    => $category,
                ':image_url'   => $image_url,
            ]);

            // rowCount() = 1 → INSERT, 2 → UPDATE, 0 → sin cambios
            $affected = $stmt->rowCount();
            if ($affected === 1) {
                $inserted++;
            } elseif ($affected === 2) {
                $updated++;
            } else {
                $skipped++;
            }

        } catch (Exception $e) {
            $errors[] = "Fila $index (ID {$p['id']}): " . $e->getMessage();
            $skipped++;
        }
    }

    // --- SYNC: borrar productos que ya no están en el Excel ---
    // Solo borra productos que tengan supplier (= importados desde Excel),
    // protegiendo los añadidos manualmente (sin supplier).
    if (!empty($excelIds)) {
        $placeholders = implode(',', array_fill(0, count($excelIds), '?'));
        $stmtDel = $pdo->prepare(
            "DELETE FROM products
             WHERE id NOT IN ($placeholders)
             AND (supplier IS NOT NULL AND supplier != '')"
        );
        $stmtDel->execute($excelIds);
        $deleted = $stmtDel->rowCount();
    }

    $pdo->commit();

    echo json_encode([
        'success'  => true,
        'inserted' => $inserted,
        'updated'  => $updated,
        'skipped'  => $skipped,
        'deleted'  => $deleted,
        'total'    => count($products),
        'errors'   => $errors
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>
