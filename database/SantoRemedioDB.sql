create database SantoRemedioDB;
use SantoRemedioDB;

create table Pais(
	id_pais int primary key auto_increment,
	nombre varchar(100) not null
);

create table Ciudad(
	id_ciudad int primary key auto_increment,
    nombre varchar(100) not null,
    id_pais int,
    foreign key (id_pais) references Pais(id_pais)
);

create table Direccion(
	id_direccion int primary key auto_increment,
    calle_principal varchar(100) not null,
    calle_secundaria varchar(100) not null,
    id_ciudad int,
    foreign key (id_ciudad) references Ciudad(id_ciudad)
);

create table Puesto(
	id_puesto int primary key auto_increment,
    nombre varchar(100) not null
);

create table Farmacia(
	id_farmacia int primary key auto_increment,
    nombre varchar(100) not null,
    telefono varchar(10) not null,
    ruc varchar(10) not null,
    id_direccion int,
    foreign key (id_direccion) references Direccion(id_direccion)
);

create table Usuario(
	id_usuario int primary key auto_increment,
    nombre varchar(100) not null,
    apellido varchar(100) not null,
    cedula varchar(10) not null,
    telefono varchar(10) not null,
    email varchar(10) not null,
    id_puesto int,
    id_farmacia int,
    id_direccion int,
    foreign key (id_puesto) references Puesto(id_puesto),
    foreign key (id_farmacia) references Farmacia(id_farmacia),
    foreign key (id_direccion) references Direccion(id_direccion)
);

create table Cliente(
	id_cliente int primary key auto_increment,
    nombre varchar(100) not null,
    apellido varchar(100) not null,
    cedula varchar(10) not null,
    telefono varchar(10) not null,
    email varchar(100) not null,
    id_direccion int,
    foreign key (id_direccion) references Direccion(id_direccion)
);

create table Proveedor(
	id_proveedor int primary key auto_increment,
    nombre varchar(150) not null,
    telefono varchar(10) not null,
    email varchar(60) not null,
    id_direccion int,
    foreign key (id_direccion) references Direccion(id_direccion)
);

create table Producto(
	id_producto int primary key auto_increment,
    descripcion varchar(60) not null,
    precio_venta decimal(10,2) not null,
    precio_compra decimal(10,2) not null,
    stock int not null,
    fecha_elaboracion date,
    fecha_vencimiento date
);

create table Inventario(
	id_inventario int primary key auto_increment,
    stock_inicial int not null,
    stock_actual int not null,
    fecha_actualizacion date not null,
    id_farmacia int,
    id_producto int,
    foreign key (id_farmacia) references Farmacia(id_farmacia),
    foreign key (id_producto) references Producto(id_producto)
);

create table Venta(
	id_venta int primary key auto_increment,
    fecha date not null,
    total decimal(10,2) not null,
    id_farmacia int,
    id_usuario int,
    id_cliente int,
    foreign key (id_farmacia) references Farmacia(id_farmacia),
    foreign key (id_usuario) references Usuario(id_usuario),
    foreign key (id_cliente) references Cliente(id_cliente)
);

create table DetalleVenta(
	id_detalle_venta int primary key auto_increment,
    cantidad int not null,
    precio_unitario decimal(10,2) not null,
    subtotal decimal(10,2) not null,
    id_venta int,
    id_producto int,
    foreign key (id_venta) references Venta(id_venta),
    foreign key (id_producto) references Producto(id_producto)
    
);

create table Compra(
	id_compra int primary key auto_increment,
    fecha date not null,
    total decimal(10,2) not null,
    id_proveedor int,
    id_usuario int,
    foreign key (id_proveedor) references Proveedor(id_proveedor),
    foreign key (id_usuario) references Usuario(id_usuario)
);

create table DetalleCompra(
	id_detalle_compra int primary key auto_increment,
    cantidad int,
    precio_unitario decimal(10,2) not null,
    subtotal decimal(10,2) not null,
    id_compra int,
    id_producto int,
    foreign key (id_producto) references Producto(id_producto),
    foreign key (id_compra) references Compra(id_compra)
);


CREATE TABLE Auditoria_Inventario (
    id_auditoria INT PRIMARY KEY AUTO_INCREMENT,
    id_inventario INT,
    id_producto INT,
    accion VARCHAR(50),  -- Ejemplos: 'AJUSTE', 'VENTA', 'COMPRA'
    cantidad_cambio INT,  -- Cantidad que se sumó o restó
    stock_antes INT,
    stock_despues INT,
    fecha DATETIME NOT NULL,
    id_usuario INT,
    comentario TEXT,  -- Opcional: detalles adicionales del cambio
    FOREIGN KEY (id_inventario) REFERENCES Inventario(id_inventario),
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Auditoria_Ventas (
    id_auditoria INT PRIMARY KEY AUTO_INCREMENT,
    id_venta INT,
    accion VARCHAR(50),  -- Ejemplos: 'ANULACIÓN', 'MODIFICACIÓN'
    fecha DATETIME NOT NULL,
    id_usuario INT,
    detalles_cambio TEXT,  -- Descripción de los cambios realizados
    FOREIGN KEY (id_venta) REFERENCES Venta(id_venta),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Auditoria_Compras (
    id_auditoria INT PRIMARY KEY AUTO_INCREMENT,
    id_compra INT,
    accion VARCHAR(50),  -- Ejemplos: 'DEVOLUCIÓN', 'MODIFICACIÓN'
    fecha DATETIME NOT NULL,
    id_usuario INT,
    detalles_cambio TEXT,  -- Descripción de los cambios realizados
    FOREIGN KEY (id_compra) REFERENCES Compra(id_compra),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Auditoria_Productos (
    id_auditoria INT PRIMARY KEY AUTO_INCREMENT,
    id_producto INT,
    campo_modificado VARCHAR(50),  -- Ejemplos: 'PRECIO_VENTA', 'STOCK'
    valor_anterior TEXT,
    valor_nuevo TEXT,
    fecha DATETIME NOT NULL,
    id_usuario INT,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Auditoria_Usuarios (
    id_auditoria INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    campo_modificado VARCHAR(50),  -- Ejemplos: 'NOMBRE', 'PUESTO', 'TELEFONO'
    valor_anterior TEXT,
    valor_nuevo TEXT,
    fecha DATETIME NOT NULL,
    id_admin INT,  -- Usuario que realizó el cambio
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_admin) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Auditoria_Accesos (
    id_auditoria INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    fecha_acceso DATETIME NOT NULL,
    tipo_acceso VARCHAR(50),  -- Ejemplos: 'INICIO SESIÓN', 'CIERRE SESIÓN'
    ip_acceso VARCHAR(45),  -- Dirección IP desde la cual se accedió
    detalles TEXT,  -- Descripción adicional si es necesario
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);




