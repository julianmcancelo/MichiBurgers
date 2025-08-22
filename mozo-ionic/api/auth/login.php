<?php
require_once __DIR__ . '/../_lib/bootstrap.php';

$body = json_body();
$legajo = isset($body['legajo']) ? trim($body['legajo']) : '';
$password = isset($body['password']) ? $body['password'] : '';

if (!$legajo || !$password) fail('Faltan credenciales', 400);

$user = find_user($legajo, $password);
if (!$user) fail('Credenciales invalidas', 401);

$token = base64_encode($legajo . '|' . time());
ok(['token' => $token, 'usuario' => $user]);
