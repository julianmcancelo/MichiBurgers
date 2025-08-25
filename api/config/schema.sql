-- Burguersaurio DB schema (MySQL/MariaDB)
-- Charset/engine defaults
SET NAMES utf8mb4;
SET time_zone = '-03:00';

-- Layout del salón (mapa de mesas por área)
CREATE TABLE IF NOT EXISTS layouts (
  area ENUM('interior','exterior') NOT NULL PRIMARY KEY,
  data JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categorías del menú
CREATE TABLE IF NOT EXISTS categorias (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  orden INT UNSIGNED NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_categorias_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Productos del menú
CREATE TABLE IF NOT EXISTS productos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion VARCHAR(500) NULL,
  precio DECIMAL(10,2) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  imagen_url VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE KEY uq_productos_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Estado de mesas (rápido para pintar libre/ocupada)
CREATE TABLE IF NOT EXISTS mesas_estado (
  area ENUM('interior','exterior') NOT NULL,
  mesa_id VARCHAR(20) NOT NULL,
  estado ENUM('libre','ocupada') NOT NULL DEFAULT 'libre',
  pedido_id INT UNSIGNED NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (area, mesa_id),
  KEY idx_mesas_estado_pedido (pedido_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pedidos (una mesa puede tener solo un pedido abierto)
CREATE TABLE IF NOT EXISTS pedidos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  area ENUM('interior','exterior') NOT NULL,
  mesa_id VARCHAR(20) NOT NULL,
  estado ENUM('abierto','pagado','anulado') NOT NULL DEFAULT 'abierto',
  mozo_legajo VARCHAR(50) NOT NULL,
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP NULL DEFAULT NULL,
  KEY idx_pedidos_mesa_estado (area, mesa_id, estado),
  KEY idx_pedidos_mozo (mozo_legajo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ítems del pedido (incluye snapshot de nombre/precio)
CREATE TABLE IF NOT EXISTS pedido_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT UNSIGNED NOT NULL,
  producto_id INT UNSIGNED NULL,
  nombre VARCHAR(150) NOT NULL,
  precio_unit DECIMAL(10,2) NOT NULL,
  cantidad INT UNSIGNED NOT NULL DEFAULT 1,
  subtotal DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_items_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_items_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  KEY idx_items_pedido (pedido_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pagos (opcional, para auditar cierres)
CREATE TABLE IF NOT EXISTS pagos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT UNSIGNED NOT NULL,
  metodo ENUM('efectivo','tarjeta','qr','mixto') NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pagos_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  KEY idx_pagos_pedido (pedido_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Datos iniciales (categorías y productos de ejemplo)
INSERT INTO categorias (nombre, orden, activo) VALUES
  ('Hamburguesas', 1, 1),
  ('Bebidas', 2, 1),
  ('Acompañamientos', 3, 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO productos (categoria_id, nombre, descripcion, precio, activo) VALUES
  ((SELECT id FROM categorias WHERE nombre='Hamburguesas'), 'Clásica', 'Carne, queso, lechuga, tomate', 4500.00, 1),
  ((SELECT id FROM categorias WHERE nombre='Hamburguesas'), 'Doble', 'Doble carne y queso', 6200.00, 1),
  ((SELECT id FROM categorias WHERE nombre='Acompañamientos'), 'Papas Fritas', 'Porción mediana', 2200.00, 1),
  ((SELECT id FROM categorias WHERE nombre='Bebidas'), 'Gaseosa 500ml', 'Sabor a elección', 1500.00, 1)
ON DUPLICATE KEY UPDATE precio = VALUES(precio), descripcion = VALUES(descripcion), activo = VALUES(activo);

-- Helper: vista de mesas actuales (derivada del último pedido abierto por mesa)
-- Nota: según volumen, puede reemplazarse por consultas a mesas_estado
CREATE OR REPLACE VIEW v_mesas_ocupadas AS
SELECT p.area, p.mesa_id, p.id AS pedido_id, p.mozo_legajo, p.created_at
FROM pedidos p
WHERE p.estado = 'abierto';

-- =============================
-- Mantenimiento: contraseña maestra y configuración de app
-- =============================

-- Password maestra (una única fila id=1)
CREATE TABLE IF NOT EXISTS master_secret (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Configuración de la aplicación (clave-valor)
CREATE TABLE IF NOT EXISTS app_config (
  `key` VARCHAR(100) NOT NULL PRIMARY KEY,
  `value` TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed: contraseña maestra por defecto (cambiar luego). Hash de 'master12345'
INSERT INTO master_secret (id, password_hash)
VALUES (1, '$2y$10$0n4C1b2wSx2a4Yt2V4h1rO9m9Gm6n5n8q6j3lN5zQbW9C6w7bEGIy')
ON DUPLICATE KEY UPDATE password_hash = password_hash;

-- Seed: configuración básica por defecto
INSERT INTO app_config (`key`, `value`) VALUES
  ('nombreEmprendimiento', 'Burguersaurio'),
  ('colorPrimario', '#3f51b5'),
  ('colorSecundario', '#e91e63'),
  ('apiBaseUrl', 'https://burguersaurio.jcancelo.dev/api')
ON DUPLICATE KEY UPDATE `value` = `value`;

-- ===================================================================
-- NUEVA TABLA PARA CARRITOS DE CLIENTES (PEDIDOS NO CONFIRMADOS)
-- ===================================================================
CREATE TABLE IF NOT EXISTS pedidos_clientes (
  id VARCHAR(36) NOT NULL PRIMARY KEY, -- Usaremos un UUID para evitar colisiones
  area ENUM('interior','exterior') NOT NULL,
  mesa_id VARCHAR(20) NOT NULL,
  cliente_nombre VARCHAR(150) NULL,
  cliente_telefono VARCHAR(50) NULL,
  items JSON NOT NULL, -- { "producto_id": cantidad, ... }
  total DECIMAL(12,2) NOT NULL,
  estado ENUM('pendiente', 'pagado', 'expirado') NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL, -- Para limpiar carritos abandonados
  UNIQUE KEY uq_pedidos_clientes_mesa (area, mesa_id, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ===================================================================
-- MODIFICACIONES A LA TABLA DE PEDIDOS EXISTENTE
-- ===================================================================

-- Hacemos una copia de seguridad antes de alterar
-- CREATE TABLE IF NOT EXISTS pedidos_backup LIKE pedidos;
-- INSERT INTO pedidos_backup SELECT * FROM pedidos;

-- Alteramos la tabla original
ALTER TABLE pedidos
  ADD COLUMN cliente_nombre VARCHAR(150) NULL AFTER mesa_id,
  ADD COLUMN cliente_telefono VARCHAR(50) NULL AFTER cliente_nombre,
  ADD COLUMN tipo ENUM('mozo', 'cliente') NOT NULL DEFAULT 'mozo' AFTER estado,
  MODIFY COLUMN mozo_legajo VARCHAR(50) NULL,
  MODIFY COLUMN estado ENUM('abierto', 'listo_para_cocina', 'en_preparacion', 'listo_para_entregar', 'pagado', 'anulado') NOT NULL DEFAULT 'abierto';

-- Campos de pago (para registrar método/detalles elegidos por el cliente)
ALTER TABLE pedidos
  ADD COLUMN pago_metodo ENUM('tarjeta','mercado_pago','transferencia','efectivo','qr','mixto') NULL AFTER total,
  ADD COLUMN pago_detalles TEXT NULL AFTER pago_metodo,
  ADD COLUMN pago_referencia VARCHAR(120) NULL AFTER pago_detalles;

-- Actualizamos la vista de mesas ocupadas para incluir el nuevo estado
CREATE OR REPLACE VIEW v_mesas_ocupadas AS
SELECT p.area, p.mesa_id, p.id AS pedido_id, p.mozo_legajo, p.created_at
FROM pedidos p
WHERE p.estado IN ('abierto', 'listo_para_cocina', 'en_preparacion', 'listo_para_entregar');
