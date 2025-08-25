# Arquitectura del Proyecto MichiBurgers

## Resumen General

MichiBurgers es una aplicación web Angular para gestión de restaurante con backend PHP. Utiliza Angular 20, Material Design, Tailwind CSS y herramientas modernas de desarrollo.

## Stack Tecnológico

### Frontend
- **Angular 20.x** - Framework principal con standalone components
- **Angular Material** - Componentes de UI y sistema de diseño
- **Tailwind CSS 3.x** - Utilidades de CSS y diseño responsivo
- **RxJS** - Programación reactiva y manejo de observables
- **TypeScript 5.8.x** - Tipado estático y características modernas

### Backend
- **PHP** - API REST en `/api/` con endpoints organizados por funcionalidad
- **MySQL** - Base de datos (configuración en `api/config/`)

### Herramientas de Desarrollo
- **Vite** - Build tool y dev server (reemplaza Angular CLI webpack)
- **ESLint 9.x** - Linting con configuración flat config
- **Prettier 3.x** - Formateo automático de código
- **Angular DevKit** - Herramientas de desarrollo Angular

## Estructura del Proyecto

```
MichiBurgers/
├── src/app/                          # Código fuente Angular
│   ├── compartido/                   # Componentes y servicios compartidos
│   │   └── components/
│   │       └── layout-principal/     # Layout principal con header/nav
│   ├── funcionalidades/              # Módulos por funcionalidad
│   │   ├── auth/                     # Autenticación y autorización
│   │   ├── admin/                    # Panel administrativo
│   │   ├── cocina/                   # Módulo de cocina
│   │   └── mapa-meses/              # Gestión de mesas
│   ├── core/                        # Servicios core y guards
│   └── app.routes.ts                # Configuración de rutas principales
├── api/                             # Backend PHP
│   ├── auth/                        # Endpoints de autenticación
│   ├── config/                      # Configuración de BD y CORS
│   ├── mesas/                       # API de gestión de mesas
│   └── productos/                   # API de productos
├── docs/                            # Documentación del proyecto
└── public/                          # Assets estáticos
```

## Configuración de Herramientas

### ESLint (v9 Flat Config)
- **Archivo**: `eslint.config.js`
- **Características**:
  - Configuración flat (nuevo formato ESLint v9)
  - Integración con Angular ESLint y TypeScript ESLint
  - Reglas para imports ordenados y variables no utilizadas
  - Ignora archivos de build, dependencias y PHP

### Prettier
- **Archivos**: `.prettierrc` (implícito), `.prettierignore`
- **Configuración**: Defaults de Prettier con exclusiones específicas
- **Ignora**: `node_modules/`, `dist/`, `api/`, `.angular/`

### TypeScript
- **Archivos**: `tsconfig.json`, `tsconfig.app.json`
- **Configuración**: Strict mode habilitado, Angular compiler options
- **Target**: ES2022 con módulos ES2022

### Tailwind CSS
- **Archivo**: `tailwind.config.js`
- **Características**:
  - Tema personalizado con colores de marca (naranja/ámbar)
  - Fuentes personalizadas y animaciones
  - Purge automático para optimización de bundle

### Vite
- **Archivo**: `vite.config.ts`
- **Configuración**: 
  - Alias para rutas absolutas
  - Exclusión de Angular animations para SSR
  - Integración con Angular DevKit

## Patrones de Arquitectura

### Estructura Modular
- **Funcionalidades**: Cada área de negocio en su propio módulo
- **Compartido**: Componentes y servicios reutilizables
- **Core**: Servicios singleton y configuración global

### Gestión de Estado
- **AuthService**: Estado de autenticación con observables
- **Reactive Forms**: Formularios con validación reactiva
- **RxJS**: Streams para comunicación entre componentes

### Routing
- **Lazy Loading**: Módulos cargados bajo demanda
- **Guards**: Protección de rutas por rol/autenticación
- **Wildcard**: Redirección a login para rutas no encontradas

### Estilos
- **Híbrido**: Tailwind utilities + Angular Material components
- **Responsive**: Mobile-first con breakpoints Tailwind
- **Theming**: Paleta consistente naranja/ámbar para branding

## Flujo de Autenticación

1. **Login**: POST a `/api/auth/login.php`
2. **Token Storage**: JWT en localStorage + usuario en memoria
3. **AuthService**: Observable stream para estado reactivo
4. **Guards**: Verificación de roles en rutas protegidas
5. **Interceptors**: Inyección automática de token en requests

## Consideraciones SSR

- **Platform Detection**: `isPlatformBrowser` para código cliente
- **State Seeding**: Inicialización temprana para evitar flashes
- **Hydration**: Sincronización entre servidor y cliente

## Scripts de Desarrollo

```json
{
  "start": "ng serve",
  "build": "ng build",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix"
}
```

## Convenciones de Código

### Naming
- **Componentes**: PascalCase (`LayoutPrincipalComponent`)
- **Archivos**: kebab-case (`layout-principal.component.ts`)
- **Variables**: camelCase (`nombreCompleto`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Imports
- **Orden**: Angular core → Angular common → Third party → Relative
- **Agrupación**: Una línea vacía entre grupos
- **Alias**: Rutas absolutas con `@/` para src/

### Comentarios
- **JSDoc**: Para clases y métodos públicos
- **Inline**: Para lógica compleja o workarounds
- **TODO**: Para mejoras futuras con contexto

## Deployment

- **Build**: `ng build` genera archivos optimizados en `dist/`
- **Assets**: Copiados automáticamente desde `public/`
- **Environment**: Variables en `src/environments/`
- **Proxy**: Configuración para desarrollo en `proxy.conf.json`

## Próximas Mejoras

- [ ] Implementar Service Workers para PWA
- [ ] Añadir tests unitarios con Jest
- [ ] Configurar CI/CD pipeline
- [ ] Optimizar bundle splitting
- [ ] Implementar i18n para múltiples idiomas
