<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/cors.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$legajo = trim($input['legajo'] ?? '');
$password = (string)($input['password'] ?? '');

if ($legajo === '' || $password === '') {
  http_response_code(400);
  echo json_encode(['error' => 'Legajo y password son requeridos']);
  exit;
}

$sql = "SELECT id, legajo, nombre_completo, dni, rol, password_hash, activo FROM usuarios WHERE legajo = :legajo LIMIT 1";
$stmt = db()->prepare($sql);
$stmt->execute([':legajo' => $legajo]);
$user = $stmt->fetch();

if (!$user || !(int)$user['activo'] || !password_verify($password, $user['password_hash'])) {
  http_response_code(401);
  echo json_encode(['error' => 'Credenciales inválidas']);
  exit;
}

$token = jwt_issue([
  'sub' => (string)$user['id'],
  'legajo' => $user['legajo'],
  'rol' => $user['rol'],
]);

echo json_encode([
  'token' => $token,
  'usuario' => [
    'legajo' => $user['legajo'],
    'nombreCompleto' => $user['nombre_completo'],
    'dni' => $user['dni'],
    'rol' => $user['rol'],
  ]
]);
