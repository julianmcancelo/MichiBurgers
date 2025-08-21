<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/cors.php';

$auth = jwt_parse_from_header();
if (!$auth || ($auth->scope ?? '') !== 'master') {
  http_response_code(401);
  echo json_encode(['error' => 'No autorizado']);
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

$stmt = db()->query("SELECT password_hash FROM master_secret WHERE id=1 LIMIT 1");
$row = $stmt->fetch();
if (!$row || !password_verify($current, (string)$row['password_hash'])) {
  http_response_code(401);
  echo json_encode(['error' => 'Contraseña actual inválida']);
  exit;
}

$hash = password_hash($new, PASSWORD_BCRYPT);
$upd = db()->prepare("UPDATE master_secret SET password_hash=:h WHERE id=1");
$upd->execute([':h' => $hash]);

echo json_encode(['ok' => true]);
