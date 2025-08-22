<?php
require_once __DIR__ . '/../_lib/bootstrap.php';

$body = json_body();
$pedidoId = isset($body['pedidoId']) ? intval($body['pedidoId']) : 0;
$productoId = isset($body['productoId']) ? intval($body['productoId']) : 0;
$cantidad = isset($body['cantidad']) ? intval($body['cantidad']) : 1;
if (!$pedidoId || !$productoId || $cantidad < 1) fail('Datos invalidos', 400);

$pedidos = get_pedidos();
$seq = load_data('seq.json', []);
$found = false;

foreach ($pedidos as &$p) {
  if (intval($p['pedidoId']) === $pedidoId) {
    $p['items'][] = [
      'itemId' => next_id($seq, 'itemId'),
      'producto' => 'Producto #' . $productoId,
      'cantidad' => $cantidad,
      'estado' => 'pendiente'
    ];
    $found = true;
    break;
  }
}
if (!$found) fail('Pedido no encontrado', 404);

save_data('seq.json', $seq);
save_pedidos($pedidos);
ok(['ok' => true]);
