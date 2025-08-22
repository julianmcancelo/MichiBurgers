<?php
require_once __DIR__ . '/../_lib/bootstrap.php';

$pedidoId = isset($_GET['pedidoId']) ? intval($_GET['pedidoId']) : 0;
if (!$pedidoId) fail('Datos invalidos', 400);

$pedidos = get_pedidos();
foreach ($pedidos as $p) {
  if (intval($p['pedidoId']) === $pedidoId) {
    ok(['pedido' => ['pedidoId' => $p['pedidoId'], 'mesa' => $p['mesa'], 'mozo' => $p['mozo'], 'hora' => $p['hora'], 'pagado' => $p['pagado']], 'items' => $p['items']]);
  }
}
fail('Pedido no encontrado', 404);
