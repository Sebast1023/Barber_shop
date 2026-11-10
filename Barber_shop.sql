

-- ==========================================
-- 1. LIMPIEZA DE TABLAS Y VISTAS PREVIAS
-- ==========================================
DROP VIEW IF EXISTS v_ventas_detalladas;
DROP VIEW IF EXISTS v_reporte_productos;
DROP VIEW IF EXISTS v_productos_disponibles;
DROP VIEW IF EXISTS v_clientes_publico;

DROP TABLE IF EXISTS citas CASCADE;
DROP TABLE IF EXISTS reposiciones CASCADE;
DROP TABLE IF EXISTS detalle_ventas CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS servicios CASCADE;
DROP TABLE IF EXISTS administradores CASCADE;
DROP TABLE IF EXISTS recepcionistas CASCADE;
DROP TABLE IF EXISTS barberos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ==========================================
-- 2. CREACIÓN DE TABLAS Y RESTRICCIONES
-- ==========================================
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    correo VARCHAR(200) NOT NULL UNIQUE,
    contrasena VARCHAR(200) NOT NULL,
    rol VARCHAR(80) NOT NULL DEFAULT 'CLIENTE' CHECK (rol IN('ADMIN','CLIENTE','BARBERO','RECEPCIONISTA','ANALISTA','ADMINISTRADOR')),
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha_registro <= CURRENT_DATE)
);

CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha_registro <= CURRENT_DATE),
    correo VARCHAR(200) NOT NULL UNIQUE,
    id_usuario INT UNIQUE REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE barberos (
    id_barbero SERIAL PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(20) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    experiencia VARCHAR(50),
    id_usuario INT NOT NULL UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE recepcionistas (
    id_recepcionista SERIAL PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(20) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    id_usuario INT NOT NULL UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE administradores (
    id_administrador SERIAL PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(20) NOT NULL,
    id_usuario INT NOT NULL UNIQUE REFERENCES usuarios(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE servicios (
    id_servicio SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    precio NUMERIC(10, 2) NOT NULL CHECK(precio >= 0)
);

CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    stock INT NOT NULL DEFAULT 0 CHECK(stock >= 0),
    precio NUMERIC(10, 2) NOT NULL CHECK(precio >= 0)
);

CREATE TABLE ventas (
    id_venta SERIAL PRIMARY KEY,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha <= CURRENT_DATE),
    metodo_pago VARCHAR(200) NOT NULL CHECK(metodo_pago IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')),
    direccion_entrega VARCHAR(200),
    modalidad_entrega VARCHAR(200) NOT NULL CHECK(modalidad_entrega IN ('ENVIO', 'RECOGIDO')),
    id_cliente INT NOT NULL REFERENCES clientes(id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE detalle_ventas (
    id_venta INT REFERENCES ventas(id_venta) ON DELETE CASCADE ON UPDATE CASCADE,
    id_producto INT REFERENCES productos(id_producto) ON DELETE RESTRICT ON UPDATE CASCADE,
    cantidad INT NOT NULL CHECK(cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario > 0),
    PRIMARY KEY (id_venta, id_producto)
);

CREATE TABLE reposiciones (
    id_reposicion SERIAL PRIMARY KEY,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE CHECK (fecha <= CURRENT_DATE),
    cantidad INT NOT NULL CHECK(cantidad > 0),
    id_administrador INT NOT NULL REFERENCES administradores(id_administrador) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_producto INT NOT NULL REFERENCES productos(id_producto) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE citas (
    id_cita SERIAL PRIMARY KEY,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' CHECK(estado IN ('PENDIENTE', 'ATENDIDA', 'CANCELADA', 'NO ASISTIO')),
    hora_inicio INT NOT NULL CHECK (hora_inicio BETWEEN 8 AND 12 OR hora_inicio BETWEEN 14 AND 19),
    fecha DATE NOT NULL CHECK (fecha >= CURRENT_DATE),
    id_cliente INT NOT NULL REFERENCES clientes(id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_barbero INT NOT NULL REFERENCES barberos(id_barbero) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_recepcionista INT REFERENCES recepcionistas(id_recepcionista) ON DELETE SET NULL ON UPDATE CASCADE,
    id_servicio INT NOT NULL REFERENCES servicios(id_servicio) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ==========================================
-- 3. CREACIÓN DE VISTAS
-- ==========================================
CREATE VIEW v_ventas_detalladas AS
SELECT 
    v.id_venta, 
    v.fecha, 
    c.nombre AS cliente, 
    v.metodo_pago, 
    v.modalidad_entrega, 
    p.nombre AS producto, 
    dv.cantidad, 
    dv.precio_unitario, 
    (dv.cantidad * dv.precio_unitario) AS subtotal
FROM ventas v
JOIN clientes c ON v.id_cliente = c.id_cliente
JOIN detalle_ventas dv ON v.id_venta = dv.id_venta
JOIN productos p ON dv.id_producto = p.id_producto;

CREATE VIEW v_reporte_productos AS
SELECT 
    p.id_producto, 
    p.nombre AS producto, 
    p.stock, 
    p.precio,
    COALESCE(SUM(dv.cantidad), 0) AS unidades_vendidas,
    COALESCE(SUM(dv.cantidad * dv.precio_unitario), 0) AS ingresos
FROM productos p
LEFT JOIN detalle_ventas dv ON p.id_producto = dv.id_producto
GROUP BY p.id_producto, p.nombre, p.stock, p.precio;

CREATE VIEW v_productos_disponibles AS
SELECT id_producto, nombre, descripcion, stock, precio
FROM productos
WHERE stock > 0
WITH CHECK OPTION;

CREATE VIEW v_clientes_publico AS
SELECT id_cliente, nombre, fecha_registro
FROM clientes;

INSERT INTO servicios (nombre, descripcion, precio) VALUES
('Corte clásico', 'Un corte limpio y personalizado según tu estilo.', 25000.00),
('Corte + barba', 'Corte de cabello acompañado de perfilado de barba.', 35000.00),
('Diseño de barba', 'Perfilado y cuidado para darle forma a tu estilo.', 18000.00),
('Afeitado Tradicional', 'Afeitado con navaja y toallas calientes', 20000.00),
('Tratamiento Capilar', 'Hidratación profunda para el cabello', 50000.00); 

-- Necesitarás un usuario administrador y barberos para que la relación funcione
INSERT INTO usuarios (correo, contrasena, rol, fecha_registro) VALUES
('juan.barbero@mail.com', 'hash789', 'BARBERO', '2025-11-01'),
('mateo.ruiz@mail.com', 'hash333', 'BARBERO', '2025-11-05'),
('andres.silva@mail.com', 'hash444', 'BARBERO', '2025-11-10');

INSERT INTO barberos (cedula, nombre, telefono, experiencia, id_usuario) VALUES
('20111222', 'Juan Barbero', '3114445566', '5 años', 1),
('20222333', 'Mateo Ruiz', '3125556677', '3 años', 2),
('20333444', 'Andrés Silva', '3136667788', '7 años', 3);

