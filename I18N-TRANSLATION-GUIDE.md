# Guía de Traducción de Archivos XLIFF

## Resumen

Este documento explica cómo traducir las cadenas de texto en los archivos XLIFF generados por Angular i18n.

## Estructura de un Trans-Unit

Cada cadena a traducir se encuentra en un bloque `<trans-unit>`:

```xml
<trans-unit id="8742267133105991316" datatype="html">
  <source>Iniciar Sesión</source>
  <context-group purpose="location">
    <context context-type="sourcefile">src/app/pages/login/login.component.html</context>
    <context context-type="linenumber">9</context>
  </context-group>
  <note priority="1" from="description">Login title</note>
</trans-unit>
```

**Componentes:**
- `id`: Identificador único de la cadena
- `source`: Texto original en español
- `target`: Donde irá la traducción (debes agregarlo)
- `note`: Descripción para ayudarte a entender el contexto
- `context-group`: Dónde se usa esta cadena en el código

## Cómo Traducir a Inglés

Para traducir al inglés, necesitas agregar un elemento `<target>` después de `<source>`:

```xml
<trans-unit id="8742267133105991316" datatype="html">
  <source>Iniciar Sesión</source>
  <target>Sign In</target>
  <context-group purpose="location">
    <context context-type="sourcefile">src/app/pages/login/login.component.html</context>
    <context context-type="linenumber">9</context>
  </context-group>
  <note priority="1" from="description">Login title</note>
</trans-unit>
```

## Archivos a Traducir

- `src/locale/messages.es.xlf` - Español (archivo fuente, ya tiene el español)
- `src/locale/messages.en.xlf` - Inglés (necesita traducción)
- `src/locale/messages.xlf` - Fuente (generado automáticamente, no editar)

## Proceso de Traducción

### 1. Abrir el archivo `messages.en.xlf`

Este archivo contiene todas las cadenas en español que necesitan traducción al inglés.

### 2. Buscar cadenas sin `<target>`

Busca líneas que contengan `<source>` pero no tengan `<target>` debajo.

### 3. Agregar la traducción

Para cada `<source>` en inglés, agrega un `<target>` con la traducción:

```xml
<trans-unit id="9016536884183098576" datatype="html">
  <source>Usuario</source>
  <target>Username</target>
  ...
</trans-unit>
```

## Traducciones Comunes del Proyecto

| Español | Inglés |
|---------|--------|
| Iniciar Sesión | Sign In |
| Usuario | Username |
| Contraseña | Password |
| Ingresar | Login / Sign In |
| Cerrar Sesión | Logout |
| Productos | Products |
| Proveedores | Suppliers |
| Pedidos | Orders |
| Guardar | Save |
| Cancelar | Cancel |
| Eliminar | Delete |
| Editar | Edit |
| Nuevo | New |
| Generando... | Generating... |
| El usuario es requerido | Username is required |
| La contraseña es requerida | Password is required |
| El usuario debe tener al menos 3 caracteres | Username must be at least 3 characters |
| La contraseña debe tener al menos 6 caracteres | Password must be at least 6 characters |

## Tipos de Contenido

### Texto Simple
```xml
<trans-unit id="123" datatype="html">
  <source>Guardar</source>
  <target>Save</target>
</trans-unit>
```

### Texto con Interpolaciones
Las interpolaciones se marcan con `<x id="INTERPOLATION"/>`:

```xml
<trans-unit id="456" datatype="html">
  <source>Hola, <x id="INTERPOLATION"/></source>
  <target>Hello, <x id="INTERPOLATION"/></target>
</trans-unit>
```

**Importante:** Debes mantener los tags `<x>` exactamente como están.

### Texto con Elementos HTML
Los elementos HTML se marcan con tags especiales:

```xml
<trans-unit id="789" datatype="html">
  <source><x id="START_TAG_STRONG" ctype="x-strong" equiv-text="&lt;strong&gt;"/>Importante<x id="CLOSE_TAG_STRONG" ctype="x-strong" equiv-text="&lt;/strong&gt;"/></source>
  <target><x id="START_TAG_STRONG" ctype="x-strong" equiv-text="&lt;strong&gt;"/>Important<x id="CLOSE_TAG_STRONG" ctype="x-strong" equiv-text="&lt;/strong&gt;"/></target>
</trans-unit>
```

**Importante:** Mantén todos los tags `<x>` en el mismo orden.

## Validación

Después de traducir, puedes verificar que está bien formado:

1. El archivo XML debe ser válido
2. No debe haber `<source>` sin `<target>`
3. Los tags `<x>` deben estar en el mismo orden

## Herramientas Recomendadas

- **VS Code**: Extensión "XML Tools" para validar XML
- **Poedit**: Editor especializado en archivos de traducción
- **Notepad++**: Para edición rápida con validación XML

## Proceso de Trabajo

1. Abre `src/locale/messages.en.xlf`
2. Busca todas las secciones sin `<target>`
3. Agrega la traducción al inglés
4. Guarda el archivo
5. Ejecuta `npm start:en` para ver los cambios

## Actualizar Traducciones

Cuando agregas nuevos atributos `i18n` en los templates:

1. Ejecuta `npm run extract-i18n`
2. Los nuevos strings aparecerán en `messages.xlf`
3. Copia/actualiza `messages.es.xlf` y `messages.en.xlf`
4. Traduce las nuevas cadenas en `messages.en.xlf`

## Ejemplo Completo

**Archivo original (messages.xlf):**
```xml
<trans-unit id="1234567890" datatype="html">
  <source>Nuevo Proveedor</source>
  <context-group purpose="location">
    <context context-type="sourcefile">src/app/pages/proveedores-cards/proveedores-cards.component.html</context>
    <context context-type="linenumber">7</context>
  </context-group>
  <note priority="1" from="description">New supplier button text</note>
</trans-unit>
```

**Versión en inglés (messages.en.xlf):**
```xml
<trans-unit id="1234567890" datatype="html">
  <source>Nuevo Proveedor</source>
  <target>New Supplier</target>
  <context-group purpose="location">
    <context context-type="sourcefile">src/app/pages/proveedores-cards/proveedores-cards.component.html</context>
    <context context-type="linenumber">7</context>
  </context-group>
  <note priority="1" from="description">New supplier button text</note>
</trans-unit>
```

## Cambios de Idioma en Desarrollo

- **Español** (puerto 4200): `npm start:es` o `npm start`
- **Inglés** (puerto 4201): `npm start:en`

## Build para Producción

```bash
npm run build:i18n
```

Esto genera dos builds:
- `dist/supermarket-frontend/es/` - Versión en español (raíz `/`)
- `dist/supermarket-frontend/en/` - Versión en inglés (bajo `/en/`)
