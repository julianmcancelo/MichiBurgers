<?php
require_once __DIR__ . '/../_lib/bootstrap.php';

$body = json_body();
$area = isset($body['area']) ? $body['area'] : '';
$mesaId = isset($body['mesaId']) ? (string)$body['mesaId'] : '';
if (!$area || !$mesaId) fail('Datos invalidos', 400);

$mesas = get_mesas();
if (!isset($mesas[$area])) fail('Area invalida', 400);

$seq = load_data('seq.json', []);
$pedidos = get_pedidos();

$mesaRef = null;
foreach ($mesas[$area] as &$m) {
  if ((string)$m['mesaId'] === $mesaId) { $mesaRef = &$m; break; }
}
if (!$mesaRef) fail('Mesa no encontrada', 404);

if ($mesaRef['estado'] === 'ocupada' && $mesaRef['pedidoId']) {
  ok(['ok' => true, 'yaOcupada' => true, 'pedidoId' => $mesaRef['pedidoId']]);
}

// crear pedido
$pedidoId = next_id($seq, 'pedidoId');
$pedido = [
  'pedidoId' => $pedidoId,
  'mesa' => $mesaId,
  'mozo' => 'Mozo',
  'hora' => date('H:i'),
  'pagado' => false,
  'items' => []
];
$pedidos[] = $pedido;

$mesaRef['estado'] = 'ocupada';
$mesaRef['pedidoId'] = $pedidoId;
$mesaRef['pagado'] = false;

save_data('seq.json', $seq);
save_pedidos($pedidos);
save_mesas($mesas);

ok(['ok' => true, 'pedidoId' => $pedidoId]);
