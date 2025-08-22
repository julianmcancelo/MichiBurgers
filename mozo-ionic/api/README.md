# Backend PHP mínimo para Burgersaurio

Este backend simple en PHP sirve los endpoints que espera el frontend Ionic.
Usa almacenamiento en archivos JSON dentro de `api/_data/`.

## Endpoints

- Auth
  - POST `/api/auth/login.php` { legajo, password } -> { token, usuario }

- Mesas
  - GET `/api/mesas/status.php?area=interior|exterior`
  - POST `/api/mesas/abrir.php` { area, mesaId }
  - POST `/api/mesas/liberar.php` { area, mesaId }
  - POST `/api/mesas/pagar.php` { pedidoId }
  - GET `/api/mesas/pedido.php?pedidoId=123`
  - POST `/api/mesas/agregar-item.php` { pedidoId, productoId, cantidad? }

- Cocina (Comandera)
  - GET `/api/cocina/pedidos.php`
  - POST `/api/cocina/actualizar-estado.php` { itemId, estado: 'preparando'|'listo' }

## Usuarios seed

- Admin: legajo `100`, pass `admin`, rol `admin`
- Cocina: legajo `200`, pass `cocina`, rol `cocina`
- Mozo: legajo `300`, pass `mozo`, rol `mozo`

## Correr localmente

1) Necesitás PHP 7.4+ instalado y en PATH.
2) Desde la carpeta del proyecto, levantar un server embebido apuntando a `api/`:

```bash
php -S localhost:8080 -t api
```

En Windows (PowerShell):

```powershell
php -S localhost:8080 -t api
```

3) En el frontend, ajustar `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiBase: 'http://localhost:8080'
};
```

4) Iniciar la app Ionic y probar login + flujo de mesas y cocina.

## Notas

- CORS está habilitado en `api/_lib/bootstrap.php`.
- Los datos viven en `api/_data/*.json`. Podés borrar esa carpeta para resetear el seed.
- Este backend es de demo/desarrollo; no usar en producción.
