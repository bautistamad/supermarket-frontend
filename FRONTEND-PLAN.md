# Plan de Frontend Angular - SupermarketProyect

## 📋 Análisis del Backend Disponible

El backend tiene **3 módulos principales** completamente funcionales:
1. **Productos** - 5 endpoints CRUD + consultas
2. **Proveedores** - 4 endpoints CRUD
3. **Pedidos** - 7 endpoints incluyendo gestión completa

---

## 🏗️ Arquitectura del Frontend

### Estructura del Proyecto (Siguiendo estilo de la profesora)

```
src/
├── app/
│   ├── app.module.ts
│   ├── app-routing.module.ts
│   ├── app.component.ts/html/css
│   │
│   ├── core/                           # Módulo Core (singleton services)
│   │   ├── core.module.ts
│   │   ├── components/
│   │   │   ├── message-dialog/         # Modal de mensajes
│   │   │   └── loader/                 # Spinner de carga
│   │   ├── models/
│   │   │   └── i-message.ts
│   │   ├── services/
│   │   │   ├── loader.service.ts       # Servicio de loading
│   │   │   └── app-message.service.ts  # Servicio de mensajes
│   │   ├── handlers/
│   │   │   └── app-error.service.ts    # Manejo de errores
│   │   └── interceptor/
│   │       └── app-http.interceptor.ts # Interceptor HTTP
│   │
│   └── main/                            # Módulo Main (Feature Module)
│       ├── main.module.ts
│       ├── main-routing.module.ts
│       ├── main.component.ts/html/css
│       │
│       ├── api/
│       │   ├── models/                  # Interfaces de dominio
│       │   │   ├── i-producto.ts
│       │   │   ├── i-proveedor.ts
│       │   │   ├── i-pedido.ts
│       │   │   └── i-enums.ts
│       │   │
│       │   ├── resources/               # Services con @ngx-resource
│       │   │   ├── productos-resource.service.ts
│       │   │   ├── proveedores-resource.service.ts
│       │   │   └── pedidos-resource.service.ts
│       │   │
│       │   └── resolvers/               # Resolvers para pre-cargar datos
│       │       └── productos.resolver.ts
│       │
│       ├── pages/                       # Páginas del módulo
│       │   ├── dashboard/               # Dashboard principal
│       │   │   └── dashboard.component.ts/html/css
│       │   │
│       │   ├── productos/
│       │   │   ├── producto-list/       # Lista de productos
│       │   │   └── producto-form/       # Formulario producto
│       │   │
│       │   ├── proveedores/
│       │   │   ├── proveedor-list/
│       │   │   └── proveedor-form/
│       │   │
│       │   └── pedidos/
│       │       ├── pedido-list/
│       │       ├── pedido-form/
│       │       └── pedido-detail/
│       │
│       └── splash-page/                 # Página de bienvenida (opcional)
│           └── splash-page.component.ts/html/css
```

---

## 🎨 Componentes Principales (Minimalistas)

### 1. Dashboard (Página Principal)

**Funcionalidades:**
- Cards con estadísticas simples:
  - Total productos
  - Total proveedores
  - Pedidos pendientes
- Botones de acceso rápido a cada módulo
- **Sin gráficos complejos** (para mantenerlo simple)

---

### 2. Módulo Productos

#### producto-list.component
**Tabla con columnas:**
- Código Barra
- Nombre
- Stock Actual
- Min/Max
- Estado
- Acciones

**Funcionalidades:**
- Botón "Nuevo Producto"
- Filtro simple por nombre
- Botones de acción: Ver Detalles | Editar | Eliminar

#### producto-form.component
**Formulario reactivo con validación:**
- Código de Barra (número, requerido)
- Nombre (texto, requerido)
- Imagen (URL opcional)
- Stock Mínimo (número, >= 0)
- Stock Máximo (número, > mínimo)
- Stock Actual (número, >= 0)

**Validaciones:**
- Código de barra único
- Stock mínimo < Stock máximo
- Todos los stocks >= 0

---

### 3. Módulo Proveedores

#### proveedor-list.component
**Tabla con columnas:**
- ID
- Nombre
- Tipo Servicio
- API Endpoint
- Acciones

**Funcionalidades:**
- Botón "Nuevo Proveedor"
- Ver productos asociados

#### proveedor-form.component
**Formulario:**
- Nombre (texto, requerido)
- API Endpoint (URL, requerido)
- Tipo Servicio (dropdown: REST/SOAP)
- API Key (input password, requerido)

---

### 4. Módulo Pedidos

#### pedido-list.component
**Tabla con columnas:**
- ID
- Proveedor
- Estado
- Fecha Estimada
- Fecha Entrega
- Cantidad de Productos
- Acciones

**Funcionalidades:**
- Filtro por estado
- Filtro por proveedor
- Botón "Nuevo Pedido"

#### pedido-form.component
**Formulario complejo:**
- Selector de proveedor (dropdown)
- Selector de productos (tabla con multi-select)
  - Código de Barra
  - Nombre
  - Stock Disponible
  - Cantidad a pedir (input)
- Fecha estimada (datepicker)
- Estado (dropdown)

**Validaciones:**
- Al menos 1 producto
- Cantidad > 0 para cada producto
- Fecha estimada futura

#### pedido-detail.component
**Vista de detalle:**
- Información general del pedido
- Datos del proveedor
- Lista de productos con cantidades
- Timeline del estado (opcional)
- Botón "Editar" / "Cancelar"

---

## 🛠️ Stack Tecnológico (Adaptado a Angular 21)

### Dependencies Principales

```json
{
  "dependencies": {
    "@angular/animations": "^21.0.0",
    "@angular/common": "^21.0.0",
    "@angular/compiler": "^21.0.0",
    "@angular/core": "^21.0.0",
    "@angular/forms": "^21.0.0",
    "@angular/platform-browser": "^21.0.0",
    "@angular/router": "^21.0.0",
    "@ng-bootstrap/ng-bootstrap": "^18.0.0",
    "@ngx-resource/core": "^18.1.0",
    "@ngx-resource/handler-ngx-http": "^18.1.0",
    "bootstrap": "^5.3.3",
    "rxjs": "~7.8.0"
  }
}
```

**Stack Tecnológico:**
- **Angular 21** (tu versión instalada - compatible con estructura de la profesora)
- **Bootstrap 5 + ng-bootstrap 18** (UI components - simple y limpio)
- **@ngx-resource 18** (decoradores para servicios HTTP - más declarativo)
- **ReactiveFormsModule** (formularios reactivos)
- **RouterModule** (navegación con lazy loading)

### ¿Por qué @ngx-resource en lugar de HttpClient?

La profesora usa **@ngx-resource** porque:
- Código más limpio y declarativo (usa decoradores)
- Menos boilerplate
- Más fácil de mantener para proyectos académicos
- Ejemplo:
```typescript
@ResourceAction({
  path: '/productos',
  method: ResourceRequestMethod.Get
})
getAll!: IResourceMethodObservable<IProducto[], void>;
```

---

## 📦 Modelos TypeScript (Convención: interfaces con prefijo 'I')

### main/api/models/i-producto.ts
```typescript
export interface IProducto {
  codigoBarra: number;
  nombre: string;
  imagen?: string;
  minStock: number;
  maxStock: number;
  actualStock: number;
  updateDate?: Date;
  estadoId: number;
  estadoNombre?: string;
  estadoDescripcion?: string;
  precios?: IHistorialPrecio[];
}

export interface IHistorialPrecio {
  codigoBarra: number;
  idProveedor: number;
  precio: number;
  fechaInicio: Date;
  fechaFin?: Date;
  proveedorNombre?: string;
  productoNombre?: string;
}
```

### main/api/models/i-proveedor.ts
```typescript
export interface IProveedor {
  id?: number;
  name: string;
  apiEndpoint: string;
  tipoServicio: number;  // 1 = REST, 2 = SOAP
  apiKey: string;
}
```

### main/api/models/i-pedido.ts
```typescript
export interface IPedido {
  id?: number;
  estadoId: number;
  proveedorId: number;
  puntuacion?: number;
  fechaEstimada: Date;
  fechaEntrega?: Date;
  evaluacionEscala?: number;
  fechaRegistro?: Date;
  estadoNombre?: string;
  estadoDescripcion?: string;
  proveedorNombre?: string;
  productos: IPedidoProducto[];
}

export interface IPedidoProducto {
  idPedido?: number;
  codigoBarra: number;
  cantidad: number;
  productoNombre?: string;
  productoImagen?: string;
}
```

### main/api/models/i-enums.ts
```typescript
// Estados de producto (simple - sin enum, solo constantes)
export const ESTADO_PRODUCTO = {
  DISPONIBLE: 1,
  AGOTADO: 2,
  DESCONTINUADO: 3
} as const;

// Estados de pedido
export const ESTADO_PEDIDO = {
  PENDIENTE: 1,
  CONFIRMADO: 2,
  EN_PREPARACION: 3,
  EN_TRANSITO: 4,
  ENTREGADO: 5,
  CANCELADO: 6
} as const;

// Tipos de servicio
export const TIPO_SERVICIO = {
  REST: 1,
  SOAP: 2
} as const;
```

---

## 🔄 Plan de Implementación (Fases Simplificadas)

### Fase 1: Setup Inicial (30-45 min)
- [ ] Crear proyecto Angular 21: `ng new supermarket-frontend --routing --style=css`
- [ ] Instalar dependencias: Bootstrap, ng-bootstrap 18, @ngx-resource 18
- [ ] Configurar `angular.json` para Bootstrap
- [ ] Configurar `environment.ts` (API URL: `http://localhost:8080/api`)
- [ ] Crear estructura de carpetas: `core/` y `main/`

### Fase 2: Core Module (45 min - 1 hora)
- [ ] Crear `core.module.ts`
- [ ] Crear `loader.component` (spinner simple)
- [ ] Crear `message-dialog.component` (modal con ng-bootstrap)
- [ ] Crear `loader.service.ts`
- [ ] Crear `app-message.service.ts`
- [ ] Crear `app-error.service.ts` (handler de errores)
- [ ] Crear `app-http.interceptor.ts` (básico, sin lógica compleja)
- [ ] Crear `i-message.ts` interface

### Fase 3: Main Module - Setup (30-45 min)
- [ ] Crear `main.module.ts` y `main-routing.module.ts`
- [ ] Crear `main.component` (layout con navbar básico)
- [ ] Crear todos los modelos en `main/api/models/`
  - i-producto.ts
  - i-proveedor.ts
  - i-pedido.ts
  - i-enums.ts

### Fase 4: Productos (2-3 horas)
- [ ] Crear `productos-resource.service.ts` con @ngx-resource
  - GET all, GET by id, POST, DELETE
- [ ] (Opcional) Crear `productos.resolver.ts`
- [ ] Crear `pages/productos/producto-list/`
  - Tabla Bootstrap simple
  - Botón "Nuevo Producto"
  - Botones Editar/Eliminar
- [ ] Crear `pages/productos/producto-form/`
  - FormGroup reactivo
  - Validaciones básicas
  - Submit con resource service
- [ ] Configurar rutas en `main-routing.module.ts`

### Fase 5: Proveedores (1.5-2 horas)
- [ ] Crear `proveedores-resource.service.ts`
- [ ] Crear `pages/proveedores/proveedor-list/`
  - Tabla simple
- [ ] Crear `pages/proveedores/proveedor-form/`
  - Formulario con select de tipo servicio
- [ ] Configurar rutas

### Fase 6: Pedidos (2.5-3 horas)
- [ ] Crear `pedidos-resource.service.ts`
- [ ] Crear `pages/pedidos/pedido-list/`
  - Tabla con filtros simples (select de estado/proveedor)
- [ ] Crear `pages/pedidos/pedido-form/`
  - Select de proveedor
  - Tabla de productos con checkboxes
  - Input de cantidad por producto
  - Datepicker Bootstrap
- [ ] (Opcional) Crear `pedido-detail/` para ver detalle
- [ ] Configurar rutas

### Fase 7: Dashboard (30-45 min)
- [ ] Crear `pages/dashboard/dashboard.component`
- [ ] Cards Bootstrap con estadísticas simples:
  - Total productos
  - Total proveedores
  - Pedidos pendientes
- [ ] Botones de navegación rápida

### Fase 8: Integración Final (30 min)
- [ ] Configurar `app-routing.module.ts` con lazy loading
- [ ] Agregar loader en `app.component.html`
- [ ] Testear flujo completo
- [ ] Ajustar estilos Bootstrap

**TOTAL ESTIMADO: 10-14 horas** (más realista para un examen)

---

## 🎯 Características Incluidas

### ✅ Incluir (Simple - Estilo Académico)
- Tablas Bootstrap simples (sin paginación compleja)
- Formularios reactivos con validaciones básicas
- Modales con ng-bootstrap para mensajes y confirmaciones
- Loading spinner (componente simple del core)
- Manejo de errores con AppErrorService
- Navbar Bootstrap básico
- Cards para dashboard
- CRUD completo de las 3 entidades
- @ngx-resource para servicios HTTP

### ❌ NO Incluir (Mantenerlo SIMPLE para el examen)
- ~~Autenticación/Login~~ (no es necesario)
- ~~Gráficos~~ (solo números en cards)
- ~~Drag & drop~~
- ~~Animaciones~~
- ~~Internacionalización (i18n)~~ (la profesora lo usa pero NO es necesario para el examen)
- ~~Paginación server-side~~ (máximo client-side simple)
- ~~WebSockets~~
- ~~SweetAlert2~~ (usar ng-bootstrap modals nomás)
- ~~Angular Material~~ (usar Bootstrap)

---

## 📝 Ejemplos de Código (Estilo de la Profesora)

### Resource Service (main/api/resources/productos-resource.service.ts)

```typescript
import { Injectable } from '@angular/core';
import {
  Resource,
  ResourceAction,
  ResourceHandler,
  ResourceParams,
  ResourceRequestMethod,
  ResourceRequestBodyType,
  IResourceMethodObservable
} from '@ngx-resource/core';
import { environment } from 'src/environments/environment';
import { IProducto } from '../models/i-producto';

@Injectable()
@ResourceParams({
  pathPrefix: `${environment.apiUrl}/api`
})
export class ProductosResourceService extends Resource {

  constructor(handler?: ResourceHandler) {
    super(handler);
  }

  // GET /api/productos
  @ResourceAction({
    path: '/productos',
    method: ResourceRequestMethod.Get
  })
  getAll!: IResourceMethodObservable<IProducto[], void>;

  // GET /api/productos/{barCode}
  @ResourceAction({
    path: '/productos/{!barCode}',
    method: ResourceRequestMethod.Get
  })
  getById!: IResourceMethodObservable<IProducto, { barCode: number }>;

  // POST /api/productos
  @ResourceAction({
    path: '/productos',
    method: ResourceRequestMethod.Post,
    requestBodyType: ResourceRequestBodyType.JSON
  })
  create!: IResourceMethodObservable<IProducto, IProducto>;

  // DELETE /api/productos/{barCode}
  @ResourceAction({
    path: '/productos/{!barCode}',
    method: ResourceRequestMethod.Delete
  })
  delete!: IResourceMethodObservable<void, { barCode: number }>;
}
```

### Formulario Reactivo (main/pages/productos/producto-form/producto-form.component.ts)

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosResourceService } from '../../../api/resources/productos-resource.service';
import { IProducto } from '../../../api/models/i-producto';

@Component({
  selector: 'app-producto-form',
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.css']
})
export class ProductoFormComponent implements OnInit {

  form!: FormGroup;
  isEditMode: boolean = false;
  submitted: boolean = false;

  constructor(
    private _fb: FormBuilder,
    private _productosService: ProductosResourceService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    const barCode = this._route.snapshot.paramMap.get('barCode');
    if (barCode) {
      this.isEditMode = true;
      this.loadProducto(+barCode);
    }
    this.initForm();
  }

  private initForm(): void {
    this.form = this._fb.group({
      codigoBarra: new FormControl(null, [Validators.required, Validators.min(1)]),
      nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
      imagen: new FormControl(''),
      minStock: new FormControl(0, [Validators.required, Validators.min(0)]),
      maxStock: new FormControl(0, [Validators.required, Validators.min(1)]),
      actualStock: new FormControl(0, [Validators.required, Validators.min(0)]),
      estadoId: new FormControl(1, [Validators.required])
    });

    if (this.isEditMode) {
      this.form.get('codigoBarra')?.disable();
    }
  }

  private loadProducto(barCode: number): void {
    this._productosService.getById({ barCode }).subscribe({
      next: (producto: IProducto) => {
        this.form.patchValue(producto);
      },
      error: (err) => {
        console.error('Error al cargar producto:', err);
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      const producto: IProducto = this.form.getRawValue();

      this._productosService.create(producto).subscribe({
        next: () => {
          this._router.navigate(['/main/productos']);
        },
        error: (error) => {
          console.error('Error al guardar:', error);
        }
      });
    }
  }

  cancelar(): void {
    this._router.navigate(['/main/productos']);
  }
}
```

### Environment Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.supermarket.com/api'
};
```

---

## 🚀 Comandos de Inicio Rápido (Angular 21)

### 1. Crear Proyecto Angular 21
```bash
ng new supermarket-frontend --routing --style=css
cd supermarket-frontend
```

### 2. Instalar Dependencias (Versiones compatibles con Angular 21)
```bash
npm install bootstrap@5.3.3
npm install @ng-bootstrap/ng-bootstrap@18.0.0
npm install @ngx-resource/core@18.1.0
npm install @ngx-resource/handler-ngx-http@18.1.0
```

### 3. Configurar Bootstrap en angular.json
Editar `angular.json` y agregar Bootstrap en `styles`:
```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.css"
],
"scripts": [
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
]
```

### 4. Generar Estructura Core
```bash
# Core Module
ng generate module core
ng generate component core/loader
ng generate component core/components/message-dialog
ng generate service core/services/loader
ng generate service core/services/app-message
ng generate service core/handlers/app-error
ng generate interceptor core/interceptor/app-http

# Crear modelos manualmente
mkdir -p src/app/core/models
touch src/app/core/models/i-message.ts
```

### 5. Generar Main Module
```bash
ng generate module main --routing
ng generate component main

# Crear estructura de carpetas
mkdir -p src/app/main/api/models
mkdir -p src/app/main/api/resources
mkdir -p src/app/main/api/resolvers
mkdir -p src/app/main/pages
```

### 6. Crear Modelos (manualmente en main/api/models/)
```bash
touch src/app/main/api/models/i-producto.ts
touch src/app/main/api/models/i-proveedor.ts.ts
touch src/app/main/api/models/i-pedido.ts
touch src/app/main/api/models/i-enums.ts
```

### 7. Crear Services con @ngx-resource (manualmente)
```bash
touch src/app/main/api/resources/productos-resource.service.ts
touch src/app/main/api/resources/proveedores-resource.service.ts
touch src/app/main/api/resources/pedidos-resource.service.ts
```

### 8. Generar Páginas
```bash
# Dashboard
ng generate component main/pages/dashboard

# Productos
ng generate component main/pages/productos/producto-list
ng generate component main/pages/productos/producto-form

# Proveedores
ng generate component main/pages/proveedores/proveedor-list
ng generate component main/pages/proveedores/proveedor-form

# Pedidos
ng generate component main/pages/pedidos/pedido-list
ng generate component main/pages/pedidos/pedido-form
ng generate component main/pages/pedidos/pedido-detail
```

---

## 🗺️ Routing Configuration (Estilo Profesora)

### app-routing.module.ts
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full' },
  {
    path: 'main',
    loadChildren: () => import('./main/main.module').then(m => m.MainModule)
  },
  { path: '**', redirectTo: '/main' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### main-routing.module.ts
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductoListComponent } from './pages/productos/producto-list/producto-list.component';
import { ProductoFormComponent } from './pages/productos/producto-form/producto-form.component';
import { ProveedorListComponent } from './pages/proveedores/proveedor-list/proveedor-list.component';
import { ProveedorFormComponent } from './pages/proveedores/proveedor-form/proveedor-form.component';
import { PedidoListComponent } from './pages/pedidos/pedido-list/pedido-list.component';
import { PedidoFormComponent } from './pages/pedidos/pedido-form/pedido-form.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },

      // Productos
      { path: 'productos', component: ProductoListComponent },
      { path: 'productos/nuevo', component: ProductoFormComponent },
      { path: 'productos/editar/:barCode', component: ProductoFormComponent },

      // Proveedores
      { path: 'proveedores', component: ProveedorListComponent },
      { path: 'proveedores/nuevo', component: ProveedorFormComponent },
      { path: 'proveedores/editar/:id', component: ProveedorFormComponent },

      // Pedidos
      { path: 'pedidos', component: PedidoListComponent },
      { path: 'pedidos/nuevo', component: PedidoFormComponent },
      { path: 'pedidos/:id', component: PedidoFormComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
```

---

## 📊 Estructura de Datos de Ejemplo

### Producto (GET /api/productos/12345)
```json
{
  "codigoBarra": 12345,
  "nombre": "Leche Descremada La Serenísima 1L",
  "imagen": "https://example.com/leche.jpg",
  "minStock": 10,
  "maxStock": 100,
  "actualStock": 45,
  "updateDate": "2025-11-20T10:30:00",
  "estadoId": 1,
  "estadoNombre": "Disponible",
  "estadoDescripcion": "Producto disponible para la venta"
}
```

### Proveedor (GET /api/proveedores/1)
```json
{
  "id": 1,
  "name": "Distribuidora Central",
  "apiEndpoint": "https://api.distribuidora.com",
  "tipoServicio": 1,
  "apiKey": "secret-key-123"
}
```

### Pedido (POST /api/pedidos)
```json
{
  "estadoId": 1,
  "proveedorId": 1,
  "fechaEstimada": "2025-12-01T10:00:00",
  "productos": [
    {
      "codigoBarra": 12345,
      "cantidad": 50
    },
    {
      "codigoBarra": 67890,
      "cantidad": 30
    }
  ]
}
```

---

## ⏱️ Estimación Total de Desarrollo (Realista para Examen)

| Fase | Tiempo Estimado |
|------|----------------|
| Fase 1: Setup Inicial | 30-45 min |
| Fase 2: Core Module | 45 min - 1 hora |
| Fase 3: Main Module Setup | 30-45 min |
| Fase 4: Módulo Productos | 2-3 horas |
| Fase 5: Módulo Proveedores | 1.5-2 horas |
| Fase 6: Módulo Pedidos | 2.5-3 horas |
| Fase 7: Dashboard | 30-45 min |
| Fase 8: Integración Final | 30 min |
| **TOTAL** | **10-14 horas** |

**Nota:** Esta estimación es más realista para un examen académico con la estructura simplificada de la profesora.

---

## 📌 Notas Importantes

### Configuración CORS en Backend
Asegúrate de que el backend Spring Boot tenga CORS habilitado:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### Proxy Configuration (Opcional)
Si prefieres usar un proxy para desarrollo, crea `proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

Y modifica `angular.json`:
```json
"serve": {
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

---

## 🎓 Recomendaciones para la Presentación

1. **Demo Flow:**
   - Mostrar Dashboard con estadísticas
   - Crear un nuevo producto
   - Crear un nuevo proveedor
   - Crear un pedido completo
   - Editar y eliminar registros

2. **Puntos a Destacar:**
   - Arquitectura modular (Hexagonal en backend + Modular en frontend)
   - Validaciones en formularios
   - Manejo de errores
   - UI responsiva con Angular Material

3. **Posibles Mejoras Futuras:**
   - Autenticación JWT
   - Integración real con proveedores (REST/SOAP)
   - Reportes y gráficos
   - Notificaciones push
   - Modo offline con Service Workers

---

## 📚 Recursos Útiles

- [Angular Official Docs](https://angular.io/docs)
- [Angular Material Components](https://material.angular.io/components)
- [RxJS Documentation](https://rxjs.dev/)
- [Angular Style Guide](https://angular.io/guide/styleguide)

---

**Última Actualización:** 2025-11-26
**Versión:** 2.1 - Angular 21 + Estilo Profesora
**Estado:** Plan Completo - Listo para Implementación
**Cambios clave:**
- ✅ Estructura adaptada al ejemplo de la profesora
- ✅ **Angular 21** (tu versión instalada) + Bootstrap 5 (no Material)
- ✅ @ngx-resource 18 para servicios HTTP
- ✅ Módulo `main/` con `api/` y `pages/`
- ✅ Interfaces con prefijo `I`
- ✅ Estimaciones más realistas (10-14h)
- ✅ Sin features innecesarias para el examen
- ✅ ng-bootstrap 18 compatible con Angular 21
