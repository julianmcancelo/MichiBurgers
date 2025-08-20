<?php
declare(strict_types=1);

// Intenta cargar Composer si está disponible; si no, usa un cargador .env simple
$vendorAutoload = dirname(__DIR__) . '/vendor/autoload.php';
if (is_file($vendorAutoload)) {
  require_once $vendorAutoload;
  // Cargar .env con Dotenv si existe
  if (class_exists('Dotenv\\Dotenv')) {
    $dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
    $dotenv->safeLoad();
  }
} else {
  // Fallback: cargar .env manualmente si existe
  $envFile = dirname(__DIR__) . '/.env';
  if (is_file($envFile) && is_readable($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
      if (str_starts_with(trim($line), '#')) continue;
      $pos = strpos($line, '=');
      if ($pos === false) continue;
      $key = trim(substr($line, 0, $pos));
      $val = trim(substr($line, $pos + 1));
      // Quitar comillas si las hay
      if ((str_starts_with($val, '"') && str_ends_with($val, '"')) || (str_starts_with($val, "'") && str_ends_with($val, "'"))) {
        $val = substr($val, 1, -1);
      }
      $_ENV[$key] = $val;
      putenv($key . '=' . $val);
    }
  }
}
