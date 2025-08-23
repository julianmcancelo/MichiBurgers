<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/cors.php';

$payload = jwt_parse_from_header_or_query();
if (!$payload) {
  http_response_code(401);
  echo json_encode(['error' => 'Token inválido']);
  exit;
}

$legajo = $payload->legajo ?? null;
if (!$legajo) {
  http_response_code(401);
  echo json_encode(['error' => 'Token inválido']);
  exit;
}

$sql = "SELECT legajo, nombre_completo, dni, rol, activo FROM usuarios WHERE legajo = :legajo LIMIT 1";
$stmt = db()->prepare($sql);
$stmt->execute([':legajo' => $legajo]);
$user = $stmt->fetch();

if (!$user || !(int)$user['activo']) {
  http_response_code(401);
  echo json_encode(['error' => 'Usuario no activo']);
  exit;
}

echo json_encode([
  'legajo' => $user['legajo'],
  'nombreCompleto' => $user['nombre_completo'],
  'dni' => $user['dni'],
  'rol' => $user['rol'],
]);
