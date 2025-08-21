<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/cors.php';

$payload = jwt_parse_from_header();
if (!$payload) {
  http_response_code(401);
  echo json_encode(['error' => 'No autorizado']);
  exit;
}

$legajo = (string)($payload->legajo ?? '');
if ($legajo === '') {
  http_response_code(401);
  echo json_encode(['error' => 'Token inválido']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$current = (string)($input['current'] ?? '');
$new = (string)($input['new'] ?? '');

if ($current === '' || $new === '') {
  http_response_code(400);
  echo json_encode(['error' => 'Datos incompletos']);
  exit;
}

$stmt = db()->prepare("SELECT id, password_hash, activo FROM usuarios WHERE legajo = :legajo LIMIT 1");
$stmt->execute([':legajo' => $legajo]);
$user = $stmt->fetch();

if (!$user || !(int)$user['activo'] || !password_verify($current, (string)$user['password_hash'])) {
  http_response_code(401);
  echo json_encode(['error' => 'Contraseña actual inválida']);
  exit;
}

$hash = password_hash($new, PASSWORD_BCRYPT);
$upd = db()->prepare("UPDATE usuarios SET password_hash = :h WHERE id = :id");
$upd->execute([':h' => $hash, ':id' => $user['id']]);

echo json_encode(['ok' => true]);
