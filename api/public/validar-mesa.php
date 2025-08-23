<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/qr.php';

header('Content-Type: application/json');

// Params: GET /public/validar-mesa.php?area=interior|exterior&mesa=ID&sig=...
$area = isset($_GET['area']) ? (string)$_GET['area'] : '';
$mesa = isset($_GET['mesa']) ? (string)$_GET['mesa'] : '';
$sig  = isset($_GET['sig'])  ? (string)$_GET['sig']  : '';

if (!in_array($area, ['interior','exterior'], true) || $mesa === '' || $sig === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Parámetros inválidos']);
  exit;
}

try {
  if (!qr_is_valid($area, $mesa, $sig)) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Firma inválida']);
    exit;
  }

  echo json_encode([
    'ok' => true,
    'area' => $area,
    'mesa' => $mesa,
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Error de servidor']);
}
