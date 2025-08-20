<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

// === Utilidades JWT HS256 sin dependencias ===
function jwt_b64url_encode(string $data): string {
  return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function jwt_b64url_decode(string $data): string|false {
  $remainder = strlen($data) % 4;
  if ($remainder) {
    $data .= str_repeat('=', 4 - $remainder);
  }
  return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_sign(string $input, string $secret): string {
  return hash_hmac('sha256', $input, $secret, true);
}

function jwt_issue(array $claims): string {
  $now = time();
  $exp = $now + (int)($_ENV['JWT_EXP_SECONDS'] ?? 86400);
  $payload = array_merge([
    'iss' => $_ENV['JWT_ISS'] ?? 'burguersaurio.api',
    'aud' => $_ENV['JWT_AUD'] ?? 'burguersaurio.web',
    'iat' => $now,
    'nbf' => $now,
    'exp' => $exp,
  ], $claims);

  $header = ['alg' => 'HS256', 'typ' => 'JWT'];
  $h = jwt_b64url_encode(json_encode($header, JSON_UNESCAPED_SLASHES));
  $p = jwt_b64url_encode(json_encode($payload, JSON_UNESCAPED_SLASHES));
  $sig = jwt_b64url_encode(jwt_sign("$h.$p", (string)($_ENV['JWT_SECRET'] ?? '')));
  return "$h.$p.$sig";
}

function jwt_decode(string $token, string $secret): ?array {
  $parts = explode('.', $token);
  if (count($parts) !== 3) return null;
  [$h64, $p64, $s64] = $parts;
  $headerJson = jwt_b64url_decode($h64);
  $payloadJson = jwt_b64url_decode($p64);
  if ($headerJson === false || $payloadJson === false) return null;
  $header = json_decode($headerJson, true);
  $payload = json_decode($payloadJson, true);
  if (!is_array($header) || !is_array($payload)) return null;
  if (($header['alg'] ?? '') !== 'HS256') return null;
  $expected = jwt_b64url_encode(jwt_sign("$h64.$p64", $secret));
  if (!hash_equals($expected, $s64)) return null;
  $now = time();
  if (isset($payload['nbf']) && $now < (int)$payload['nbf']) return null;
  if (isset($payload['exp']) && $now >= (int)$payload['exp']) return null;
  return $payload;
}

function jwt_parse_from_header(): ?object {
  // Algunas configuraciones (Apache/Nginx/CGI) no exponen HTTP_AUTHORIZATION directamente.
  $hdr = $_SERVER['HTTP_AUTHORIZATION']
    ?? $_SERVER['Authorization']
    ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
    ?? '';

  if ($hdr === '' && function_exists('getallheaders')) {
    $headers = getallheaders();
    foreach ($headers as $k => $v) {
      if (strcasecmp($k, 'Authorization') === 0) { $hdr = $v; break; }
    }
  } elseif ($hdr === '' && function_exists('apache_request_headers')) {
    $headers = apache_request_headers();
    foreach ($headers as $k => $v) {
      if (strcasecmp($k, 'Authorization') === 0) { $hdr = $v; break; }
    }
  }

  if (!preg_match('/^Bearer\s+(.*)$/i', $hdr, $m)) return null;
  $token = $m[1];
  $payload = jwt_decode($token, (string)($_ENV['JWT_SECRET'] ?? ''));
  return $payload ? (object)$payload : null;
}
