<?php
require_once __DIR__ . '/../_lib/bootstrap.php';

$body = json_body();
$pedidoId = isset($body['pedidoId']) ? intval($body['pedidoId']) : 0;
if (!$pedidoId) fail('Datos invalidos', 400);

$pedidos = get_pedidos();
$mesas = get_mesas();
$found = false;

foreach ($pedidos as &$p) {
  if (intval($p['pedidoId']) === $pedidoId) { $p['pagado'] = true; $found = true; break; }
}
if (!$found) fail('Pedido no encontrado', 404);

foreach ($mesas as $area => &$arr) {
  foreach ($arr as &$m) {
    if (intval($m['pedidoId']) === $pedidoId) { $m['pagado'] = true; }
  }
}

save_pedidos($pedidos);
save_mesas($mesas);
ok(['ok' => true]);
