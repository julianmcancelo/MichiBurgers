<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/cors.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$password = (string)($input['password'] ?? '');

if ($password === '') {
  http_response_code(400);
  echo json_encode(['error' => 'Password requerida']);
  exit;
}

// Obtener hash actual de la contraseña maestra
$sql = "SELECT id, password_hash FROM master_secret WHERE id = 1 LIMIT 1";
$stmt = db()->query($sql);
$row = $stmt->fetch();

if (!$row) {
  http_response_code(503);
  echo json_encode(['error' => 'Master password no inicializada']);
  exit;
}

if (!password_verify($password, (string)$row['password_hash'])) {
  http_response_code(401);
  echo json_encode(['error' => 'Contraseña inválida']);
  exit;
}

$token = jwt_issue([
  'sub' => 'master:1',
  'scope' => 'master'
]);

echo json_encode(['token' => $token]);
