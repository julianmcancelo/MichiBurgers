<?php
require_once __DIR__ . '/../_lib/bootstrap.php';

$body = json_body();
$area = isset($body['area']) ? $body['area'] : '';
$mesaId = isset($body['mesaId']) ? (string)$body['mesaId'] : '';
if (!$area || !$mesaId) fail('Datos invalidos', 400);

$mesas = get_mesas();
if (!isset($mesas[$area])) fail('Area invalida', 400);

$mesaRef = null;
foreach ($mesas[$area] as &$m) {
  if ((string)$m['mesaId'] === $mesaId) { $mesaRef = &$m; break; }
}
if (!$mesaRef) fail('Mesa no encontrada', 404);

if ($mesaRef['estado'] === 'libre') {
  ok(['ok' => true, 'yaLibre' => true]);
}

$mesaRef['estado'] = 'libre';
$mesaRef['pedidoId'] = null;
$mesaRef['pagado'] = false;

save_mesas($mesas);
ok(['ok' => true]);
