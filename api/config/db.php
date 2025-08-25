<?php
declare(strict_types=1);

// Ajusta estas variables (hardcoded para hosting sin .env)
$DB_HOST = 'localhost';
$DB_NAME = 'jcancelo_michiburgers';
$DB_USER = 'jcancelo_barberia';
$DB_PASS = 'feelthesky1';
$DB_CHARSET = 'utf8mb4';

// Mantengo helper db() para compatibilidad con el resto de la API
function db(): \PDO {
  static $pdo = null;
  if ($pdo) return $pdo;
  // usar variables definidas arriba dentro de la función
  global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS, $DB_CHARSET;

  $dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=$DB_CHARSET";
  $options = [
    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
    \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
    \PDO::ATTR_EMULATE_PREPARES => false,
  ];
  try {
    $pdo = new \PDO($dsn, $DB_USER, $DB_PASS, $options);
    return $pdo;
  } catch (\Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'DB connection failed']);
    exit;
  }
}
