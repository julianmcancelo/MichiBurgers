<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/cors.php';

// Recupero de contraseña sin email: valida legajo + DNI y setea nueva contraseña
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$legajo = (string)($input['legajo'] ?? '');
$dni = (string)($input['dni'] ?? '');
$new = (string)($input['new'] ?? '');

if ($legajo === '' || $dni === '' || $new === '') {
  http_response_code(400);
  echo json_encode(['error' => 'Datos incompletos']);
  exit;
}

$stmt = db()->prepare("SELECT id, dni, activo FROM usuarios WHERE legajo = :leg LIMIT 1");
$stmt->execute([':leg' => $legajo]);
$user = $stmt->fetch();

if (!$user || !(int)$user['activo']) {
  http_response_code(404);
  echo json_encode(['error' => 'Usuario no encontrado o inactivo']);
  exit;
}

if ((string)$user['dni'] !== $dni) {
  http_response_code(401);
  echo json_encode(['error' => 'Datos de verificación incorrectos']);
  exit;
}

$hash = password_hash($new, PASSWORD_BCRYPT);
$upd = db()->prepare("UPDATE usuarios SET password_hash = :h WHERE id = :id");
$upd->execute([':h' => $hash, ':id' => $user['id']]);

echo json_encode(['ok' => true]);
