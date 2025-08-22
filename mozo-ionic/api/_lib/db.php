<?php
require_once __DIR__ . '/config.php';

function db_enabled() {
  return defined('DB_DSN') && DB_DSN !== '';
}

function db_conn() {
  static $pdo = null;
  if ($pdo !== null) return $pdo;
  if (!db_enabled()) return null;
  try {
    $pdo = new PDO(DB_DSN, DB_USER, DB_PASS, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    return $pdo;
  } catch (Throwable $e) {
    return null;
  }
}

function db_all($sql, $params = []) {
  $pdo = db_conn(); if (!$pdo) return [];
  $st = $pdo->prepare($sql); $st->execute($params);
  return $st->fetchAll();
}

function db_one($sql, $params = []) {
  $pdo = db_conn(); if (!$pdo) return null;
  $st = $pdo->prepare($sql); $st->execute($params);
  $row = $st->fetch();
  return $row ?: null;
}

function db_exec($sql, $params = []) {
  $pdo = db_conn(); if (!$pdo) return 0;
  $st = $pdo->prepare($sql); $st->execute($params);
  return $st->rowCount();
}

function db_last_id() {
  $pdo = db_conn(); if (!$pdo) return 0;
  return intval($pdo->lastInsertId());
}

// Helper compatible pedido: retorna \PDO o lanza 500 si no hay conexión
function db() {
  $pdo = db_conn();
  if ($pdo instanceof PDO) return $pdo;
  http_response_code(500);
  header('Content-Type: application/json');
  echo json_encode(['error' => 'DB connection failed']);
  exit;
}
