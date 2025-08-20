<?php
declare(strict_types=1);
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/jwt.php';
require_once __DIR__ . '/config/cors.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$area = ($_GET['area'] ?? $_POST['area'] ?? 'interior');
if (!in_array($area, ['interior','exterior'], true)) {
  http_response_code(400);
  echo json_encode(['error' => 'Área inválida']);
  exit;
}

try {
  if ($method === 'GET') {
    $stmt = db()->prepare('SELECT area, data, updated_at FROM layouts WHERE area = :area LIMIT 1');
    $stmt->execute([':area' => $area]);
    $row = $stmt->fetch();
    $data = $row ? json_decode($row['data'], true) : [];
    echo json_encode(['area' => $area, 'data' => $data, 'updated_at' => $row['updated_at'] ?? null]);
    exit;
  }

  if ($method === 'PUT') {
    // Solo admin puede guardar layout
    $payload = jwt_parse_from_header();
    // Soportar token en body si el cliente lo envía via fetch PUT con body JSON
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);
    if (!$payload && is_array($body) && isset($body['token'])) {
      $dec = jwt_decode((string)$body['token'], (string)($_ENV['JWT_SECRET'] ?? ''));
      if (is_array($dec)) $payload = (object)$dec;
    }
    if (!$payload || (($payload->rol ?? '') !== 'admin')) {
      http_response_code(403);
      echo json_encode(['error' => 'No autorizado']);
      exit;
    }

    $mesas = is_array($body) ? $body : [];
    // Cuando viene vía HttpClient.put, `area` puede venir por query param. Ya lo tomamos arriba.
    $json = json_encode($mesas, JSON_UNESCAPED_UNICODE);
    $sql = 'INSERT INTO layouts (area, data) VALUES (:area, :data)
            ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = CURRENT_TIMESTAMP';
    $stmt = db()->prepare($sql);
    $stmt->execute([':area' => $area, ':data' => $json]);
    echo json_encode(['ok' => true]);
    exit;
  }

  http_response_code(405);
  echo json_encode(['error' => 'Método no permitido']);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Error de servidor']);
}
