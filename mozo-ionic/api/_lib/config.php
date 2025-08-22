<?php
// Config de DB hardcodeada para hosting sin .env
// Ajusta estas variables según tu servidor
if (!defined('DB_HOST')) { define('DB_HOST', 'localhost'); }
if (!defined('DB_NAME')) { define('DB_NAME', 'jcancelo_burgersaurio'); }
if (!defined('DB_USER')) { define('DB_USER', 'jcancelo_barberia'); }
if (!defined('DB_PASS')) { define('DB_PASS', 'feelthesky1'); }
if (!defined('DB_CHARSET')) { define('DB_CHARSET', 'utf8mb4'); }

// Construir DSN a partir de los valores anteriores
if (!defined('DB_DSN')) {
  define('DB_DSN', 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET);
}
