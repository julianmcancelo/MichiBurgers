# 🍔 Burgersaurio - Sistema de Gestión de Restaurante

**Proyecto Final de Examen - Desarrollo Web con Angular**

Sistema completo de gestión para restaurantes desarrollado con Angular 20, que incluye gestión de mesas, productos, comandas, cocina y administración.

## 📋 Descripción del Proyecto

Burgersaurio es una aplicación web full-stack que permite la gestión integral de un restaurante, desde la toma de pedidos hasta la administración de productos y el control de cocina. El sistema está diseñado para optimizar el flujo de trabajo en restaurantes de comida rápida.

## 🚀 Características Principales

### Frontend (Angular 20)

- **Gestión de Mesas**: Control de estado de mesas (libre, ocupada, reservada)
- **Sistema de Comandas**: Toma de pedidos con interfaz intuitiva
- **Panel de Cocina**: Visualización de pedidos pendientes y en preparación
- **Administración**: CRUD completo de productos, usuarios y configuraciones
- **Autenticación**: Sistema de login con roles diferenciados
- **QR Generator**: Generación de códigos QR para mesas
- **Responsive Design**: Interfaz adaptable con Tailwind CSS

### Backend (PHP)

- **API RESTful**: Endpoints para todas las operaciones CRUD
- **Autenticación JWT**: Sistema seguro de autenticación
- **Base de Datos MySQL**: Gestión de datos persistente
- **CORS**: Configuración para comunicación frontend-backend

## 🛠️ Tecnologías Utilizadas

### Frontend

- **Angular 20** - Framework principal
- **TypeScript** - Lenguaje de programación
- **Angular Material** - Componentes UI
- **Tailwind CSS** - Framework de estilos
- **RxJS** - Programación reactiva
- **Angular Router** - Navegación SPA

### Backend

- **PHP 8+** - Lenguaje del servidor
- **MySQL** - Base de datos
- **JWT** - Autenticación
- **CORS** - Comunicación cross-origin

### Herramientas de Desarrollo

- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Angular CLI** - Herramientas de desarrollo
- **Vite** - Build tool optimizado

## 📁 Estructura del Proyecto

```
burgersaurio/
├── src/app/
│   ├── compartido/          # Módulo compartido (SharedModule)
│   │   ├── components/      # Componentes reutilizables
│   │   └── compartido.module.ts
│   ├── funcionalidades/     # Módulos de funcionalidades
│   │   ├── auth/           # Autenticación y autorización
│   │   ├── admin/          # Panel de administración
│   │   ├── cocina/         # Gestión de cocina
│   │   ├── comandera/      # Sistema de comandas
│   │   ├── mantenimiento/  # Mantenimiento del sistema
│   │   └── mapa-mesas/     # Gestión de mesas
│   ├── core/               # Servicios singleton
│   └── app.ts              # Componente raíz
├── api/                    # Backend PHP
│   ├── auth/              # Endpoints de autenticación
│   ├── productos/         # CRUD de productos
│   ├── mesas/            # Gestión de mesas
│   └── config/           # Configuración de la API
└── docs/                 # Documentación del proyecto
```

## 🔧 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- PHP 8+
- MySQL 8+
- Angular CLI 20+

### Instalación del Frontend

```bash
# Clonar el repositorio
git clone [url-del-repositorio]
cd burgersaurio

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

### Configuración del Backend

```bash
# Configurar base de datos
mysql -u root -p < api/config/database.sql

# Configurar variables de entorno
cp api/.env.example api/.env
# Editar api/.env con tus credenciales de base de datos
```

### Scripts Disponibles

```bash
npm start          # Servidor de desarrollo
npm run build      # Build de producción
npm run lint       # Verificar código con ESLint
npm run lint:fix   # Corregir errores de linting
npm run format     # Formatear código con Prettier
npm test           # Ejecutar tests unitarios
```

## 🎯 Funcionalidades Implementadas

### 1. Sistema de Autenticación

- Login/logout de usuarios
- Gestión de sesiones con JWT
- Roles de usuario (admin, cocina, mesero)
- Recuperación de contraseña

### 2. Gestión de Mesas

- Visualización del mapa de mesas
- Estados: libre, ocupada, reservada
- Asignación de meseros
- Generación de códigos QR

### 3. Sistema de Comandas

- Toma de pedidos por mesa
- Selección de productos
- Cálculo automático de totales
- Envío a cocina

### 4. Panel de Cocina

- Visualización de pedidos pendientes
- Cambio de estados de preparación
- Notificaciones en tiempo real
- Historial de pedidos

### 5. Administración

- CRUD completo de productos
- Gestión de categorías
- Reportes de ventas
- Configuración del sistema

## 🏗️ Arquitectura del Sistema

### Patrón de Arquitectura

- **Modular**: Separación por funcionalidades
- **Lazy Loading**: Carga bajo demanda de módulos
- **Reactive**: Uso de RxJS para manejo de estado
- **Component-Based**: Componentes reutilizables

### Principios Aplicados

- **SOLID**: Principios de diseño orientado a objetos
- **DRY**: Don't Repeat Yourself
- **Separation of Concerns**: Separación de responsabilidades
- **Single Responsibility**: Una responsabilidad por clase/componente

## 📊 Casos de Uso Principales

1. **Mesero toma pedido**: Selecciona mesa → Agrega productos → Confirma pedido
2. **Cocina prepara pedido**: Ve pedido → Cambia estado → Notifica finalización
3. **Admin gestiona productos**: CRUD de productos → Actualiza precios → Gestiona stock
4. **Cliente escanea QR**: Accede al menú → Realiza pedido → Paga online

## 🔒 Seguridad Implementada

- **Autenticación JWT**: Tokens seguros para sesiones
- **Validación de entrada**: Sanitización de datos
- **CORS configurado**: Control de acceso cross-origin
- **Roles y permisos**: Control de acceso por funcionalidad
- **Encriptación de contraseñas**: Hash seguro de passwords

## 📈 Métricas del Proyecto

- **Líneas de código**: ~5,000 líneas TypeScript/HTML/SCSS
- **Componentes**: 25+ componentes Angular
- **Servicios**: 10+ servicios
- **Endpoints API**: 20+ endpoints RESTful
- **Tiempo de desarrollo**: 3 meses

## 🎓 Aspectos Académicos Destacados

### Conceptos Aplicados

- **Programación Orientada a Objetos**: Clases, herencia, polimorfismo
- **Patrones de Diseño**: Observer, Singleton, Factory
- **Arquitectura MVC**: Separación modelo-vista-controlador
- **API RESTful**: Principios REST para comunicación
- **Base de Datos Relacional**: Diseño normalizado
- **Responsive Design**: Adaptabilidad móvil

### Buenas Prácticas

- **Clean Code**: Código limpio y legible
- **Documentación**: Comentarios y documentación técnica
- **Testing**: Pruebas unitarias implementadas
- **Version Control**: Git con commits descriptivos
- **Code Review**: Revisión de código con ESLint

## 🚀 Despliegue

### Desarrollo

```bash
npm start  # http://localhost:4200
```

### Producción

```bash
npm run build
# Desplegar carpeta dist/ en servidor web
```

## 👥 Autor

**[Tu Nombre]**

- Estudiante de [Carrera/Universidad]
- Email: [tu-email@ejemplo.com]
- LinkedIn: [tu-perfil-linkedin]

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos para el examen final de [Materia/Curso].

---

**Fecha de entrega**: [Fecha]  
**Profesor**: [Nombre del profesor]  
**Materia**: [Nombre de la materia]
