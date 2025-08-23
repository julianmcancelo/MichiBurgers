# 🍔 MichiBurgers - Sistema de Gestión de Restaurante

**Proyecto Académico - Analista de Sistemas**

Sistema integral de gestión para restaurantes desarrollado con tecnologías modernas. Una aplicación full-stack que demuestra la aplicación práctica de conceptos de análisis de sistemas, programación orientada a objetos, bases de datos y arquitectura de software.

## 📋 Descripción del Proyecto

MichiBurgers es una solución completa para la gestión operativa de restaurantes que abarca desde la administración de mesas y toma de pedidos hasta el control de cocina y reportes administrativos. El proyecto fue desarrollado aplicando metodologías de análisis y diseño de sistemas, implementando patrones de arquitectura modernos y buenas prácticas de desarrollo de software.

### Problemática Abordada

El sistema resuelve las necesidades operativas típicas de un restaurante de comida rápida:
- **Gestión ineficiente de mesas**: Control manual propenso a errores
- **Comunicación cocina-salón**: Falta de sincronización en pedidos
- **Administración de productos**: Actualización manual de menús y precios
- **Control de acceso**: Necesidad de roles diferenciados por área de trabajo

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

## 🛠️ Stack Tecnológico

### Frontend
- **Angular 20.x** - Framework SPA con arquitectura component-based
- **TypeScript 5.8** - Superset de JavaScript con tipado estático
- **Angular Material** - Sistema de componentes siguiendo Material Design
- **Tailwind CSS 3.x** - Framework utility-first para estilos responsivos
- **RxJS** - Biblioteca para programación reactiva con observables
- **Vite** - Build tool moderno que reemplaza webpack

### Backend
- **PHP 8+** - Lenguaje del servidor con características modernas
- **MySQL 8+** - Sistema de gestión de base de datos relacional
- **JWT (JSON Web Tokens)** - Estándar para autenticación stateless
- **RESTful API** - Arquitectura de servicios web

### Herramientas de Desarrollo y Calidad
- **ESLint 9.x** - Linter con configuración flat config
- **Prettier 3.x** - Formateador automático de código
- **Git** - Control de versiones distribuido
- **npm** - Gestor de paquetes y dependencias

## 📁 Arquitectura y Estructura del Proyecto

### Organización Modular por Funcionalidades

```
michiburgers/
├── src/app/                     # Aplicación Angular
│   ├── compartido/              # Módulo compartido (SharedModule)
│   │   └── components/
│   │       └── layout-principal/ # Layout base con header/nav
│   ├── funcionalidades/         # Módulos por dominio de negocio
│   │   ├── auth/               # Autenticación y autorización
│   │   │   ├── components/     # Login, forgot-password, etc.
│   │   │   ├── guards/         # Route guards por rol
│   │   │   └── auth.service.ts # Gestión de estado de sesión
│   │   ├── admin/              # Panel administrativo
│   │   │   └── components/
│   │   │       ├── qr-generator/    # Generación de QR para mesas
│   │   │       └── lista-productos/ # CRUD de productos
│   │   ├── cocina/             # Módulo de cocina
│   │   └── mapa-mesas/         # Gestión de mesas y pedidos
│   │       └── pages/
│   │           └── estado-mesas/ # Vista principal de mesas
│   ├── core/                   # Servicios singleton y configuración
│   └── app.routes.ts           # Configuración de rutas con lazy loading
├── api/                        # Backend PHP con arquitectura RESTful
│   ├── auth/                   # Endpoints de autenticación
│   ├── productos/              # CRUD de productos
│   ├── mesas/                  # Gestión de mesas
│   └── config/                 # Configuración de BD y CORS
├── docs/                       # Documentación técnica
│   └── ARQUITECTURA.md         # Documentación de arquitectura
└── public/                     # Assets estáticos
```

### Principios de Diseño Aplicados

- **Separación de Responsabilidades**: Cada módulo maneja un dominio específico
- **Lazy Loading**: Módulos cargados bajo demanda para optimizar performance
- **Dependency Injection**: Inyección de dependencias nativa de Angular
- **Reactive Programming**: Uso de observables para manejo de estado asíncrono

## 🔧 Instalación y Configuración

### Prerrequisitos del Sistema

- **Node.js 18+** - Runtime de JavaScript
- **npm 9+** - Gestor de paquetes
- **PHP 8+** - Lenguaje del servidor
- **MySQL 8+** - Sistema de base de datos
- **Git** - Control de versiones

### Instalación Paso a Paso

#### 1. Clonar el Repositorio
```bash
git clone https://github.com/julianmcancelo/MichiBurgers.git
cd MichiBurgers
```

#### 2. Configurar Frontend
```bash
# Instalar dependencias del proyecto
npm install

# Verificar instalación
npm run format:check
npm run lint
```

#### 3. Configurar Backend
```bash
# Crear base de datos
mysql -u root -p -e "CREATE DATABASE michiburgers;"

# Importar esquema (si existe archivo SQL)
mysql -u root -p michiburgers < api/config/database.sql

# Configurar variables de entorno
cp api/.env.example api/.env
# Editar api/.env con credenciales de tu base de datos
```

#### 4. Iniciar Desarrollo
```bash
# Terminal 1: Frontend (Angular)
npm start  # http://localhost:4200

# Terminal 2: Backend (PHP - si usas servidor local)
php -S localhost:8000 -t api/
```

### Scripts de Desarrollo

```bash
# Desarrollo
npm start              # Servidor de desarrollo con hot reload
npm run build          # Build de producción optimizado

# Calidad de Código
npm run lint           # Verificar código con ESLint
npm run lint:fix       # Corregir errores automáticamente
npm run format         # Formatear código con Prettier
npm run format:check   # Verificar formato sin modificar

# Testing (cuando se implemente)
npm test               # Ejecutar tests unitarios
npm run e2e            # Tests end-to-end
```

## 🎯 Funcionalidades del Sistema

### 1. Módulo de Autenticación y Autorización

**Casos de Uso Implementados:**
- **UC-01**: Login de usuario con validación de credenciales
- **UC-02**: Logout y limpieza de sesión
- **UC-03**: Recuperación de contraseña con validación de datos
- **UC-04**: Gestión de roles (admin, cocina, mozo, caja)

**Características Técnicas:**
- Autenticación stateless con JWT
- Guards para protección de rutas por rol
- Interceptors para inyección automática de tokens
- Manejo de estados de sesión con RxJS observables

### 2. Gestión de Mesas y Pedidos

**Funcionalidades:**
- Mapa visual de mesas con estados en tiempo real
- Estados: libre, ocupada, reservada, en limpieza
- Asignación de meseros por mesa
- Generación de códigos QR para pedidos digitales
- Historial de ocupación por mesa

### 3. Sistema de Productos y Menú

**Operaciones CRUD:**
- Crear, leer, actualizar y eliminar productos
- Gestión de categorías y subcategorías
- Control de precios y disponibilidad
- Carga de imágenes de productos

### 4. Panel de Cocina

**Flujo de Trabajo:**
- Recepción de pedidos desde el sistema de comandas
- Cambio de estados: pendiente → preparando → listo
- Notificaciones visuales para nuevos pedidos
- Tiempo estimado de preparación

### 5. Administración del Sistema

**Herramientas Administrativas:**
- Dashboard con métricas operativas
- Gestión de usuarios y permisos
- Configuración de parámetros del sistema
- Generador de reportes básicos

## 🏗️ Análisis y Diseño del Sistema

### Metodología de Desarrollo

**Análisis de Sistemas Aplicado:**
- **Levantamiento de Requerimientos**: Identificación de necesidades del negocio
- **Análisis de Procesos**: Modelado de flujos operativos del restaurante
- **Diseño de Base de Datos**: Modelo entidad-relación normalizado
- **Arquitectura de Software**: Patrón de capas con separación de responsabilidades

### Patrones de Diseño Implementados

**Frontend (Angular):**
- **Observer Pattern**: RxJS observables para comunicación reactiva
- **Dependency Injection**: Inyección nativa de Angular para servicios
- **Module Pattern**: Organización modular por funcionalidades
- **Component Pattern**: Reutilización de componentes UI

**Backend (PHP):**
- **MVC Pattern**: Separación modelo-vista-controlador
- **Repository Pattern**: Abstracción de acceso a datos
- **Singleton Pattern**: Conexión única a base de datos

### Principios SOLID Aplicados

- **S - Single Responsibility**: Cada clase/componente tiene una responsabilidad específica
- **O - Open/Closed**: Extensible sin modificar código existente
- **L - Liskov Substitution**: Interfaces consistentes en jerarquías
- **I - Interface Segregation**: Interfaces específicas por funcionalidad
- **D - Dependency Inversion**: Dependencias hacia abstracciones, no implementaciones

### Arquitectura de Capas

```
┌─────────────────────────────────────┐
│           Presentación              │ ← Angular Components/Templates
├─────────────────────────────────────┤
│             Servicios               │ ← Angular Services/HTTP Client
├─────────────────────────────────────┤
│            API REST                 │ ← PHP Endpoints
├─────────────────────────────────────┤
│         Lógica de Negocio           │ ← PHP Business Logic
├─────────────────────────────────────┤
│        Acceso a Datos               │ ← MySQL Database
└─────────────────────────────────────┘
```

## 📊 Modelado de Casos de Uso

### Actores del Sistema

- **Administrador**: Gestión completa del sistema
- **Mozo/Mesero**: Atención de mesas y toma de pedidos
- **Cocina**: Preparación de pedidos
- **Caja**: Facturación y cobros
- **Cliente**: Usuario final (pedidos por QR)

### Casos de Uso Principales

#### CU-01: Gestión de Pedidos
**Actor Principal**: Mozo
**Flujo Principal**:
1. Mozo selecciona mesa disponible
2. Sistema muestra menú de productos
3. Mozo agrega productos al pedido
4. Sistema calcula total automáticamente
5. Mozo confirma pedido
6. Sistema envía pedido a cocina

#### CU-02: Preparación en Cocina
**Actor Principal**: Cocina
**Flujo Principal**:
1. Sistema notifica nuevo pedido
2. Cocina visualiza detalles del pedido
3. Cocina cambia estado a "preparando"
4. Al finalizar, cambia estado a "listo"
5. Sistema notifica al mozo

#### CU-03: Administración de Productos
**Actor Principal**: Administrador
**Flujo Principal**:
1. Admin accede al panel de productos
2. Realiza operaciones CRUD (crear/leer/actualizar/eliminar)
3. Actualiza precios y disponibilidad
4. Sistema sincroniza cambios en tiempo real

#### CU-04: Pedido por QR (Cliente)
**Actor Principal**: Cliente
**Flujo Principal**:
1. Cliente escanea código QR de la mesa
2. Sistema muestra menú digital
3. Cliente selecciona productos
4. Sistema procesa pedido automáticamente
5. Pedido se envía a cocina

## 🔒 Seguridad y Validaciones

### Medidas de Seguridad Implementadas

**Autenticación y Autorización:**
- **JWT (JSON Web Tokens)**: Autenticación stateless con expiración
- **Role-Based Access Control (RBAC)**: Permisos por rol de usuario
- **Route Guards**: Protección de rutas sensibles en frontend
- **API Middleware**: Validación de tokens en cada request

**Validación de Datos:**
- **Frontend**: Validación reactiva con Angular Forms
- **Backend**: Sanitización y validación de entrada en PHP
- **Base de Datos**: Constraints y tipos de datos estrictos
- **CORS**: Configuración de dominios permitidos

**Buenas Prácticas:**
- **Hash de Contraseñas**: Encriptación con algoritmos seguros
- **Escape de SQL**: Prevención de inyección SQL
- **Validación de Tipos**: TypeScript para tipado estático
- **Error Handling**: Manejo controlado de excepciones

## 📈 Métricas y Estadísticas del Proyecto

### Complejidad del Sistema

- **Líneas de código**: ~8,000 líneas (TypeScript/HTML/SCSS/PHP)
- **Componentes Angular**: 30+ componentes reutilizables
- **Servicios**: 15+ servicios con inyección de dependencias
- **Endpoints API**: 25+ endpoints RESTful
- **Módulos**: 6 módulos principales con lazy loading
- **Guards**: 5+ route guards para control de acceso

### Métricas de Calidad

- **Cobertura ESLint**: 100% de archivos TypeScript
- **Formateo Prettier**: Código consistente en todo el proyecto
- **Tipado TypeScript**: Strict mode habilitado
- **Documentación**: Comentarios JSDoc en funciones principales
- **Commits**: Mensajes descriptivos siguiendo convenciones

### Tecnologías Dominadas

- **Frontend**: Angular 20, TypeScript, RxJS, Material Design
- **Backend**: PHP 8, MySQL, API REST, JWT
- **Herramientas**: Git, npm, ESLint, Prettier, Vite
- **Metodologías**: SOLID, Clean Code, Responsive Design

## 🎓 Competencias Académicas Demostradas

### Análisis de Sistemas

**Metodologías Aplicadas:**
- **Levantamiento de Requerimientos**: Identificación de necesidades del negocio
- **Modelado de Procesos**: Diagramas de flujo operativos
- **Casos de Uso**: Documentación de interacciones usuario-sistema
- **Diseño de Base de Datos**: Modelo ER normalizado
- **Arquitectura de Software**: Diseño de capas y componentes

### Programación y Desarrollo

**Paradigmas Implementados:**
- **Programación Orientada a Objetos**: Encapsulación, herencia, polimorfismo
- **Programación Funcional**: Funciones puras, inmutabilidad (RxJS)
- **Programación Reactiva**: Observables y streams de datos
- **Programación Declarativa**: Templates Angular y consultas SQL

**Patrones de Diseño:**
- **Creacionales**: Singleton (conexión DB), Factory (componentes)
- **Estructurales**: Decorator (Angular), Facade (servicios)
- **Comportamiento**: Observer (RxJS), Strategy (guards)

### Base de Datos

**Conceptos Aplicados:**
- **Normalización**: Eliminación de redundancias (1FN, 2FN, 3FN)
- **Integridad Referencial**: Foreign keys y constraints
- **Optimización**: Índices y consultas eficientes
- **Transacciones**: ACID properties en operaciones críticas

### Ingeniería de Software

**Metodologías y Herramientas:**
- **Control de Versiones**: Git con branching strategy
- **Calidad de Código**: ESLint, Prettier, TypeScript strict
- **Documentación**: README técnico, comentarios JSDoc
- **Testing**: Estructura preparada para pruebas unitarias
- **CI/CD**: Configuración base para integración continua

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

## 👨‍💻 Información del Desarrollador

**Julián M. Cancelo**

- **Carrera**: Analista de Sistemas
- **Institución**: [Universidad/Instituto]
- **GitHub**: [@julianmcancelo](https://github.com/julianmcancelo)
- **Proyecto**: [MichiBurgers](https://github.com/julianmcancelo/MichiBurgers)

### Competencias Técnicas Desarrolladas

- **Análisis de Sistemas**: Modelado de procesos de negocio
- **Desarrollo Full-Stack**: Frontend Angular + Backend PHP
- **Base de Datos**: Diseño y optimización MySQL
- **Arquitectura de Software**: Patrones y principios SOLID
- **DevOps**: Git, npm, herramientas de calidad de código

## 🚀 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] Sistema de reportes avanzados
- [ ] Integración con sistemas de pago
- [ ] Notificaciones push en tiempo real
- [ ] App móvil con Ionic/React Native
- [ ] Dashboard de analytics

### Mejoras Técnicas
- [ ] Implementación de tests unitarios (Jest)
- [ ] Tests e2e con Cypress
- [ ] CI/CD pipeline con GitHub Actions
- [ ] Containerización con Docker
- [ ] Monitoreo y logging

## 📄 Licencia y Uso Académico

Este proyecto fue desarrollado con fines académicos como parte del cursado de la carrera de **Analista de Sistemas**. El código es de uso educativo y demuestra la aplicación práctica de conceptos teóricos de análisis, diseño y desarrollo de sistemas de información.

### Objetivos Académicos Cumplidos

✅ **Análisis de Sistemas**: Identificación y modelado de requerimientos  
✅ **Diseño de Software**: Arquitectura modular y escalable  
✅ **Programación**: Aplicación de paradigmas y patrones  
✅ **Base de Datos**: Diseño normalizado y optimizado  
✅ **Calidad**: Código limpio y documentado  
✅ **Versionado**: Control de cambios con Git  

---

**Desarrollado con 💻 y ☕ por un futuro Analista de Sistemas**
