# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 16 frontend application for a supermarket management system. It connects to a Spring Boot backend API to manage products, suppliers (proveedores), and orders (pedidos). The application uses Bootstrap 5 for styling and @ngx-resource for declarative HTTP operations.

## Development Commands

### Running the Application
```bash
ng serve                    # Start dev server at http://localhost:4200
ng build                    # Build for production
ng test                     # Run unit tests with Karma
```

### Code Generation
```bash
ng generate component <name>       # Generate a new component
ng generate service <name>          # Generate a new service
ng generate module <name>           # Generate a new module
```

## Architecture & Code Structure

### Module Organization

The application follows a **modular architecture** with clear separation of concerns:

```
src/app/
├── api/                    # Domain models and API resources (shared)
│   ├── models/            # TypeScript interfaces (prefix: I)
│   └── resources/         # @ngx-resource services for HTTP
├── main/                   # Main feature module
│   ├── main.component     # Layout with navbar and router-outlet
│   └── main-routing       # Child routes for main section
├── pages/                  # Page components (feature components)
│   ├── login/
│   ├── productos-list/
│   ├── proveedores-cards/
│   ├── pedidos-list/
│   └── pedidos-create/
└── core/                   # Future: shared services, guards, interceptors
```

### Key Architectural Patterns

1. **@ngx-resource Pattern**: API services use `@ngx-resource` decorators for declarative HTTP operations
   - Services extend `Resource` base class
   - Endpoints defined with `@ResourceAction` decorators
   - Type-safe with `IResourceMethodObservable<Request, Response>`

2. **Interface Naming**: All domain model interfaces use `I` prefix (e.g., `IProducto`, `IProveedor`)

3. **Routing Structure**:
   - Root routes in `app-routing.module.ts`
   - Feature routes in `main-routing.module.ts` with lazy loading
   - Login is standalone route, main content under `/main` path

## Backend API Integration

### Base URL Configuration
- **Development**: `http://localhost:8080` (configured in `environment.ts`)
- **API Prefix**: All endpoints use `/api` prefix
- **Full URL Example**: `http://localhost:8080/api/productos`

### Resource Services

All API resource services follow this pattern:

```typescript
@ResourceParams({
  pathPrefix: `${environment.apiUrl}/api`
})
export class ExampleResource extends Resource {
  @ResourceAction({
    path: '/endpoint',
    method: ResourceRequestMethod.Get
  })
  getAll!: IResourceMethodObservable<void, IModel[]>
}
```

**Available Resource Services**:
- `ProductosResource` (src/app/api/resources/productos-resource.service.ts)
- `ProveedoresResource` (src/app/api/resources/proveedores-resource.service.ts)
- `PedidosResource` (src/app/api/resources/pedidos-resource.service.ts)
- `EscalasResource` (src/app/api/resources/escalas-resource.service.ts)
- `AuthResource` (src/app/api/resources/auth-resource.service.ts)

### Key API Endpoints

**Authentication**:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

**Products (Productos)**:
- `GET /api/productos` - Get all products
- `GET /api/productos/{barCode}` - Get product by barcode
- `POST /api/productos` - Create product
- `PUT /api/productos/{barCode}` - Update product
- `DELETE /api/productos/{barCode}` - Delete product
- `GET /api/productos/proveedor/{id}` - Get products by supplier
- `POST /api/productos/{barCode}/proveedor/{idProveedor}` - Assign product to supplier
- `DELETE /api/productos/{barCode}/proveedor/{idProveedor}` - Remove product from supplier

**Suppliers (Proveedores)**:
- `GET /api/proveedores` - Get all suppliers
- `GET /api/proveedores/{id}` - Get supplier by ID
- `POST /api/proveedores` - Create supplier (includes health check)
- `DELETE /api/proveedores/{id}` - Delete supplier
- `GET /api/proveedores/{id}/rating` - Get supplier average rating
- `GET /api/proveedores/{id}/productos-disponibles` - Get supplier's available products
- `POST /api/proveedores/{id}/sync` - Sync prices from supplier

**Orders (Pedidos)**:
- `GET /api/pedidos` - Get all orders
- `GET /api/pedidos/{id}` - Get order by ID
- `POST /api/pedidos` - Create order
- `PUT /api/pedidos/{id}` - Update order
- `DELETE /api/pedidos/{id}` - Delete order
- `GET /api/pedidos/proveedor/{proveedorId}` - Get orders by supplier
- `POST /api/pedidos/{id}/cancelar` - Cancel order
- `POST /api/pedidos/{id}/rate` - Rate delivered order
- `GET /api/pedidos/{id}/status` - Get order status from supplier

**Escalas (Rating Scales)**:
- `GET /api/escalas/proveedor/{id}` - Get all scales for supplier
- `GET /api/escalas/proveedor/{id}/unmapped` - Get unmapped scales
- `POST /api/escalas` - Save scale mappings

See `API-DOCUMENTATION.md` for complete endpoint documentation and `FRONTEND-PLAN.md` for frontend implementation plan.

## Domain Models

### Core Entities

**IProducto** (Product):
```typescript
{
  codigoBarra: number;        // Barcode (primary key)
  nombre: string;             // Product name
  imagen?: string;            // Image URL (optional)
  minStock: number;           // Minimum stock level
  maxStock: number;           // Maximum stock level
  actualStock: number;        // Current stock
  estadoId: number;           // Status ID (1=Available, 2=Out of Stock, 3=Discontinued)
  precios?: IHistorialPrecio[]; // Price history (optional)
}
```

**IProveedor** (Supplier):
```typescript
{
  id?: number;                // ID (auto-generated)
  name: string;               // Supplier name
  apiEndpoint: string;        // API URL
  tipoServicio: number;       // Service type (1=REST, 2=SOAP)
  clientId: string;           // Client ID for authentication
  apiKey: string;             // API key
  ratingPromedio?: number;    // Average rating (0.00 to 5.00)
}
```

**IPedido** (Order):
```typescript
{
  id?: number;                // ID (auto-generated)
  estadoId: number;           // Status (1=Pending, 2=Confirmed, 3=Preparing, 4=In Transit, 5=Delivered, 6=Canceled)
  proveedorId: number;        // Supplier ID
  fechaEstimada: string;      // Estimated delivery date (ISO format)
  fechaEntrega?: string;      // Actual delivery date
  evaluacionEscala?: number;  // Rating scale ID
  productos: IPedidoProducto[]; // Order items
}
```

## Important Implementation Details

### Authentication Flow
- Login component validates credentials via `AuthResource.login()`
- On success, user data is stored in `localStorage` with key `'usuario'`
- After login, redirects to `/productos` (not `/main/productos`)
- No JWT implementation - simple session storage

### Routing Quirks
- Main module uses child routes under `/main` path
- Direct navigation to `/productos` redirects to `/main/productos`
- Login is at root level (`/login`), not under `/main`

### Date Handling
- Backend expects ISO 8601 format: `YYYY-MM-DDTHH:mm:ss`
- Example: `"2025-12-01T10:00:00"`
- TypeScript Date objects auto-serialize to ISO format when sent to API

### NgxResource Usage
- Services are **not** provided in root - they must be registered in module providers
- Methods are typed with `IResourceMethodObservable<Request, Response>`
- Path parameters use `{!paramName}` syntax in `@ResourceAction` path
- Example: `path: '/productos/{!barCode}'` expects `{ barCode: number }` argument

### Bootstrap 5 Components
- Application uses Bootstrap 5 classes for styling
- Bootstrap icons available via `bootstrap-icons` package
- No additional component library (no Angular Material, ng-bootstrap not fully integrated)

## Testing & Debugging

### Running Tests
```bash
ng test                     # Run all unit tests
ng test --no-watch         # Run tests once (CI mode)
ng test --code-coverage    # Generate coverage report
```

### Common Issues

**CORS Errors**:
- Ensure backend has CORS enabled for `http://localhost:4200`
- Backend should allow `GET, POST, PUT, DELETE, OPTIONS` methods

**NgxResource Errors**:
- If service methods return undefined, check if service is provided in module
- Verify `ResourceModule.forRoot()` is imported in `AppModule`

**Environment Variables**:
- Check `environment.ts` for correct API URL
- Production uses `environment.prod.ts` (not currently configured)

## Code Style & Conventions

### Component Organization
- Use reactive forms (`ReactiveFormsModule`) for form handling
- Component property naming: use underscore prefix for injected services (e.g., `_router`, `_productosService`)
- Prefer `OnInit` lifecycle hook for initialization logic

### TypeScript Conventions
- All interfaces prefixed with `I` (e.g., `IProducto`, `IProveedor`)
- Use strict TypeScript settings (enabled in `tsconfig.json`)
- Enable `experimentalDecorators` for @ngx-resource decorators

### Import Paths
- Use absolute imports from `src/` directory
- Example: `import { environment } from 'src/environments/environment'`
- Avoid relative imports across module boundaries

## Current Implementation Status

### Implemented Features ✅
- User authentication (login/register)
- Product listing and management (CRUD)
- Supplier cards display with ratings
- Order listing
- Basic routing and navigation
- API integration with @ngx-resource

### In Progress / TODO 🚧
- Order creation form (pedidos-create component exists but may need completion)
- Product-supplier assignment UI
- Rating scale mapping interface
- Order status tracking
- Price history display
- Form validations and error handling

## Additional Resources

- **API Documentation**: See `API-DOCUMENTATION.md` for complete backend API specs
- **Frontend Plan**: See `FRONTEND-PLAN.md` for detailed architecture and implementation guide
- **Angular Docs**: https://angular.io/docs
- **NgxResource Docs**: https://github.com/ngx-resource/core
