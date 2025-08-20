<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/cors.php';

// Leer input primero (no se puede leer php://input dos veces)
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// Autorización: permite JWT admin por body.token o por header, O clave X-Admin-Key
$payload = null;
$tokenFromBody = isset($input['token']) && is_string($input['token']) ? trim($input['token']) : '';
if ($tokenFromBody !== '') {
  $decoded = jwt_decode($tokenFromBody, (string)($_ENV['JWT_SECRET'] ?? ''));
  if (is_array($decoded)) { $payload = (object)$decoded; }
}
if (!$payload) {
  $payload = jwt_parse_from_header();
}
$isJwtAdmin = $payload && (($payload->rol ?? '') === 'admin');
$serverAdminKey = (string)($_ENV['ADMIN_REG_KEY'] ?? '');
$providedAdminKey = $_SERVER['HTTP_X_ADMIN_KEY'] ?? '';
$isHeaderAdmin = ($serverAdminKey !== '' && hash_equals($serverAdminKey, $providedAdminKey));
if (!$isJwtAdmin && !$isHeaderAdmin) {
  http_response_code(403);
  echo json_encode(['error' => 'No autorizado']);
  exit;
}
$legajo = trim((string)($input['legajo'] ?? ''));
$nombre = trim((string)($input['nombreCompleto'] ?? ''));
$dni = trim((string)($input['dni'] ?? ''));
$rol = trim((string)($input['rol'] ?? ''));
$password = (string)($input['password'] ?? '');

$rolesValidos = ['admin','mozo','cocina','caja'];
if ($legajo === '' || $nombre === '' || $dni === '' || $password === '' || !in_array($rol, $rolesValidos, true)) {
  http_response_code(400);
  echo json_encode(['error' => 'Datos inválidos']);
  exit;
}

$hash = password_hash($password, PASSWORD_BCRYPT);

$sql = "INSERT INTO usuarios (legajo, nombre_completo, dni, rol, password_hash, activo, creado_en) VALUES (:legajo, :nombre, :dni, :rol, :hash, 1, NOW())";
try {
  $stmt = db()->prepare($sql);
  $stmt->execute([
    ':legajo' => $legajo,
    ':nombre' => $nombre,
    ':dni' => $dni,
    ':rol' => $rol,
    ':hash' => $hash,
  ]);
  http_response_code(201);
  echo json_encode(['ok' => true]);
} catch (\PDOException $e) {
  // 1062: duplicate entry
  if ($e->errorInfo[1] ?? null) {
    if ((int)$e->errorInfo[1] === 1062) {
      http_response_code(409);
      echo json_encode(['error' => 'Legajo o DNI ya existe']);
      exit;
    }
  }
  http_response_code(500);
  echo json_encode(['error' => 'Error al crear usuario']);
}
