<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json; charset=utf-8');

// Protección: requiere clave ?key=... para poder ejecutarse
$SEED_KEY = 'feelthesky1'; // Cambia esto antes de ejecutar
$key = $_GET['key'] ?? '';
if ($key !== $SEED_KEY) {
  http_response_code(403);
  echo json_encode(['error' => 'No autorizado (seed)']);
  exit;
}

// Datos por defecto del admin principal (puedes editar estos valores antes de ejecutar)
$legajo = 'A001';
$nombre = 'Administrador Principal';
$dni = '20000000';
$rol = 'admin';
$passwordPlano = 'admin123';

try {
  $pdo = db();
  // Si ya existe un admin, no crear
  $existeAdmin = $pdo->query("SELECT COUNT(*) FROM usuarios WHERE rol='admin'")->fetchColumn();
  if ((int)$existeAdmin > 0) {
    http_response_code(200);
    echo json_encode(['ok' => true, 'message' => 'Ya existe un usuario admin. Seed no ejecutado.']);
    exit;
  }

  // Si existe el legajo, abortar para no colisionar
  $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE legajo = :legajo LIMIT 1');
  $stmt->execute([':legajo' => $legajo]);
  if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'El legajo A001 ya existe. Modifica el legajo en seed-admin.php y reintenta.']);
    exit;
  }

  $hash = password_hash($passwordPlano, PASSWORD_BCRYPT);
  $sql = "INSERT INTO usuarios (legajo, nombre_completo, dni, rol, password_hash, activo, creado_en) VALUES (:legajo, :nombre, :dni, :rol, :hash, 1, NOW())";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':legajo' => $legajo,
    ':nombre' => $nombre,
    ':dni' => $dni,
    ':rol' => $rol,
    ':hash' => $hash,
  ]);

  http_response_code(201);
  echo json_encode([
    'ok' => true,
    'usuario' => [
      'legajo' => $legajo,
      'nombreCompleto' => $nombre,
      'dni' => $dni,
      'rol' => $rol,
      'password' => $passwordPlano
    ]
  ]);
} catch (\Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'No se pudo crear el admin']);
}
