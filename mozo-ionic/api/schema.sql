-- Esquema de ejemplo para datos reales en MySQL

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  legajo VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nombreCompleto VARCHAR(120) NOT NULL,
  rol VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mesa VARCHAR(20) NULL,
  mozo VARCHAR(120) NULL,
  hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  pagado TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pedido_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto VARCHAR(200) NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  notas VARCHAR(255) NULL,
  estado ENUM('pendiente','preparando','listo') NOT NULL DEFAULT 'pendiente',
  CONSTRAINT fk_item_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mesas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  area ENUM('interior','exterior') NOT NULL,
  mesa_id VARCHAR(20) NOT NULL,
  estado ENUM('libre','ocupada') NOT NULL DEFAULT 'libre',
  pedido_id INT NULL,
  pagado TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_mesa (area, mesa_id),
  CONSTRAINT fk_mesa_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Usuario de ejemplo (password en texto para demo; idealmente usar hash)
INSERT INTO users (legajo, password, nombreCompleto, rol)
VALUES ('100', 'admin', 'Admin', 'admin')
ON DUPLICATE KEY UPDATE nombreCompleto=VALUES(nombreCompleto), rol=VALUES(rol);
