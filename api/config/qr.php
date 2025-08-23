<?php
declare(strict_types=1);

/**
 * Very small helper to validate QR signatures without DB changes.
 * Signature: sig = base64url_encode(HMAC_SHA256("area|mesa", JWT_SECRET))
 */
function qr_get_secret(): string {
  // Try multiple sources to be robust across hosts
  $secret = (string)($_ENV['JWT_SECRET'] ?? '');
  if ($secret === '') { $secret = (string)(getenv('JWT_SECRET') ?: ''); }
  if ($secret === '') { $secret = (string)($_SERVER['JWT_SECRET'] ?? ''); }
  // Optional file-based fallback (do NOT commit this file)
  if ($secret === '') {
    $file = __DIR__ . '/.jwt_secret';
    if (is_file($file) && is_readable($file)) {
      $secret = trim((string)file_get_contents($file));
    }
  }
  return $secret;
}

function qr_is_valid(string $area, string $mesaId, string $sig): bool {
  $secret = qr_get_secret();
  if ($secret === '' || $sig === '') return false;
  $data = $area . '|' . $mesaId;
  $calc = base64_url_encode(hash_hmac('sha256', $data, $secret, true));
  // Timing-safe compare
  return hash_equals($calc, $sig);
}

function base64_url_encode(string $bin): string {
  return rtrim(strtr(base64_encode($bin), '+/', '-_'), '=');
}
