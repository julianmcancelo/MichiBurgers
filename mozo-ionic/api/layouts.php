<?php
require_once __DIR__ . '/_lib/bootstrap.php';

// Parametro de area (interior/exterior)
$area = isset($_GET['area']) ? $_GET['area'] : '';
if (!$area) fail('Area requerida', 400);

// Layouts de ejemplo; si queres, los podemos leer desde DB/JSON
$layouts = [
  'interior' => [
    // x,y son posiciones relativas (0..1) para un mapa simple del salon
    ['mesaId' => '1', 'x' => 0.10, 'y' => 0.20],
    ['mesaId' => '2', 'x' => 0.30, 'y' => 0.20],
    ['mesaId' => '3', 'x' => 0.50, 'y' => 0.20],
    ['mesaId' => '5', 'x' => 0.70, 'y' => 0.20],
  ],
  'exterior' => [
    ['mesaId' => 'A', 'x' => 0.20, 'y' => 0.50],
    ['mesaId' => 'B', 'x' => 0.60, 'y' => 0.50],
  ],
];

if (!isset($layouts[$area])) fail('Area invalida', 400);

ok(['area' => $area, 'layout' => $layouts[$area]]);
