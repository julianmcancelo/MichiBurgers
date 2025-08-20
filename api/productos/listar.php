<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

try {
  $pdo = db();
  $cats = $pdo->query('SELECT id, nombre, orden FROM categorias WHERE activo = 1 ORDER BY orden, nombre')->fetchAll();
  $prods = $pdo->query('SELECT id, categoria_id, nombre, descripcion, precio, activo, imagen_url FROM productos WHERE activo = 1 ORDER BY nombre')->fetchAll();
  echo json_encode(['categorias' => $cats, 'productos' => $prods]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Error de servidor']);
}
