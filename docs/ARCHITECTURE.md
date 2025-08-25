# 🏗️ Arquitectura del Sistema MichiBurgers

## Visión General

MichiBurgers implementa una arquitectura modular basada en Angular siguiendo las mejores prácticas de desarrollo empresarial. El sistema está diseñado para ser escalable, mantenible y testeable.

## Arquitectura Frontend (Angular)

### Estructura de Capas

```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│         (Components & Views)        │
├─────────────────────────────────────┤
│            Service Layer            │
│        (Business Logic)             │
├─────────────────────────────────────┤
│             Data Layer              │
│      (HTTP Client & Models)         │
├─────────────────────────────────────┤
│            Core Layer               │
│    (Shared Services & Guards)       │
└─────────────────────────────────────┘
```

### Módulos Principales

#### 1. **Core Module** (`src/app/core/`)

- **Propósito**: Servicios singleton y funcionalidades globales
- **Contenido**:
  - `LoggerService`: Logging centralizado
  - `ErrorHandlerService`: Manejo de errores
  - Guards de autenticación
  - Interceptors HTTP

#### 2. **Shared Module** (`src/app/compartido/`)

- **Propósito**: Componentes y servicios reutilizables
- **Contenido**:
  - `LayoutPrincipalComponent`: Layout base
  - Modelos TypeScript compartidos
  - Pipes y directivas comunes

#### 3. **Feature Modules** (`src/app/funcionalidades/`)

- **Lazy Loading**: Carga bajo demanda
- **Módulos**:
  - `auth/`: Autenticación y autorización
  - `admin/`: Panel de administración
  - `cocina/`: Gestión de cocina
  - `comandera/`: Sistema de comandas
  - `mapa-mesas/`: Gestión de mesas

## Patrones de Diseño Implementados

### 1. **Singleton Pattern**

```typescript
@Injectable({
  providedIn: 'root', // Singleton en toda la app
})
export class AuthService {}
```

### 2. **Observer Pattern**

```typescript
// Uso de RxJS para comunicación reactiva
private mesaSubject = new BehaviorSubject<Mesa[]>([]);
public mesas$ = this.mesaSubject.asObservable();
```

### 3. **Factory Pattern**

```typescript
// Para creación de objetos complejos
export class PedidoFactory {
  static createPedido(mesa: Mesa, items: ItemPedido[]): Pedido {
    return {
      mesa_id: mesa.id,
      items: items,
      total: this.calculateTotal(items),
    };
  }
}
```

### 4. **Strategy Pattern**

```typescript
// Para diferentes estrategias de pago
interface PaymentStrategy {
  process(amount: number): Observable<PaymentResult>;
}
```

## Flujo de Datos

### 1. **Flujo de Autenticación**

```
Usuario → LoginComponent → AuthService → API → JWT Token → LocalStorage
```

### 2. **Flujo de Pedidos**

```
Mesa → ComandaComponent → PedidoService → API → CocinaComponent
```

### 3. **Flujo de Estados**

```
Component → Service → HTTP Client → API → Response → Component Update
```

## Gestión de Estado

### Estado Local (Component Level)

```typescript
export class MesaComponent {
  private mesaState = signal<Mesa[]>([]);

  // Reactive state management
  mesas = computed(() => this.mesaState());
}
```

### Estado Global (Service Level)

```typescript
@Injectable({ providedIn: 'root' })
export class AppStateService {
  private state = new BehaviorSubject(initialState);

  getState() {
    return this.state.asObservable();
  }
}
```

## Comunicación Frontend-Backend

### HTTP Interceptors

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Agregar token JWT automáticamente
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next.handle(authReq);
  }
}
```

### Error Handling

```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(catchError((error) => this.errorHandler.handleHttpError(error)));
  }
}
```

## Arquitectura Backend (PHP)

### Estructura de Directorios

```
api/
├── auth/           # Endpoints de autenticación
├── config/         # Configuración y conexión DB
├── productos/      # CRUD de productos
├── mesas/         # Gestión de mesas
└── shared/        # Utilidades compartidas
```

### Patrón MVC

- **Model**: Clases para interacción con base de datos
- **View**: Respuestas JSON estructuradas
- **Controller**: Lógica de negocio y validación

## Base de Datos

### Diseño Relacional

```sql
Users (1) ──── (N) Pedidos (1) ──── (N) ItemsPedido (N) ──── (1) Productos
  │                  │                                           │
  │                  │                                           │
  └── (N) Mesas ─────┘                                           │
                                                                 │
Categorias (1) ─────────────────────────────────────────────────┘
```

### Normalización

- **1NF**: Eliminación de grupos repetitivos
- **2NF**: Dependencias funcionales completas
- **3NF**: Eliminación de dependencias transitivas

## Seguridad

### Frontend

- **JWT Storage**: Tokens en localStorage con expiración
- **Route Guards**: Protección de rutas por roles
- **Input Validation**: Validación en formularios

### Backend

- **SQL Injection**: Prepared statements
- **XSS Protection**: Sanitización de entrada
- **CORS**: Configuración restrictiva
- **Password Hashing**: Bcrypt para contraseñas

## Performance

### Optimizaciones Frontend

- **Lazy Loading**: Módulos bajo demanda
- **OnPush Strategy**: Change detection optimizada
- **TrackBy Functions**: Optimización de listas
- **Bundle Splitting**: Separación de código

### Optimizaciones Backend

- **Database Indexing**: Índices en campos frecuentes
- **Query Optimization**: Consultas eficientes
- **Caching**: Cache de respuestas frecuentes

## Testing Strategy

### Unit Tests

```typescript
describe('AuthService', () => {
  it('should authenticate user', () => {
    // Test implementation
  });
});
```

### Integration Tests

```typescript
describe('Login Flow', () => {
  it('should login and redirect', () => {
    // E2E test implementation
  });
});
```

## Deployment

### Development

```bash
ng serve --configuration=development
```

### Production

```bash
ng build --configuration=production
```

### Environment Configuration

- **Development**: `environment.ts`
- **Production**: `environment.prod.ts`

## Métricas de Calidad

- **Code Coverage**: >80%
- **Bundle Size**: <2MB
- **Load Time**: <3s
- **Lighthouse Score**: >90

## Escalabilidad

### Horizontal Scaling

- Múltiples instancias del backend
- Load balancer para distribución
- Base de datos replicada

### Vertical Scaling

- Optimización de consultas
- Caching estratégico
- CDN para assets estáticos

---

Esta arquitectura garantiza un sistema robusto, escalable y mantenible, siguiendo las mejores prácticas de la industria.
