# API REST - Documentación de Endpoints
## SupermarketProyect Backend

**Base URL:** `http://localhost:8080/api`

**Última Actualización:** 2025-12-08

---

## Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Productos](#productos)
3. [Proveedores](#proveedores)
4. [Escalas de Calificación](#escalas-de-calificación)
5. [Integración con Proveedores](#integración-con-proveedores)
6. [Pedidos](#pedidos)
7. [Modelos de Datos](#modelos-de-datos)
8. [Códigos de Estado HTTP](#códigos-de-estado-http)
9. [Ejemplos de Uso con cURL](#ejemplos-de-uso-con-curl)

---

## Autenticación

Endpoints para gestionar usuarios y autenticación en el sistema.

### 1. Registrar Usuario

**POST** `/api/auth/register`

Crea un nuevo usuario en el sistema con contraseña hasheada usando BCrypt.

**Request Body:**
```json
{
  "username": "admin",
  "email": "admin@supermarket.com",
  "password": "admin123"
}
```

**Response:** `201 CREATED`
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@supermarket.com",
  "fechaCreacion": "2025-12-04T18:30:00"
}
```

**Validaciones:**
- `username` (requerido): String, mínimo 3 caracteres, único
- `email` (requerido): String, formato de email válido, único
- `password` (requerido): String, mínimo 6 caracteres
- La contraseña se hashea con BCrypt antes de guardarse
- **NUNCA** se retorna el passwordHash en las respuestas

**Errores:**
- `400 BAD REQUEST` - Datos inválidos (username muy corto, email inválido, password muy corto)
- `500 INTERNAL SERVER ERROR` - Username o email ya existe

---

### 2. Login

**POST** `/api/auth/login`

Valida las credenciales del usuario y retorna sus datos (sin contraseña).

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@supermarket.com",
  "fechaCreacion": "2025-12-04T18:30:00"
}
```

**Validaciones:**
- `username` (requerido): String
- `password` (requerido): String
- La contraseña se valida usando BCrypt.checkpw()
- Los mensajes de error son genéricos para prevenir enumeración de usuarios

**Errores:**
- `401 UNAUTHORIZED` - Credenciales inválidas (usuario no existe o contraseña incorrecta)
- `400 BAD REQUEST` - Username o password faltantes

**Notas de Seguridad:**
- Las contraseñas se hashean con BCrypt (salt automático)
- El sistema **NO** usa JWT tokens (validación simple por request)
- El sistema **NO** tiene roles (todos los usuarios tienen acceso igual)
- El mensaje de error es el mismo para usuario no encontrado o contraseña incorrecta ("Invalid username or password")
- El passwordHash **NUNCA** se expone en las respuestas REST

---

## Productos

Endpoints para gestionar el inventario de productos del supermercado.

### 1. Crear Producto

**POST** `/api/productos`

Crea un nuevo producto en el sistema.

**Request Body:**
```json
{
  "codigoBarra": 7790040465510,
  "nombre": "Leche Descremada La Serenísima 1L",
  "imagen": "https://example.com/images/leche.jpg",
  "minStock": 10,
  "maxStock": 100,
  "actualStock": 50
}
```

**Response:** `201 CREATED`
```json
{
  "codigoBarra": 7790040465510,
  "nombre": "Leche Descremada La Serenísima 1L",
  "imagen": "https://example.com/images/leche.jpg",
  "minStock": 10,
  "maxStock": 100,
  "actualStock": 50,
  "updateDate": null,
  "estadoId": null,
  "estadoNombre": null,
  "estadoDescripcion": null,
  "precios": null
}
```

**Validaciones:**
- `codigoBarra` (requerido): Integer, único
- `nombre` (requerido): String
- `minStock` (requerido): Integer >= 0
- `maxStock` (requerido): Integer > minStock
- `actualStock` (requerido): Integer >= 0
- `imagen` (opcional): String (URL)

---

### 2. Obtener Producto por Código de Barra

**GET** `/api/productos/{barCode}?history={true|false}`

Obtiene un producto específico por su código de barra, opcionalmente incluyendo el historial de precios.

**Path Parameters:**
- `barCode` (requerido): Integer - Código de barra del producto

**Query Parameters:**
- `history` (opcional): Boolean - Si es `true`, incluye el historial de precios. Default: `false`

**Ejemplo Request:**
```
GET /api/productos/7790040465510?history=true
```

**Response:** `200 OK`

**Sin historial de precios (`history=false`):**
```json
{
  "codigoBarra": 7790040465510,
  "nombre": "Leche Descremada La Serenísima 1L",
  "imagen": "https://example.com/images/leche.jpg",
  "minStock": 10,
  "maxStock": 100,
  "actualStock": 50,
  "updateDate": "2025-11-20T14:30:00",
  "estadoId": 1,
  "estadoNombre": "Disponible",
  "estadoDescripcion": "Producto disponible para la venta",
  "precios": null
}
```

**Con historial de precios (`history=true`):**
```json
{
  "codigoBarra": 7790040465510,
  "nombre": "Leche Descremada La Serenísima 1L",
  "imagen": "https://example.com/images/leche.jpg",
  "minStock": 10,
  "maxStock": 100,
  "actualStock": 50,
  "updateDate": "2025-11-20T14:30:00",
  "estadoId": 1,
  "estadoNombre": "Disponible",
  "estadoDescripcion": "Producto disponible para la venta",
  "precios": [
    {
      "codigoBarra": 7790040465510,
      "idProveedor": 1,
      "precio": 850.50,
      "fechaInicio": "2025-10-01T00:00:00",
      "fechaFin": "2025-10-31T23:59:59",
      "proveedorNombre": "Distribuidora Central",
      "productoNombre": "Leche Descremada La Serenísima 1L"
    },
    {
      "codigoBarra": 7790040465510,
      "idProveedor": 1,
      "precio": 920.00,
      "fechaInicio": "2025-11-01T00:00:00",
      "fechaFin": null,
      "proveedorNombre": "Distribuidora Central",
      "productoNombre": "Leche Descremada La Serenísima 1L"
    }
  ]
}
```

**Errores:**
- `404 NOT FOUND` - Producto no encontrado

---

### 3. Obtener Todos los Productos

**GET** `/api/productos`

Obtiene la lista completa de productos en el sistema.

**Response:** `200 OK`
```json
[
  {
    "codigoBarra": 7790040465510,
    "nombre": "Leche Descremada La Serenísima 1L",
    "imagen": "https://example.com/images/leche.jpg",
    "minStock": 10,
    "maxStock": 100,
    "actualStock": 50,
    "updateDate": "2025-11-20T14:30:00",
    "estadoId": 1,
    "estadoNombre": "Disponible",
    "estadoDescripcion": "Producto disponible para la venta",
    "precios": null
  },
  {
    "codigoBarra": 7790742008831,
    "nombre": "Arroz Gallo Oro 1kg",
    "imagen": "https://example.com/images/arroz.jpg",
    "minStock": 5,
    "maxStock": 50,
    "actualStock": 15,
    "updateDate": "2025-11-18T10:00:00",
    "estadoId": 1,
    "estadoNombre": "Disponible",
    "estadoDescripcion": "Producto disponible para la venta",
    "precios": null
  }
]
```

---

### 4. Actualizar Producto

**PUT** `/api/productos/{barCode}`

Actualiza un producto existente en el sistema.

**Path Parameters:**
- `barCode` (requerido): Integer - Código de barra del producto a actualizar

**Request Body:**
```json
{
  "nombre": "Leche Descremada La Serenísima 1L - Actualizado",
  "imagen": "https://example.com/images/leche_new.jpg",
  "minStock": 15,
  "maxStock": 150,
  "actualStock": 75
}
```

**Response:** `200 OK`
```json
{
  "codigoBarra": 7790040465510,
  "nombre": "Leche Descremada La Serenísima 1L - Actualizado",
  "imagen": "https://example.com/images/leche_new.jpg",
  "minStock": 15,
  "maxStock": 150,
  "actualStock": 75,
  "updateDate": null,
  "estadoId": null,
  "estadoNombre": null,
  "estadoDescripcion": null,
  "precios": null
}
```

**Validaciones:**
- `barCode` debe existir en el sistema
- `nombre` (requerido): String, no puede estar vacío
- `minStock` (requerido): Integer >= 0
- `maxStock` (requerido): Integer, debe ser mayor que minStock
- `actualStock` (requerido): Integer >= 0
- `imagen` (opcional): String (URL)

**Errores:**
- `404 NOT FOUND` - Producto no encontrado
- `400 BAD REQUEST` - Validación fallida (ej: minStock >= maxStock, nombre vacío)

---

### 5. Eliminar Producto

**DELETE** `/api/productos/{barCode}`

Elimina un producto del sistema por su código de barra.

**Path Parameters:**
- `barCode` (requerido): Integer - Código de barra del producto

**Ejemplo Request:**
```
DELETE /api/productos/7790040465510
```

**Response:** `204 NO CONTENT`

**Errores:**
- `404 NOT FOUND` - Producto no encontrado
- `500 INTERNAL SERVER ERROR` - Error al eliminar (ej: producto tiene relaciones)

---

### 6. Obtener Productos por Proveedor

**GET** `/api/productos/proveedor/{id}?history={true|false}`

Obtiene todos los productos asociados a un proveedor específico, opcionalmente incluyendo el historial de precios de cada producto.

**Path Parameters:**
- `id` (requerido): Integer - ID del proveedor

**Query Parameters:**
- `history` (opcional): Boolean - Si es `true`, incluye el historial de precios de cada producto. Default: `false`

**Ejemplo Request:**
```
GET /api/productos/proveedor/1?history=true
```

**Response:** `200 OK`

**Sin historial de precios (`history=false`):**
```json
[
  {
    "codigoBarra": 7790040465510,
    "nombre": "Leche Descremada La Serenísima 1L",
    "imagen": "https://example.com/images/leche.jpg",
    "minStock": 10,
    "maxStock": 100,
    "actualStock": 50,
    "updateDate": "2025-11-20T14:30:00",
    "estadoId": 1,
    "estadoNombre": "Disponible",
    "estadoDescripcion": "Producto disponible para la venta",
    "precios": null
  }
]
```

**Con historial de precios (`history=true`):**
```json
[
  {
    "codigoBarra": 7790040465510,
    "nombre": "Leche Descremada La Serenísima 1L",
    "imagen": "https://example.com/images/leche.jpg",
    "minStock": 10,
    "maxStock": 100,
    "actualStock": 50,
    "updateDate": "2025-11-20T14:30:00",
    "estadoId": 1,
    "estadoNombre": "Disponible",
    "estadoDescripcion": "Producto disponible para la venta",
    "precios": [
      {
        "codigoBarra": 7790040465510,
        "idProveedor": 1,
        "precio": 1500.0,
        "fechaInicio": "2025-11-20T10:00:00",
        "fechaFin": null,
        "proveedorNombre": "Distribuidora Norte S.A.",
        "productoNombre": "Leche Descremada La Serenísima 1L"
      },
      {
        "codigoBarra": 7790040465510,
        "idProveedor": 1,
        "precio": 1450.0,
        "fechaInicio": "2025-11-15T08:00:00",
        "fechaFin": "2025-11-20T10:00:00",
        "proveedorNombre": "Distribuidora Norte S.A.",
        "productoNombre": "Leche Descremada La Serenísima 1L"
      }
    ]
  }
]
```

**Errores:**
- `404 NOT FOUND` - Proveedor no encontrado o sin productos asociados

---

### 7. Asignar Producto a Proveedor

**POST** `/api/productos/{barCode}/proveedor/{idProveedor}`

Crea o actualiza la relación entre un producto interno y un producto del proveedor externo.

**Path Parameters:**
- `barCode` (requerido): Integer - Código de barra del producto interno
- `idProveedor` (requerido): Integer - ID del proveedor

**Request Body:**
```json
{
  "codigoBarraProveedor": 123456,
  "estado": 1
}
```

**Campos:**
- `codigoBarraProveedor` (requerido): Integer - Código de barra del producto en el sistema del proveedor
- `estado` (opcional): Integer - Estado del producto (1=Disponible, 2=Agotado, 3=Descontinuado). Default: 1

**Response:** `200 OK`
```json
{
  "idProveedor": 1,
  "codigoBarra": 7790040465510,
  "codigoBarraProveedor": 123456,
  "estado": 1,
  "fechaActualizacion": "2025-12-01T15:30:00",
  "productoNombre": "Leche Descremada La Serenísima 1L",
  "proveedorNombre": "Distribuidora Central"
}
```

**Validaciones:**
- Producto debe existir en el sistema
- Proveedor debe existir en el sistema
- Estado debe estar entre 1 y 3

**Errores:**
- `404 NOT FOUND` - Producto o proveedor no encontrado
- `400 BAD REQUEST` - Estado inválido o datos faltantes

**Nota:** Si la relación ya existe, se actualiza (UPSERT).

---

### 8. Desasignar Producto de Proveedor

**DELETE** `/api/productos/{barCode}/proveedor/{idProveedor}`

Elimina la relación entre un producto y un proveedor.

**Path Parameters:**
- `barCode` (requerido): Integer - Código de barra del producto
- `idProveedor` (requerido): Integer - ID del proveedor

**Ejemplo Request:**
```
DELETE /api/productos/7790040465510/proveedor/1
```

**Response:** `204 NO CONTENT`

**Errores:**
- `404 NOT FOUND` - Producto, proveedor o relación no encontrada
- `400 BAD REQUEST` - La relación no existe

---

## Proveedores

Endpoints para gestionar proveedores (suppliers) del supermercado.

### 1. Crear Proveedor

**POST** `/api/proveedores`

Crea un nuevo proveedor en el sistema.

**Request Body:**
```json
{
  "name": "Distribuidora Central S.A.",
  "apiEndpoint": "https://api.distribuidoracentral.com",
  "tipoServicio": 1,
  "clientId": "testclient",
  "apiKey": "mi-clave-secreta-123"
}
```

**Campo `tipoServicio`:**
- `1` = REST
- `2` = SOAP

**Campos de Autenticación:**
- `clientId` (requerido): String - Identificador del cliente en el API del proveedor
- `apiKey` (requerido): String - Clave secreta de autenticación
- El sistema validará la conexión con el proveedor antes de crear el registro (health check automático)

**Response:** `201 CREATED`
```json
{
  "id": 1,
  "name": "Distribuidora Central S.A.",
  "apiEndpoint": "https://api.distribuidoracentral.com",
  "tipoServicio": 1,
  "tipoServicioNombre": "REST",
  "clientId": "testclient",
  "apiKey": "mi-clave-secreta-123"
}
```

**Validaciones:**
- `name` (requerido): String - Nombre del proveedor
- `apiEndpoint` (requerido): String - URL válida del API del proveedor
- `tipoServicio` (requerido): Integer - 1 para REST, 2 para SOAP
- `clientId` (requerido): String - Identificador del cliente
- `apiKey` (requerido): String - Clave secreta de autenticación
- **Health Check:** El sistema valida automáticamente la conexión con el proveedor antes de crearlo
- **Escala Automática:** El sistema obtiene automáticamente la escala de calificación del proveedor y la guarda sin mapear (ver [Escalas de Calificación](#escalas-de-calificación))

**Flujo de Creación:**
1. Validar datos del proveedor
2. Health check con el proveedor (`GET {apiEndpoint}/api/health`)
3. Obtener escala de calificación del proveedor (`GET {apiEndpoint}/api/escala`)
4. Guardar proveedor en BD
5. Guardar escalas sin mapear (escalaInt = NULL) - El usuario las mapeará luego por frontend

**Posibles Errores:**
- `503 SERVICE UNAVAILABLE` - Health check falló, no se puede conectar al proveedor
- `400 BAD REQUEST` - Datos inválidos

**Notas:**
- Si falla la obtención de la escala, el proveedor se crea de todos modos
- Las escalas se pueden mapear posteriormente usando el endpoint `/api/escalas`

---

### 2. Obtener Proveedor por ID

**GET** `/api/proveedores/{id}`

Obtiene un proveedor específico por su ID.

**Path Parameters:**
- `id` (requerido): Integer - ID del proveedor

**Ejemplo Request:**
```
GET /api/proveedores/1a
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Distribuidora Central S.A.",
  "apiEndpoint": "https://api.distribuidoracentral.com",
  "tipoServicio": 1,
  "tipoServicioNombre": "REST",
  "clientId": "testclient",
  "apiKey": "mi-clave-secreta-123"
}
```

**Errores:**
- `404 NOT FOUND` - Proveedor no encontrado

---

### 3. Obtener Todos los Proveedores

**GET** `/api/proveedores`

Obtiene la lista completa de proveedores en el sistema.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Distribuidora Central S.A.",
    "apiEndpoint": "https://api.distribuidoracentral.com",
    "tipoServicio": 1,
    "tipoServicioNombre": "REST",
    "clientId": "testclient",
    "apiKey": "mi-clave-secreta-123"
  },
  {
    "id": 2,
    "name": "Proveedor SOAP Example",
    "apiEndpoint": "https://soap.provider.com/wsdl",
    "tipoServicio": 2,
    "tipoServicioNombre": "SOAP",
    "clientId": "soapclient",
    "apiKey": "soap_key_xyz"
  }
]
```

---

### 4. Eliminar Proveedor

**DELETE** `/api/proveedores/{id}`

Elimina un proveedor del sistema por su ID.

**Path Parameters:**
- `id` (requerido): Integer - ID del proveedor

**Ejemplo Request:**
```
DELETE /api/proveedores/1
```

**Response:** `204 NO CONTENT`

**Errores:**
- `404 NOT FOUND` - Proveedor no encontrado
- `500 INTERNAL SERVER ERROR` - Error al eliminar (ej: proveedor tiene pedidos asociados)

---

### 5. Obtener Rating de Proveedor

**GET** `/api/proveedores/{id}/rating`

Obtiene el rating promedio del proveedor basado en las evaluaciones de pedidos entregados.

**Path Parameters:**
- `id` (requerido): Integer - ID del proveedor

**Ejemplo Request:**
```
GET /api/proveedores/1/rating
```

**Response:** `200 OK`
```json
4.25
```

**Descripción:**
- Devuelve el rating promedio del proveedor como un número decimal (0.00 a 5.00)
- El rating se calcula automáticamente usando la escala interna (1-5) de todos los pedidos entregados y evaluados
- El valor se actualiza automáticamente cada vez que se evalúa un pedido entregado mediante un trigger de base de datos
- Retorna `null` si el proveedor no tiene evaluaciones aún

**Errores:**
- `404 NOT FOUND` - Proveedor no encontrado

**Notas Técnicas:**
- El rating se almacena en la columna `ratingPromedio` de la tabla `Proveedor`
- Se actualiza automáticamente mediante el trigger `trg_update_proveedor_rating`
- El trigger se ejecuta cada vez que se actualiza el campo `evaluacionEscala` de un pedido
- Solo considera pedidos en estado "Entregado" (estadoId = 4) con escalas mapeadas

---

### 6. Obtener Productos Disponibles del Proveedor

**GET** `/api/proveedores/{id}/productos-disponibles`

Obtiene la lista completa de productos disponibles en el catálogo del proveedor externo. Útil para seleccionar qué productos del proveedor se quieren asignar a productos internos.

**Path Parameters:**
- `id` (requerido): Integer - ID del proveedor

**Ejemplo Request:**
```
GET /api/proveedores/1/productos-disponibles
```

**Response:** `200 OK`
```json
[
  {
    "codigoBarra": 123456,
    "nombre": "Leche La Serenísima 1L - Proveedor",
    "imagen": "https://proveedor.com/images/leche.jpg",
    "minStock": 0,
    "maxStock": 0,
    "actualStock": 0,
    "precios": [
      {
        "precio": 1500.0
      }
    ]
  },
  {
    "codigoBarra": 789012,
    "nombre": "Arroz Gallo Oro 1kg - Proveedor",
    "imagen": "https://proveedor.com/images/arroz.jpg",
    "minStock": 0,
    "maxStock": 0,
    "actualStock": 0,
    "precios": [
      {
        "precio": 2200.0
      }
    ]
  }
]
```

**Errores:**
- `404 NOT FOUND` - Proveedor no encontrado
- `500 INTERNAL SERVER ERROR` - Error al conectar con el proveedor externo

**Uso:** Este endpoint consulta directamente el API del proveedor externo para obtener su catálogo completo. Los códigos de barra (`codigoBarra`) en la respuesta son los del proveedor, no los internos.

---

## Escalas de Calificación

Endpoints para gestionar el mapeo de escalas de calificación entre proveedores y el sistema interno.

**Concepto:** Cada proveedor puede usar su propia escala de calificación (ej: "Excelente", "Bueno", "Regular"). El sistema mantiene una escala interna unificada de 1-5 para poder comparar todos los proveedores. Los mappings permiten convertir entre ambas escalas.

**Flujo de Trabajo:**
1. Al crear un proveedor, se obtienen automáticamente sus valores de escala
2. Las escalas se guardan SIN mapear (escalaInt = NULL)
3. El usuario mapea desde el frontend cada valor externo a un valor interno (1-5)
4. Cuando se califica un pedido, se usa la escala interna y se puede enviar al proveedor en su escala

---

### 1. Obtener Escalas de un Proveedor

**GET** `/api/escalas/proveedor/{proveedorId}`

Obtiene todas las escalas de calificación de un proveedor (mapeadas y sin mapear).

**Path Parameters:**
- `proveedorId` (requerido): Integer - ID del proveedor

**Ejemplo Request:**
```
GET /api/escalas/proveedor/1
```

**Response:** `200 OK`
```json
[
  {
    "idEscala": 1,
    "idProveedor": 1,
    "escalaInt": 5,
    "escalaExt": "Excelente",
    "descripcionExt": "Servicio excepcional"
  },
  {
    "idEscala": 2,
    "idProveedor": 1,
    "escalaInt": 4,
    "escalaExt": "Muy Bueno",
    "descripcionExt": "Supera expectativas"
  },
  {
    "idEscala": 3,
    "idProveedor": 1,
    "escalaInt": null,
    "escalaExt": "Bueno",
    "descripcionExt": "Cumple expectativas"
  }
]
```

**Errores:**
- `404 NOT FOUND` - Proveedor no encontrado

---

### 2. Obtener Escalas Sin Mapear

**GET** `/api/escalas/proveedor/{proveedorId}/unmapped`

Obtiene solo las escalas que aún no han sido mapeadas a la escala interna (escalaInt = NULL).

**Path Parameters:**
- `proveedorId` (requerido): Integer - ID del proveedor

**Ejemplo Request:**
```
GET /api/escalas/proveedor/1/unmapped
```

**Response:** `200 OK`
```json
[
  {
    "idEscala": 3,
    "idProveedor": 1,
    "escalaInt": null,
    "escalaExt": "Bueno",
    "descripcionExt": "Cumple expectativas"
  },
  {
    "idEscala": 4,
    "idProveedor": 1,
    "escalaInt": null,
    "escalaExt": "Regular",
    "descripcionExt": "Servicio básico"
  }
]
```

**Uso:** Este endpoint es útil para mostrar al usuario qué escalas necesitan ser mapeadas.

---

### 3. Verificar Estado del Mapping

**GET** `/api/escalas/proveedor/{proveedorId}/status`

Verifica el estado del mapeo de escalas para un proveedor.

**Path Parameters:**
- `proveedorId` (requerido): Integer - ID del proveedor

**Ejemplo Request:**
```
GET /api/escalas/proveedor/1/status
```

**Response:** `200 OK`
```json
{
  "proveedorId": 1,
  "totalScales": 5,
  "mappedScales": 3,
  "unmappedScales": 2,
  "allMapped": false
}
```

**Campos de Respuesta:**
- `proveedorId`: ID del proveedor
- `totalScales`: Cantidad total de valores de escala
- `mappedScales`: Cantidad de valores ya mapeados
- `unmappedScales`: Cantidad de valores sin mapear
- `allMapped`: true si todas las escalas están mapeadas, false si no

---

### 4. Guardar Mappings de Escala

**POST** `/api/escalas`

Guarda múltiples mappings de escala desde el frontend. Permite actualizar los valores de escalaInt para varios registros.

**Request Body:**
```json
[
  {
    "idEscala": 1,
    "idProveedor": 1,
    "escalaInt": 5,
    "escalaExt": "Excelente",
    "descripcionExt": "Servicio excepcional"
  },
  {
    "idEscala": 2,
    "idProveedor": 1,
    "escalaInt": 4,
    "escalaExt": "Muy Bueno",
    "descripcionExt": "Supera expectativas"
  },
  {
    "idEscala": 3,
    "idProveedor": 1,
    "escalaInt": 3,
    "escalaExt": "Bueno",
    "descripcionExt": "Cumple expectativas"
  }
]
```

**Response:** `200 OK`
```json
[
  {
    "idEscala": 1,
    "idProveedor": 1,
    "escalaInt": 5,
    "escalaExt": "Excelente",
    "descripcionExt": "Servicio excepcional"
  },
  {
    "idEscala": 2,
    "idProveedor": 1,
    "escalaInt": 4,
    "escalaExt": "Muy Bueno",
    "descripcionExt": "Supera expectativas"
  },
  {
    "idEscala": 3,
    "idProveedor": 1,
    "escalaInt": 3,
    "escalaExt": "Bueno",
    "descripcionExt": "Cumple expectativas"
  }
]
```

**Validaciones:**
- `escalaInt` debe estar entre 1 y 5 (o NULL)
- Todos los registros deben pertenecer al mismo proveedor

**Errores:**
- `400 BAD REQUEST` - Valores de escalaInt fuera del rango 1-5
- `404 NOT FOUND` - Proveedor no encontrado

---

### 5. Actualizar Mapping Individual

**PUT** `/api/escalas/{id}`

Actualiza un mapping individual de escala.

**Path Parameters:**
- `id` (requerido): Integer - ID de la escala

**Request Body:**
```json
{
  "idProveedor": 1,
  "escalaInt": 5,
  "escalaExt": "Excelente",
  "descripcionExt": "Servicio excepcional"
}
```

**Response:** `200 OK`
```json
{
  "idEscala": 1,
  "idProveedor": 1,
  "escalaInt": 5,
  "escalaExt": "Excelente",
  "descripcionExt": "Servicio excepcional"
}
```

**Errores:**
- `400 BAD REQUEST` - Valor de escalaInt fuera del rango 1-5
- `404 NOT FOUND` - Escala no encontrada

---

### 6. Convertir Escala Interna a Externa

**GET** `/api/escalas/convert/{proveedorId}?escalaInt={valor}`

Convierte un valor de escala interna (1-5) al valor externo del proveedor.

**Path Parameters:**
- `proveedorId` (requerido): Integer - ID del proveedor

**Query Parameters:**
- `escalaInt` (requerido): Integer - Valor de escala interna (1-5)

**Ejemplo Request:**
```
GET /api/escalas/convert/1?escalaInt=5
```

**Response:** `200 OK`
```json
{
  "proveedorId": "1",
  "escalaInt": "5",
  "escalaExt": "Excelente"
}
```

**Uso:** Este endpoint es útil cuando se necesita enviar una calificación al proveedor en su escala nativa.

**Errores:**
- `400 BAD REQUEST` - Valor de escalaInt fuera del rango 1-5
- `404 NOT FOUND` - Proveedor o mapping no encontrado

---

## Integración con Proveedores

Endpoints para gestionar operaciones de integración con proveedores externos.

### 1. Test de Conexión (Health Check)

**POST** `/api/integracion/{proveedorId}/health`

Verifica la conexión con un proveedor ya registrado en el sistema.

**Path Parameters:**
- `proveedorId` (requerido): Integer - ID del proveedor

**Ejemplo Request:**
```
POST /api/integracion/1/health
```

**Response:** `200 OK`
```json
{
  "proveedorId": 1,
  "status": "OK",
  "healthy": true
}
```

**Response (Proveedor no disponible):** `503 SERVICE UNAVAILABLE`
```json
{
  "proveedorId": 1,
  "status": "KO",
  "healthy": false
}
```

**Errores:**
- `404 NOT FOUND` - Proveedor no encontrado
- `500 INTERNAL SERVER ERROR` - Error durante la validación

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:8080/api/integracion/1/health
```

---

### 2. Sincronizar Precios desde Proveedor

**POST** `/api/proveedores/{id}/sync`

Sincroniza los precios de productos desde un proveedor externo. Obtiene todos los productos disponibles del proveedor y actualiza los precios en el historial de precios solo para los productos asignados al proveedor en nuestro sistema.

**Path Parameters:**
- `id` (requerido): Integer - ID del proveedor

**Ejemplo Request:**
```
POST /api/proveedores/1/sync
```

**Response:** `200 OK`
```json
{
  "pricesCreated": 5,
  "pricesUpdated": 3,
  "errors": 0
}
```

**Descripción de Campos de Respuesta:**
- `pricesCreated`: Cantidad de nuevos registros de precio creados (primera vez que se obtiene precio de este producto-proveedor)
- `pricesUpdated`: Cantidad de precios actualizados (el precio cambió desde la última sincronización)
- `errors`: Cantidad de errores durante la sincronización

**Flujo de Sincronización:**
1. Obtiene todos los productos del proveedor vía API REST (`GET /api/productos`)
2. Filtra solo los productos asignados al proveedor en nuestra BD (tabla `ProductoProveedor`)
3. Por cada producto asignado:
    - Si el precio no existe: crea un nuevo registro en `HistorialPrecio` con `fechaFin = NULL`
    - Si el precio cambió: cierra el registro anterior (actualiza `fechaFin = NOW()`) y crea uno nuevo
    - Si el precio no cambió: no hace nada

**Requisitos Previos:**
1. El proveedor debe estar registrado con credenciales válidas (`clientId` y `apiKey`)
2. El proveedor debe estar disponible (health check exitoso)
3. Los productos deben estar creados en la tabla `Producto`
4. Los productos deben estar asignados al proveedor en la tabla `ProductoProveedor`

**Ejemplo de Setup Completo:**

```sql
-- 1. Crear productos en nuestra BD
INSERT INTO Producto (codigoBarra, nombre, imagen, stockMinimo, stockMaximo, stockActual) VALUES
                                                                                              (1, 'Leche Entera', 'https://placeholder.com/leche.jpg', 20, 200, 50),
                                                                                              (2, 'Queso Cheddar', 'https://placeholder.com/queso.jpg', 10, 100, 30);

-- 2. Asignar productos al proveedor
INSERT INTO ProductoProveedor (idProveedor, codigoBarra, estado, codigoBarraProveedor) VALUES
                                                                                           (1, 1, 1, 1),  -- Leche asignada a proveedor 1
                                                                                           (1, 2, 1, 2);  -- Queso asignado a proveedor 1

-- 3. Ahora puedes sincronizar precios
-- POST /api/proveedores/1/sync
```

**Errores:**
- `404 NOT FOUND` - Proveedor no encontrado
- `500 INTERNAL SERVER ERROR` - Error durante la sincronización

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:8080/api/proveedores/1/sync
```

**Notas Técnicas:**
- La sincronización es **transaccional**: si ocurre un error, se hace rollback de los cambios
- Solo se sincronizan productos **asignados al proveedor** en `ProductoProveedor`
- Los productos del proveedor que no existen en nuestra BD se reportan en `productNotFound` pero no causan error
- El historial de precios mantiene trazabilidad completa con `fechaInicio` y `fechaFin`
- Usa el stored procedure `sp_sync_precio_from_proveedor` para garantizar atomicidad

**Arquitectura:**
```
ProveedorController
  └─> ProveedorIntegrationService
      ├─> ProveedorIntegration (Port)
      │   └─> RestProveedorAdapter (convierte DTO → Domain)
      └─> HistorialPrecioRepository.syncPrecio()
          └─> sp_sync_precio_from_proveedor (Stored Procedure)
```

---

## Pedidos

Endpoints para gestionar órdenes de compra (pedidos) a proveedores.

### 1. Crear Pedido

**POST** `/api/pedidos`

Crea un nuevo pedido con los productos especificados.

**Request Body:**
```json
{
  "estadoId": 1,
  "proveedorId": 1,
  "fechaEstimada": "2025-12-01T10:00:00",
  "productos": [
    {
      "codigoBarra": 7790040465510,
      "cantidad": 50
    },
    {
      "codigoBarra": 7790742008831,
      "cantidad": 30
    }
  ]
}
```

**Campos opcionales:**
- `puntuacion`: Integer (1-5)
- `fechaEntrega`: String (ISO DateTime)
- `evaluacionEscala`: Integer

**Response:** `201 CREATED`
```json
{
  "id": 1,
  "estadoId": 1,
  "proveedorId": 1,
  "puntuacion": null,
  "fechaEstimada": "2025-12-01T10:00:00",
  "fechaEntrega": null,
  "evaluacionEscala": null,
  "fechaRegistro": "2025-11-26T15:30:45",
  "estadoNombre": "Pendiente",
  "estadoDescripcion": "Pedido pendiente de confirmación",
  "proveedorNombre": "Distribuidora Central S.A.",
  "productos": [
    {
      "idPedido": 1,
      "codigoBarra": 7790040465510,
      "cantidad": 50,
      "productoNombre": "Leche Descremada La Serenísima 1L",
      "productoImagen": "https://example.com/images/leche.jpg"
    },
    {
      "idPedido": 1,
      "codigoBarra": 7790742008831,
      "cantidad": 30,
      "productoNombre": "Arroz Gallo Oro 1kg",
      "productoImagen": "https://example.com/images/arroz.jpg"
    }
  ]
}
```

**Validaciones:**
- `estadoId` (requerido): Integer (1-5, ver Estados de Pedido)
- `proveedorId` (requerido): Integer (debe existir)
- `fechaEstimada` (requerido): String (ISO DateTime)
- `productos` (requerido): Array con al menos 1 producto
    - `codigoBarra` (requerido): Integer
    - `cantidad` (requerido): Integer > 0

**Estados de Pedido:**
1. Pendiente - Pendiente de confirmación
2. En Proceso - Confirmado y en preparación
3. Enviado - Despachado y en camino
4. Entregado - Recibido por el supermercado
5. Cancelado - Pedido cancelado

---

### 2. Actualizar Pedido

**PUT** `/api/pedidos/{id}`

Actualiza un pedido existente.

**Path Parameters:**
- `id` (requerido): Integer - ID del pedido

**Request Body:**
```json
{
  "estadoId": 3,
  "proveedorId": 1,
  "puntuacion": 5,
  "fechaEstimada": "2025-12-01T10:00:00",
  "fechaEntrega": "2025-11-30T16:30:00",
  "evaluacionEscala": 5,
  "productos": [
    {
      "codigoBarra": 7790040465510,
      "cantidad": 60
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "estadoId": 3,
  "proveedorId": 1,
  "puntuacion": 5,
  "fechaEstimada": "2025-12-01T10:00:00",
  "fechaEntrega": null,
  "evaluacionEscala": null,
  "fechaRegistro": "2025-11-26T15:30:45",
  "estadoNombre": "Enviado",
  "estadoDescripcion": "Pedido despachado y en camino al supermercado",
  "proveedorNombre": "Distribuidora Central S.A.",
  "productos": [
    {
      "idPedido": 1,
      "codigoBarra": 7790040465510,
      "cantidad": 60,
      "productoNombre": "Leche Descremada La Serenísima 1L",
      "productoImagen": "https://example.com/images/leche.jpg"
    }
  ]
}
```

**Errores:**
- `404 NOT FOUND` - Pedido no encontrado

---

### 3. Obtener Pedido por ID

**GET** `/api/pedidos/{id}`

Obtiene un pedido específico con todos sus productos.

**Path Parameters:**
- `id` (requerido): Integer - ID del pedido

**Ejemplo Request:**
```
GET /api/pedidos/1
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "estadoId": 1,
  "proveedorId": 1,
  "puntuacion": null,
  "fechaEstimada": "2025-12-01T10:00:00",
  "fechaEntrega": null,
  "evaluacionEscala": null,
  "fechaRegistro": "2025-11-26T15:30:45",
  "estadoNombre": "Pendiente",
  "estadoDescripcion": "Pedido pendiente de confirmación",
  "proveedorNombre": "Distribuidora Central S.A.",
  "productos": [
    {
      "idPedido": 1,
      "codigoBarra": 7790040465510,
      "cantidad": 50,
      "productoNombre": "Leche Descremada La Serenísima 1L",
      "productoImagen": "https://example.com/images/leche.jpg"
    }
  ]
}
```

**Errores:**
- `404 NOT FOUND` - Pedido no encontrado

---

### 4. Obtener Todos los Pedidos

**GET** `/api/pedidos`

Obtiene la lista completa de pedidos con sus productos.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "estadoId": 1,
    "proveedorId": 1,
    "puntuacion": null,
    "fechaEstimada": "2025-12-01T10:00:00",
    "fechaEntrega": null,
    "evaluacionEscala": null,
    "fechaRegistro": "2025-11-26T15:30:45",
    "estadoNombre": "Pendiente",
    "estadoDescripcion": "Pedido pendiente de confirmación",
    "proveedorNombre": "Distribuidora Central S.A.",
    "productos": [
      {
        "idPedido": 1,
        "codigoBarra": 7790040465510,
        "cantidad": 50,
        "productoNombre": "Leche Descremada La Serenísima 1L",
        "productoImagen": "https://example.com/images/leche.jpg"
      }
    ]
  },
  {
    "id": 2,
    "estadoId": 4,
    "proveedorId": 1,
    "puntuacion": 5,
    "fechaEstimada": "2025-11-25T10:00:00",
    "fechaEntrega": "2025-11-25T14:30:00",
    "evaluacionEscala": 5,
    "fechaRegistro": "2025-11-20T10:00:00",
    "estadoNombre": "Entregado",
    "estadoDescripcion": "Pedido entregado exitosamente",
    "proveedorNombre": "Distribuidora Central S.A.",
    "productos": [
      {
        "idPedido": 2,
        "codigoBarra": 7790742008831,
        "cantidad": 25,
        "productoNombre": "Arroz Gallo Oro 1kg",
        "productoImagen": "https://example.com/images/arroz.jpg"
      }
    ]
  }
]
```

---

### 5. Eliminar Pedido

**DELETE** `/api/pedidos/{id}`

Elimina un pedido del sistema.

**Path Parameters:**
- `id` (requerido): Integer - ID del pedido

**Ejemplo Request:**
```
DELETE /api/pedidos/1
```

**Response:** `204 NO CONTENT`

**Errores:**
- `404 NOT FOUND` - Pedido no encontrado

---

### 6. Obtener Pedidos por Proveedor

**GET** `/api/pedidos/proveedor/{proveedorId}`

Obtiene todos los pedidos asociados a un proveedor específico.

**Path Parameters:**
- `proveedorId` (requerido): Integer - ID del proveedor

**Ejemplo Request:**
```
GET /api/pedidos/proveedor/1
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "estadoId": 1,
    "proveedorId": 1,
    "puntuacion": null,
    "fechaEstimada": "2025-12-01T10:00:00",
    "fechaEntrega": null,
    "evaluacionEscala": null,
    "fechaRegistro": "2025-11-26T15:30:45",
    "estadoNombre": "Pendiente",
    "estadoDescripcion": "Pedido pendiente de confirmación",
    "proveedorNombre": "Distribuidora Central S.A.",
    "productos": [
      {
        "idPedido": 1,
        "codigoBarra": 7790040465510,
        "cantidad": 50,
        "productoNombre": "Leche Descremada La Serenísima 1L",
        "productoImagen": "https://example.com/images/leche.jpg"
      }
    ]
  }
]
```

**Errores:**
- `404 NOT FOUND` - Proveedor no encontrado o sin pedidos

---

### 7. Obtener Productos de un Pedido

**GET** `/api/pedidos/{id}/productos`

Obtiene solo la lista de productos de un pedido específico.

**Path Parameters:**
- `id` (requerido): Integer - ID del pedido

**Ejemplo Request:**
```
GET /api/pedidos/1/productos
```

**Response:** `200 OK`
```json
[
  {
    "idPedido": 1,
    "codigoBarra": 7790040465510,
    "cantidad": 50,
    "productoNombre": "Leche Descremada La Serenísima 1L",
    "productoImagen": "https://example.com/images/leche.jpg"
  },
  {
    "idPedido": 1,
    "codigoBarra": 7790742008831,
    "cantidad": 30,
    "productoNombre": "Arroz Gallo Oro 1kg",
    "productoImagen": "https://example.com/images/arroz.jpg"
  }
]
```

**Errores:**
- `404 NOT FOUND` - Pedido no encontrado

---

### 8. Cancelar Pedido con Proveedor

**POST** `/api/pedidos/{id}/cancelar`

Cancela un pedido con el proveedor externo y actualiza el estado del pedido a "Cancelado".

**Path Parameters:**
- `id` (requerido): Integer - ID del pedido a cancelar

**Ejemplo Request:**
```
POST /api/pedidos/123/cancelar
```

**Response:** `200 OK`
```json
{
  "id": 123,
  "estadoId": 5,
  "proveedorId": 1,
  "puntuacion": null,
  "fechaEstimada": "2025-12-01T10:00:00",
  "fechaEntrega": null,
  "evaluacionEscala": null,
  "fechaRegistro": "2025-11-26T15:30:45",
  "estadoNombre": "Cancelado",
  "estadoDescripcion": "Pedido cancelado",
  "proveedorNombre": "Distribuidora Central S.A.",
  "productos": [...]
}
```

**Validaciones:**
- El pedido debe existir
- El pedido **NO** debe estar en estado "Entregado" (estadoId = 4)
- El pedido **NO** debe estar ya "Cancelado" (estadoId = 5)
- El proveedor externo debe confirmar la cancelación

**Errores:**
- `404 NOT FOUND` - Pedido no encontrado
- `400 BAD REQUEST` - Pedido ya entregado, ya cancelado, o el proveedor no permitió la cancelación
- `500 INTERNAL SERVER ERROR` - Error al comunicarse con el proveedor

**Estados que NO permiten cancelación:**
- EstadoId = 4 (Entregado) - No se puede cancelar un pedido ya entregado
- EstadoId = 5 (Cancelado) - El pedido ya está cancelado

**Flujo de Cancelación:**
1. Se valida que el pedido existe y puede cancelarse
2. Se envía solicitud de cancelación al proveedor externo
3. Si el proveedor confirma, se actualiza el estado del pedido a "Cancelado" (estadoId = 5)
4. Se retorna el pedido con el estado actualizado

---

### 9. Puntuar Pedido Entregado

**POST** `/api/pedidos/{id}/rate`

Permite puntuar un pedido que ha sido entregado. La puntuación interna (1-5) se mapea a la escala del proveedor y se almacena en la base de datos.

**Path Parameters:**
- `id` (requerido): Integer - ID del pedido a puntuar

**Request Body:**
```json
{
  "rating": 4
}
```

**Campos:**
- `rating` (requerido): Integer - Puntuación interna del 1 al 5

**Ejemplo Request:**
```
POST /api/pedidos/123/rate
Content-Type: application/json

{
  "rating": 4
}
```

**Response:** `200 OK`
```json
{
  "id": 123,
  "estadoId": 4,
  "proveedorId": 1,
  "puntuacion": null,
  "fechaEstimada": "2025-11-25T10:00:00",
  "fechaEntrega": "2025-11-25T14:30:00",
  "evaluacionEscala": 15,
  "fechaRegistro": "2025-11-20T10:00:00",
  "estadoNombre": "Entregado",
  "estadoDescripcion": "Pedido entregado exitosamente",
  "proveedorNombre": "Distribuidora Central S.A.",
  "productos": [...]
}
```

**Validaciones:**
- El pedido debe existir
- El pedido **DEBE** estar en estado "Entregado" (estadoId = 4)
- La puntuación debe estar entre 1 y 5 (escala interna)
- Debe existir mapeo de escala para el proveedor

**Errores:**
- `404 NOT FOUND` - Pedido no encontrado
- `400 BAD REQUEST` - Rating es null o no está en el body
- `400 ILLEGAL ARGUMENT` - Puntuación fuera del rango 1-5
- `400 ILLEGAL STATE` - Pedido no está en estado "Entregado" (estadoId = 4)
- `404 ESCALA NOT FOUND` - No existe mapeo de escala para el proveedor y el rating proporcionado

**Flujo de Puntuación:**
1. Se valida que el rating esté entre 1 y 5
2. Se obtiene el pedido y se valida que exista
3. Se valida que el pedido esté en estado "Entregado" (estadoId = 4)
4. Se busca el mapeo de escala en la tabla `Escala` para el proveedor y el rating interno
5. Se actualiza el campo `evaluacionEscala` del pedido con el `idEscala` encontrado
6. Se retorna el pedido actualizado

**Ejemplo de Mapeo de Escala:**

Si el proveedor tiene la siguiente escala configurada:
```
idEscala | idProveedor | escalaInt | escalaExt | descripcionExt
---------|-------------|-----------|-----------|-------------------
15       | 1           | 4         | "2"       | "Bueno"
16       | 1           | 5         | "1"       | "Muy Satisfecho"
```

Cuando el usuario envía `rating: 4`, el sistema:
1. Busca el registro con `(idProveedor=1, escalaInt=4)`
2. Encuentra `idEscala=15` con valor externo `"2"` ("Bueno")
3. Actualiza el pedido con `evaluacionEscala=15`

**Notas:**
- El mapeo de escalas debe configurarse previamente usando los endpoints de Escalas
- Las escalas se obtienen automáticamente del proveedor al crearlo
- El usuario debe mapear cada valor externo del proveedor a la escala interna 1-5
- Si no existe mapeo para el rating proporcionado, se retorna error 404

---

### 10. Consultar Estado de Pedido desde Proveedor

**GET** `/api/pedidos/{id}/status`

Consulta el estado actual del pedido directamente desde el proveedor y sincroniza con la base de datos local.

**Path Parameters:**
- `id` (requerido): Integer - ID del pedido

**Ejemplo Request:**
```
GET /api/pedidos/123/status
```

**Response:** `200 OK`
```json
{
  "id": 123,
  "estadoId": 4,
  "proveedorId": 1,
  "puntuacion": null,
  "fechaEstimada": "2025-12-01T10:00:00",
  "fechaEntrega": null,
  "evaluacionEscala": null,
  "fechaRegistro": "2025-11-26T15:30:45",
  "estadoNombre": "En camino",
  "estadoDescripcion": null,
  "proveedorNombre": "Distribuidora Central S.A.",
  "productos": [...]
}
```

**Mapeo de Estados del Proveedor:**
```
Estado Proveedor    → Estado Interno (estadoId)
"Asignado"          → 2 (En Proceso)
"En Proceso"        → 2 (En Proceso)
"En camino"         → 3 (Enviado)
"Entregado"         → 4 (Entregado)
"Cancelado"         → 5 (Cancelado)
```

**Validaciones:**
- El pedido debe existir
- El proveedor debe estar disponible

**Errores:**
- `404 NOT FOUND` - Pedido no encontrado
- `500 INTERNAL SERVER ERROR` - Error al comunicarse con el proveedor

**Flujo de Sincronización:**
1. Se obtiene el pedido de la BD local
2. Se consulta el estado actual en el API del proveedor
3. Se mapea el estado del proveedor a nuestro sistema
4. Si el estado cambió, se actualiza en la BD local
5. Se retorna el pedido con el estado actualizado

**Notas:**
- Este endpoint es útil para sincronizar estados sin esperar notificaciones
- Se puede llamar periódicamente para mantener estados actualizados
- Solo actualiza el estado si hay cambios (optimización)

---

### 11. Generar Pedido Automático

**POST** `/api/pedidos/auto-generar`

Genera automáticamente un pedido único para todos los productos con stock bajo (actualStock ≤ stockMinimo). El sistema selecciona el proveedor con el mejor precio total y, en caso de empate, el de mayor rating.

**Lógica de Selección:**
1. Identifica todos los productos con stock bajo
2. Para cada proveedor, verifica que tenga TODOS los productos necesarios
3. Usa el endpoint de estimación del proveedor para calcular el precio total
4. Selecciona el proveedor con menor precio total
5. Si hay empate en precio, selecciona el de mayor rating
6. Crea UN SOLO pedido con todos los productos al proveedor ganador

**Cantidad por Producto:**
- Cantidad = `stockMaximo - stockActual` (llena hasta el máximo)

**Ejemplo Request:**
```
POST /api/pedidos/auto-generar
```

**Response:** `200 OK` - Pedido Creado Exitosamente
```json
{
  "exito": true,
  "mensaje": "Pedido automático creado exitosamente",
  "pedidoId": 42,
  "proveedorSeleccionado": "SuperCaracol",
  "productosOrdenados": 3,
  "costoTotal": 810.00,
  "ratingProveedor": 4.8
}
```

**Response:** `200 OK` - Sin Productos con Stock Bajo
```json
{
  "exito": true,
  "mensaje": "No hay productos con stock bajo",
  "pedidoId": null,
  "proveedorSeleccionado": null,
  "productosOrdenados": 0,
  "costoTotal": 0.0,
  "ratingProveedor": null
}
```

**Response:** `200 OK` - Sin Proveedores Disponibles
```json
{
  "exito": false,
  "mensaje": "Ningún proveedor tiene TODOS los productos necesarios",
  "pedidoId": null,
  "proveedorSeleccionado": null,
  "productosOrdenados": 0,
  "costoTotal": 0.0,
  "ratingProveedor": null
}
```

**Validaciones:**
- Un proveedor DEBE tener TODOS los productos necesarios para ser considerado
- Si un proveedor no tiene algún producto, se descarta completamente
- Solo se consideran productos con `estado = 1` (Disponible) en `ProductoProveedor`
- Se usa `codigoBarraProveedor` al enviar productos al proveedor

**Casos Edge:**
- **Rating NULL**: Se usa 0.0 por defecto para proveedores sin rating
- **Sin productos bajo stock**: Retorna respuesta exitosa sin crear pedido
- **Proveedor sin todos los productos**: Se descarta y se prueba el siguiente
- **Error en estimación**: Se descarta ese proveedor y se continúa con los demás

**Flujo Completo:**
1. Consulta productos con `actualStock <= stockMinimo` (SP: `sp_find_productos_bajo_stock`)
2. Obtiene todos los proveedores del sistema
3. Para cada proveedor:
   - Verifica que tenga TODOS los productos (SP: `sp_find_producto_proveedor`)
   - Obtiene el `codigoBarraProveedor` para cada producto
   - Llama al endpoint `/api/proveedor/estimarPedido` del proveedor
   - Guarda la estimación (precio total, rating)
4. Compara todas las estimaciones:
   - Ordena por precio total (ascendente)
   - En empate, ordena por rating (descendente)
5. Selecciona el ganador y crea el pedido usando `PedidoService.createPedido()`
6. Retorna el resultado

**Ejemplo de Flujo:**
```
Productos con stock bajo:
- Producto A: necesita 50 unidades (precio proveedor1=$10, proveedor2=$9)
- Producto B: necesita 30 unidades (precio proveedor1=$5, proveedor2 NO TIENE)
- Producto C: necesita 20 unidades (precio proveedor1=$8, proveedor2=$7)

Proveedor 1: Tiene A, B, C → Total = (50×$10)+(30×$5)+(20×$8) = $810 ✅
Proveedor 2: Tiene A, C, NO TIENE B → DESCARTADO ❌

Ganador: Proveedor 1 (único con todos los productos)
```

**Stored Procedures Usados:**
- `sp_find_productos_bajo_stock` - Encuentra productos con stock bajo
- `sp_find_producto_proveedor` - Verifica mapeo producto-proveedor
- `sp_save_pedido` - Guarda el pedido localmente (via `PedidoService`)

**Integración con Proveedores:**
- Usa `ProveedorIntegrationService.estimarPedidoWithProveedor()`
- Funciona con proveedores REST y SOAP (via `ProveedorIntegrationFactory`)
- Endpoint del proveedor: `POST /api/proveedor/estimarPedido`

**Notas:**
- Este endpoint está diseñado para trigger manual, pero puede integrarse con un scheduled task
- El pedido se crea automáticamente en estado "Pendiente" (estadoId=1)
- Se reutiliza la lógica existente de `PedidoService.createPedido()` para mantener consistencia
- El proveedor externo recibe los productos con su propio sistema de códigos de barra

---

## Modelos de Datos

### Usuario
```typescript
{
    id: number;                   // ID del usuario (autogenerado)
    username: string;             // Nombre de usuario (único)
    email: string;                // Email del usuario (único)
    fechaCreacion: string;        // Fecha de creación (ISO DateTime)
    // NOTA: passwordHash nunca se incluye en las respuestas REST
}
```

### Producto
```typescript
{
    codigoBarra: number;          // Código de barra (Primary Key)
    nombre: string;               // Nombre del producto
    imagen?: string;              // URL de la imagen (opcional)
    minStock: number;             // Stock mínimo
    maxStock: number;             // Stock máximo
    actualStock: number;          // Stock actual
    updateDate?: string;          // Fecha de última actualización (ISO DateTime)
    estadoId?: number;            // ID del estado (1=Disponible, 2=Agotado, 3=Descontinuado)
    estadoNombre?: string;        // Nombre del estado
    estadoDescripcion?: string;   // Descripción del estado
    precios?: HistorialPrecio[];  // Historial de precios (opcional)
}
```

### Proveedor
```typescript
{
    id?: number;                  // ID del proveedor (autogenerado)
    name: string;                 // Nombre del proveedor
    apiEndpoint: string;          // URL del API del proveedor
    tipoServicio: number;         // 1=REST, 2=SOAP
    tipoServicioNombre?: string;  // "REST" o "SOAP"
    clientId: string;             // Client ID para autenticación
    apiKey: string;               // API Key para autenticación
    ratingPromedio?: number;      // Rating promedio del proveedor (0.00 a 5.00, actualizado automáticamente)
}
```

### Pedido
```typescript
{
    id?: number;                     // ID del pedido (autogenerado)
    estadoId: number;                // ID del estado (1-5)
    proveedorId: number;             // ID del proveedor
    puntuacion?: number;             // Puntuación del pedido (1-5)
    fechaEstimada: string;           // Fecha estimada de entrega (ISO DateTime)
    fechaEntrega?: string;           // Fecha real de entrega (ISO DateTime)
    evaluacionEscala?: number;       // Evaluación del pedido
    fechaRegistro?: string;          // Fecha de registro (ISO DateTime, autogenerado)
    estadoNombre?: string;           // Nombre del estado
    estadoDescripcion?: string;      // Descripción del estado
    proveedorNombre?: string;        // Nombre del proveedor
    productos: PedidoProducto[];     // Array de productos del pedido
}
```

### PedidoProducto
```typescript
{
    idPedido?: number;            // ID del pedido
    codigoBarra: number;          // Código de barra del producto
    cantidad: number;             // Cantidad solicitada
    productoNombre?: string;      // Nombre del producto (enriquecido)
    productoImagen?: string;      // URL de imagen (enriquecido)
}
```

### HistorialPrecio
```typescript
{
    codigoBarra: number;          // Código de barra del producto
    idProveedor: number;          // ID del proveedor
    precio: number;               // Precio (float)
    fechaInicio: string;          // Fecha de inicio del precio (ISO DateTime)
    fechaFin?: string;            // Fecha de fin del precio (ISO DateTime, null si es precio actual)
    proveedorNombre?: string;     // Nombre del proveedor (enriquecido)
    productoNombre?: string;      // Nombre del producto (enriquecido)
}
```

---

## Códigos de Estado HTTP

### Códigos de Éxito
- **200 OK** - Solicitud exitosa, devuelve datos
- **201 CREATED** - Recurso creado exitosamente
- **204 NO CONTENT** - Operación exitosa sin contenido de respuesta (DELETE)

### Códigos de Error
- **400 BAD REQUEST** - Datos de entrada inválidos
- **404 NOT FOUND** - Recurso no encontrado
- **500 INTERNAL SERVER ERROR** - Error interno del servidor

### Formato de Error
```json
{
  "timestamp": "2025-11-26T15:45:30",
  "status": 404,
  "error": "Not Found",
  "message": "Producto con código de barra 999999 no encontrado",
  "path": "/api/productos/999999"
}
```

---

## Ejemplos de Uso con cURL

### Registrar un Usuario
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@supermarket.com",
    "password": "admin123"
  }'
```

### Login de Usuario
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Crear un Producto
```bash
curl -X POST http://localhost:8080/api/productos \
  -H "Content-Type: application/json" \
  -d '{
    "codigoBarra": 7790040465510,
    "nombre": "Leche Descremada La Serenísima 1L",
    "imagen": "https://example.com/images/leche.jpg",
    "minStock": 10,
    "maxStock": 100,
    "actualStock": 50
  }'
```

### Obtener Producto con Historial de Precios
```bash
curl -X GET "http://localhost:8080/api/productos/7790040465510?history=true"
```

### Crear un Proveedor
```bash
curl -X POST http://localhost:8080/api/proveedores \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Distribuidora Central S.A.",
    "apiEndpoint": "http://localhost:8081",
    "tipoServicio": 1,
    "clientId": "testclient",
    "apiKey": "mi-clave-secreta-123"
  }'
```

**Nota:** El sistema validará automáticamente la conexión con el proveedor antes de crearlo (health check).

### Crear un Pedido
```bash
curl -X POST http://localhost:8080/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "estadoId": 1,
    "proveedorId": 1,
    "fechaEstimada": "2025-12-01T10:00:00",
    "productos": [
      {
        "codigoBarra": 7790040465510,
        "cantidad": 50
      },
      {
        "codigoBarra": 7790742008831,
        "cantidad": 30
      }
    ]
  }'
```

### Actualizar Estado de Pedido
```bash
curl -X PUT http://localhost:8080/api/pedidos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "estadoId": 3,
    "proveedorId": 1,
    "fechaEstimada": "2025-12-01T10:00:00",
    "productos": [
      {
        "codigoBarra": 7790040465510,
        "cantidad": 50
      }
    ]
  }'
```

### Actualizar un Producto
```bash
curl -X PUT http://localhost:8080/api/productos/7790040465510 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Leche Descremada La Serenísima 1L - Actualizado",
    "imagen": "https://example.com/images/leche_new.jpg",
    "minStock": 15,
    "maxStock": 150,
    "actualStock": 75
  }'
```

### Eliminar un Producto
```bash
curl -X DELETE http://localhost:8080/api/productos/7790040465510
```

### Obtener Productos Disponibles del Proveedor
```bash
curl -X GET http://localhost:8080/api/proveedores/1/productos-disponibles
```

### Asignar Producto a Proveedor
```bash
curl -X POST http://localhost:8080/api/productos/7790040465510/proveedor/1 \
  -H "Content-Type: application/json" \
  -d '{
    "codigoBarraProveedor": 123456,
    "estado": 1
  }'
```

### Desasignar Producto de Proveedor
```bash
curl -X DELETE http://localhost:8080/api/productos/7790040465510/proveedor/1
```

### Obtener Todos los Pedidos de un Proveedor
```bash
curl -X GET http://localhost:8080/api/pedidos/proveedor/1
```

### Cancelar un Pedido
```bash
curl -X POST http://localhost:8080/api/pedidos/123/cancelar
```

---

## Notas Importantes para el Frontend

### 1. Configuración CORS
El backend debe tener CORS habilitado para aceptar peticiones desde `http://localhost:4200` (puerto default de Angular).

### 2. Formato de Fechas
- Todas las fechas usan formato **ISO 8601**: `YYYY-MM-DDTHH:mm:ss`
- Ejemplo: `2025-12-01T10:00:00`
- En Angular/TypeScript, usar `new Date().toISOString().slice(0, 19)` para crear fechas compatibles

### 3. Campos Opcionales
- Muchos campos son opcionales en las responses (marcados con `?` en TypeScript)
- Siempre verificar si existen antes de usar en el frontend
- Ejemplo: `producto.precios?.length` en lugar de `producto.precios.length`

### 4. Relaciones y Datos Enriquecidos
- Los endpoints de GET suelen devolver datos "enriquecidos" con nombres de relaciones
- Ejemplo: `Pedido` incluye `proveedorNombre` aunque solo almacena `proveedorId`
- Esto reduce la necesidad de múltiples peticiones HTTP

### 5. Validaciones del Backend
- El backend valida automáticamente:
    - Stock mínimo < Stock máximo
    - Cantidades positivas
    - Existencia de IDs relacionados (productos, proveedores)
- El frontend debe replicar estas validaciones para mejor UX

### 6. IDs Autogenerados
- Los campos `id` se generan automáticamente en el backend
- No enviar `id` en POST requests
- Solo incluir `id` en PUT/DELETE requests

---

## Resumen de Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| **AUTENTICACIÓN** | | |
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Login de usuario |
| **PRODUCTOS** | | |
| POST | `/api/productos` | Crear producto |
| GET | `/api/productos/{barCode}?history={bool}` | Obtener producto por código |
| GET | `/api/productos` | Obtener todos los productos |
| PUT | `/api/productos/{barCode}` | Actualizar producto |
| DELETE | `/api/productos/{barCode}` | Eliminar producto |
| GET | `/api/productos/proveedor/{id}` | Productos por proveedor |
| POST | `/api/productos/{barCode}/proveedor/{idProveedor}` | Asignar producto a proveedor |
| DELETE | `/api/productos/{barCode}/proveedor/{idProveedor}` | Desasignar producto de proveedor |
| **PROVEEDORES** | | |
| POST | `/api/proveedores` | Crear proveedor (con health check y fetch escala automático) |
| GET | `/api/proveedores/{id}` | Obtener proveedor por ID |
| GET | `/api/proveedores` | Obtener todos los proveedores |
| DELETE | `/api/proveedores/{id}` | Eliminar proveedor |
| GET | `/api/proveedores/{id}/rating` | Obtener rating promedio del proveedor |
| GET | `/api/proveedores/{id}/productos-disponibles` | Listar productos disponibles del proveedor externo |
| **ESCALAS** | | |
| GET | `/api/escalas/proveedor/{id}` | Ver todas las escalas de un proveedor |
| GET | `/api/escalas/proveedor/{id}/unmapped` | Ver escalas sin mapear |
| GET | `/api/escalas/proveedor/{id}/status` | Ver estado del mapping |
| POST | `/api/escalas` | Guardar múltiples mappings |
| PUT | `/api/escalas/{id}` | Actualizar mapping individual |
| GET | `/api/escalas/convert/{id}?escalaInt={n}` | Convertir interno a externo |
| **INTEGRACIÓN** | | |
| POST | `/api/integracion/{proveedorId}/health` | Test de conexión con proveedor |
| **PEDIDOS** | | |
| POST | `/api/pedidos` | Crear pedido |
| PUT | `/api/pedidos/{id}` | Actualizar pedido |
| GET | `/api/pedidos/{id}` | Obtener pedido por ID |
| GET | `/api/pedidos` | Obtener todos los pedidos |
| DELETE | `/api/pedidos/{id}` | Eliminar pedido |
| GET | `/api/pedidos/proveedor/{proveedorId}` | Pedidos por proveedor |
| GET | `/api/pedidos/{id}/productos` | Productos de un pedido |
| POST | `/api/pedidos/{id}/cancelar` | Cancelar pedido con proveedor |
| POST | `/api/pedidos/{id}/rate` | Puntuar pedido entregado |
| GET | `/api/pedidos/{id}/status` | Consultar estado desde proveedor |

**Total:** 33 endpoints disponibles

---

**Versión del Backend:** 1.0
**Framework:** Spring Boot 3.5.7
**Java Version:** 17
**Base de Datos:** Microsoft SQL Server

---

## Próximos Endpoints (En Desarrollo)

Los siguientes endpoints están planificados para futuras versiones de la integración con proveedores externos:

### Endpoints Implementados ✅
- `POST /api/integracion/{proveedorId}/health` - Test de conexión con proveedor

### Endpoints Planificados 🚧
- `POST /api/integracion/{proveedorId}/sync-productos` - Sincronizar productos desde proveedor
- `POST /api/integracion/{proveedorId}/sync-precios` - Sincronizar precios desde proveedor
- `POST /api/integracion/{proveedorId}/estimar` - Estimar pedido con proveedor
- `POST /api/integracion/{proveedorId}/confirmar/{pedidoId}` - Confirmar pedido con proveedor
- `GET /api/integracion/{proveedorId}/estado/{pedidoId}` - Consultar estado de pedido
- `DELETE /api/integracion/{proveedorId}/cancelar/{pedidoId}` - Cancelar pedido

Ver `specs/01-integration.md` para más detalles sobre la integración con proveedores.

---

## Cambios Recientes

### 2025-12-04 (Sistema de Autenticación - Login y Registro)
- ✅ **Sistema completo de autenticación implementado**
    - Login con username/password
    - Registro de nuevos usuarios
    - Contraseñas hasheadas con BCrypt (salt automático)
    - Sin JWT tokens (validación simple por request)
    - Sin roles (todos los usuarios tienen acceso igual)
- ✅ **2 nuevos endpoints de autenticación:**
    - `POST /api/auth/login` - Validar credenciales y retornar datos del usuario
    - `POST /api/auth/register` - Crear nuevo usuario con password hasheado
- ✅ **Arquitectura hexagonal completa:**
    - Domain: `Usuario` - Modelo de dominio con passwordHash
    - Port: `UsuarioRepository` - Interfaz del repositorio
    - Adapter Persistence: `UsuarioEntity`, `UsuarioRepositoryImpl` - Implementación con stored procedures
    - Service: `UsuarioService` - Lógica de negocio con BCrypt
    - Adapter REST: `AuthController` - Endpoints de autenticación
    - DTOs: `LoginRequest`, `RegisterRequest`, `UsuarioResponse` - Separación de capas
- ✅ **Stored procedures creados:**
    - `sp_save_usuario` - Crear usuario con validaciones de unicidad
    - `sp_find_usuario_by_username` - Buscar usuario por username
    - `sp_find_all_usuarios` - Listar todos los usuarios
- ✅ **Tabla Usuario en base de datos:**
    - Campos: id, username, email, passwordHash, fechaCreacion, fechaActualizacion
    - Constraints: username único (mínimo 3 caracteres), email único (formato válido)
    - Índices en username y email para búsquedas rápidas
- ✅ **Excepciones personalizadas:**
    - `InvalidCredentialsException` - Retorna 401 Unauthorized
    - `UsuarioNotFoundException` - Retorna 404 Not Found
    - Actualizado `GlobalExceptionHandler` con handlers para ambas excepciones
- ✅ **Seguridad implementada:**
    - BCrypt con salt automático (org.mindrot:jbcrypt:0.4)
    - Password mínimo 6 caracteres
    - PasswordHash nunca se expone en respuestas REST
    - Mensajes de error genéricos para prevenir enumeración de usuarios
    - Validación en service layer (IllegalArgumentException para datos inválidos)
- ✅ **DTOs para separación de capas:**
    - `LoginRequest` - Contiene username y password (plaintext)
    - `RegisterRequest` - Contiene username, email y password (plaintext)
    - `UsuarioResponse` - Contiene id, username, email, fechaCreacion (SIN passwordHash)
    - Método estático `UsuarioResponse.fromUsuario()` para conversión desde dominio
- ✅ **Ventajas de esta implementación:**
    - **Seguridad:** Contraseñas nunca almacenadas en texto plano
    - **Simplicidad:** Sin dependencias de Spring Security, código más simple
    - **Hexagonal:** Arquitectura consistente con el resto del proyecto
    - **Escalabilidad:** Fácil agregar JWT o roles en el futuro si se necesita

### 2025-12-04 (Frontend - Visualización de Rating de Proveedores)
- ✅ **Interface `IProveedor` actualizada**
    - Agregado campo opcional `ratingPromedio?: number`
    - Compatible con el modelo del backend que incluye el rating
- ✅ **Servicio `ProveedoresResource` extendido**
    - Nuevo endpoint `getRating()` - Obtiene el rating de un proveedor específico
    - Método: `GET /api/proveedores/{id}/rating`
    - Retorna: `number` (0.00 a 5.00 o null)
- ✅ **Componente `ProveedoresCardsComponent` mejorado**
    - Nuevo método `cargarRatingProveedor()` - Carga el rating de un proveedor
    - Se ejecuta automáticamente al cargar la lista de proveedores
    - Actualiza el campo `ratingPromedio` de cada proveedor en el array
    - Nuevo método `obtenerTextoRating()` - Formatea el rating para visualización
- ✅ **Template HTML actualizado**
    - Badge con estrella que muestra el rating numérico
    - Badge amarillo con estrella llena para proveedores con rating
    - Badge gris con estrella vacía para proveedores sin evaluaciones
    - Formato: `X.XX / 5.00` o `Sin evaluaciones`
    - Ubicado entre la información del proveedor y los botones de acción
- ✅ **Funcionalidad implementada:**
    - El rating se carga de forma asíncrona para cada proveedor
    - Se muestra visualmente en las cards de proveedores
    - Manejo de casos donde el proveedor no tiene evaluaciones (null)
    - Formato con 2 decimales para consistencia visual

### 2025-12-04 (Sistema de Rating de Proveedores)
- ✅ **Columna `ratingPromedio` agregada a tabla Proveedor**
    - Tipo: `DECIMAL(3,2)` - valores de 0.00 a 5.00
    - Se actualiza automáticamente mediante trigger de base de datos
    - Retorna `null` si el proveedor no tiene evaluaciones
- ✅ **Trigger automático de actualización implementado**
    - `trg_update_proveedor_rating` - Trigger en tabla `Pedido`
    - Se ejecuta AFTER UPDATE cuando se modifica `evaluacionEscala`
    - Recalcula el promedio de todas las evaluaciones del proveedor
    - Solo considera pedidos entregados (estado = 4) con escalas mapeadas
    - Actualiza `Proveedor.ratingPromedio` automáticamente
- ✅ **Endpoint de rating simplificado:**
    - `GET /api/proveedores/{id}/rating` - Obtener rating promedio
    - Devuelve directamente el valor `Double` del rating (no objeto complejo)
    - Ya no requiere stored procedure adicional ni cálculo en tiempo real
    - Acceso instantáneo: lectura directa de columna desnormalizada
- ✅ **Arquitectura optimizada:**
    - **Antes:** Cálculo en tiempo real con `sp_get_proveedor_rating` (JOIN + AVG en cada consulta)
    - **Ahora:** Valor pre-calculado y mantenido por trigger de BD
    - Mejor performance: O(1) vs O(n) donde n = número de pedidos evaluados
    - Consistencia garantizada por transacciones de BD
- ✅ **Stored procedures actualizados:**
    - `sp_find_all_providers` - Ahora devuelve `ratingPromedio`
    - `sp_find_provider_by_id` - Ahora devuelve `ratingPromedio`
    - `sp_save_provider` - Ahora devuelve `ratingPromedio`
    - Eliminado `sp_get_proveedor_rating` (ya no necesario)
- ✅ **Código Java simplificado:**
    - `Proveedor` domain: agregado campo `ratingPromedio`
    - `ProveedorEntity`: agregado campo `ratingPromedio`
    - `ProveedorRepositoryImpl.toDomain()`: mapea `ratingPromedio`
    - Eliminado método `ProveedorRepository.getRating()`
    - Eliminado método `ProveedorService.getProveedorRating()`
    - `ProveedorController.getProveedorRating()` simplificado: ahora solo retorna el campo directamente
- ✅ **Ventajas de esta implementación:**
    - **Performance:** Rating siempre disponible sin cálculos costosos
    - **Simplicidad:** Menos código Java, menos stored procedures
    - **Consistencia:** Trigger garantiza que el valor esté siempre actualizado
    - **Escalabilidad:** El cálculo se ejecuta solo cuando cambia una evaluación, no en cada consulta
    - **Uso futuro:** Facilita ordenar proveedores por rating, crear reportes, etc.

### 2025-12-03 (Puntuación de Pedidos con Integración al Proveedor)
- ✅ **Endpoint de puntuación de pedidos implementado**
    - `POST /api/pedidos/{id}/rate` - Puntuar pedido entregado
    - Convierte rating interno (1-5) a escala del proveedor usando mapeo
    - **NUEVO:** Envía automáticamente la evaluación al proveedor externo
    - Solo permite puntuar pedidos en estado "Entregado" (estadoId = 4)
- ✅ **Lógica de negocio implementada:**
    - `PedidoService.ratePedido()` - Método principal con validaciones
    - Valida que el rating esté entre 1 y 5
    - Valida que el pedido esté en estado entregado
    - Busca mapeo de escala usando `EscalaRepository.findByInternal()`
    - Actualiza evaluación usando `EscalaRepository.updatePedidoEvaluacion()`
    - **NUEVO:** Envía evaluación al proveedor usando `ProveedorIntegrationService.enviarEvaluacionToProveedor()`
- ✅ **Integración con proveedor externo:**
    - **Port:** `ProveedorIntegration.enviarEvaluacion()` - Interfaz del adaptador
    - **Adapter REST:** `RestProveedorAdapter.enviarEvaluacion()` - Implementación REST
    - **Adapter SOAP:** `SoapProveedorAdapter.enviarEvaluacion()` - Stub (no implementado aún)
    - **Service:** `ProveedorIntegrationService.enviarEvaluacionToProveedor()` - Orquestación
    - **Endpoint del proveedor:** `GET /api/proveedor/puntuarPedido?clientId={}&apikey={}&idPedido={}&puntuacion={}`
- ✅ **Flujo completo de evaluación:**
    1. Usuario califica pedido con escala interna (1-5)
    2. Sistema busca mapeo a escala externa del proveedor
    3. Sistema guarda evaluación en base de datos local
    4. Sistema envía evaluación al proveedor con escala externa convertida
    5. Sistema registra resultado del envío (éxito o fallo)
    6. **Nota:** La evaluación se guarda localmente aunque falle el envío al proveedor
- ✅ **Validaciones completas:**
    - Rating debe estar entre 1 y 5
    - Pedido debe existir
    - Pedido debe estar en estado "Entregado"
    - Debe existir mapeo de escala configurado para el proveedor
    - Provider credentials deben ser válidos para autenticación
- ✅ **Infraestructura existente utilizada:**
    - Stored procedure: `sp_update_pedido_evaluacion` (ya existía)
    - Tabla: `Escala` con mapeos entre escala interna y externa
    - Campo: `evaluacionEscala` en tabla `Pedido`
    - HTTP client: `Httpful` utility para llamadas REST al proveedor

### 2025-12-02 (Asignación de Productos a Proveedores)
- ✅ **Sistema completo de asignación producto-proveedor implementado**
    - Permite relacionar productos internos con productos de proveedores externos
    - El proveedor puede tener un código de barra diferente para el mismo producto
    - Gestiona el estado de disponibilidad del producto con cada proveedor
- ✅ **3 nuevos endpoints implementados:**
    - `POST /api/productos/{barCode}/proveedor/{idProveedor}` - Asignar producto a proveedor
    - `DELETE /api/productos/{barCode}/proveedor/{idProveedor}` - Desasignar producto de proveedor
    - `GET /api/proveedores/{id}/productos-disponibles` - Listar productos disponibles en proveedor
- ✅ **Arquitectura hexagonal completa:**
    - Domain: `ProductoProveedor` - Modelo de dominio para la relación
    - Port: `ProductoProveedorRepository` - Interfaz del puerto
    - Adapter: `ProductoProveedorRepositoryImpl` - Implementación del repositorio
    - Service: `ProductoProveedorService` - Lógica de negocio con validaciones
    - Integration: `ProveedorIntegrationService.getProductosDisponiblesFromProveedor()` - Consulta API externa
    - Controllers: Endpoints agregados en `ProductoController` y `ProveedorController`
- ✅ **Stored procedures:**
    - `sp_assign_product_to_provider` - UPSERT para asignar/actualizar relación
    - `sp_unassign_product_from_provider` - Eliminar relación con validaciones
- ✅ **Validaciones implementadas:**
    - Valida que el producto exista
    - Valida que el proveedor exista
    - Valida que el estado sea válido (1=Disponible, 2=Agotado, 3=Descontinuado)
    - Valida que la relación exista antes de eliminarla

### 2025-12-01 (Actualización de Productos)
- ✅ **Endpoint de actualización de productos implementado**
    - `PUT /api/productos/{barCode}` - Actualizar producto existente
    - Valida que el producto exista antes de actualizar
    - Valida que stockMinimo < stockMaximo
    - Actualiza todos los campos del producto (nombre, imagen, stocks)
- ✅ **Stored procedure creado:**
    - `sp_update_product` - Procedimiento específico para actualización
    - Incluye validaciones de integridad de datos
    - Retorna el producto actualizado
- ✅ **Arquitectura hexagonal completa:**
    - Port: `ProductoRepository.update()`
    - Adapter: `ProductoRepositoryImpl.update()`
    - Service: `ProductoService.updateProducto()`
    - Controller: `ProductoController.updateProduct()`

### 2025-11-29 (Sistema de Escalas de Calificación)
- ✅ **Sistema completo de escalas de calificación implementado**
    - Al crear un proveedor, se obtiene automáticamente su escala de calificación desde su API
    - Las escalas se guardan sin mapear (escalaInt = NULL) para que el usuario las configure
    - El usuario puede mapear cada valor externo del proveedor a la escala interna 1-5
    - Esto permite comparar todos los proveedores usando una escala unificada
- ✅ **6 nuevos endpoints de escalas:**
    - `GET /api/escalas/proveedor/{id}` - Ver todas las escalas
    - `GET /api/escalas/proveedor/{id}/unmapped` - Ver escalas sin mapear
    - `GET /api/escalas/proveedor/{id}/status` - Ver estado del mapping
    - `POST /api/escalas` - Guardar múltiples mappings
    - `PUT /api/escalas/{id}` - Actualizar mapping individual
    - `GET /api/escalas/convert/{id}?escalaInt={n}` - Convertir interno a externo
- ✅ **Domain models creados:**
    - `Escala` - Representa el mapeo entre escala externa e interna
    - `EscalaDefinicion` - DTO para valores de escala del proveedor
- ✅ **Servicios implementados:**
    - `EscalaService` - 6 métodos para gestión de mappings
    - `ProveedorService.createProveedor()` - Actualizado para fetch automático de escala
    - `ProveedorIntegrationService.fetchEscalaFromProveedor()` - Nuevo método
- ✅ **Stored procedures simplificados:**
    - Reducidos de 8 a 4 procedimientos esenciales
    - `sp_save_escala` - Permite escalaInt NULL para valores sin mapear
    - `sp_find_escalas_by_proveedor` - Listar todas las escalas
    - `sp_find_escala_by_internal` - Convertir interno a externo
    - `sp_update_pedido_evaluacion` - Calificar pedidos
- ✅ **Tabla Escala en base de datos:**
    - Mapeo entre valores externos del proveedor y escala interna 1-5
    - Constraint: escalaInt debe estar entre 1 y 5
    - Índices optimizados para búsquedas por proveedor y conversiones

### 2025-11-27 (Actualización 2)
- ✅ **Campo `clientId` separado:** El `clientId` ahora es un campo independiente en el modelo `Proveedor`
    - **Antes:** `apiKey` contenía formato `"clientId:apikey"`
    - **Ahora:** `clientId` y `apiKey` son campos separados
- ✅ **Endpoint de cancelación de pedidos:** Implementado `POST /api/pedidos/{id}/cancelar`
    - Cancela pedido con proveedor externo
    - Actualiza estado a "Cancelado" (estadoId = 5)
    - Valida que el pedido no esté entregado ni ya cancelado
- ✅ Actualizados stored procedures para manejar `clientId`
- ✅ Actualizados todos los adapters (REST/SOAP) para usar `clientId` separado

### 2025-11-27 (Actualización 1)
- ✅ Implementado health check automático al crear proveedores
- ✅ Agregado endpoint `POST /api/integracion/{proveedorId}/health`
- ✅ Refactorizado `ProveedorService` para usar `ProveedorIntegrationService`
- ✅ Agregado método `checkProveedorHealthDirect()` para validación pre-creación
