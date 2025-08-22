<?php
require_once __DIR__ . '/../_lib/bootstrap.php';

$area = isset($_GET['area']) ? $_GET['area'] : '';
$mesas = get_mesas();
if (!isset($mesas[$area]) || !is_array($mesas[$area])) fail('Area invalida', 400);

ok(['area' => $area, 'mesas' => $mesas[$area]]);
