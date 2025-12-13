# Guía de Implementación: Internacionalización (i18n) en Supermarket Frontend

## Resumen

Este documento explica cómo implementar soporte multiidioma (Español e Inglés) usando el sistema nativo de Angular i18n con archivos XLIFF, similar a cómo lo hace el proyecto `Parcial-Frontend`.

## 1. Instalación de Dependencias

Necesitas agregar `@angular/localize` al proyecto:

```bash
npm install @angular/localize
```

También necesitas instalar `xliffmerge` para facilitar la gestión de traducciones:

```bash
npm install -D @locl/cli
```

## 2. Configuración de `angular.json`

Actualizar la sección `i18n` en `angular.json`:

```json
{
  "projects": {
    "supermarket-frontend": {
      "i18n": {
        "locales": {
          "es": {
            "translation": "src/locale/messages.es.xlf",
            "baseHref": ""
          },
          "en": {
            "translation": "src/locale/messages.en.xlf",
            "baseHref": "/en/"
          }
        }
      },
      "architect": {
        "build": {
          "options": {
            // ... opciones existentes
          },
          "configurations": {
            "production": {
              // ... opciones existentes
            },
            "production-es": {
              "localize": ["es"],
              "outputPath": "dist/supermarket-frontend/es"
            },
            "production-en": {
              "localize": ["en"],
              "outputPath": "dist/supermarket-frontend/en"
            },
            "development-es": {
              "localize": ["es"],
              "buildOptimizer": false,
              "optimization": false,
              "vendorChunk": true,
              "extractLicenses": false,
              "sourceMap": true,
              "namedChunks": true,
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.development.ts"
                }
              ]
            },
            "development-en": {
              "localize": ["en"],
              "buildOptimizer": false,
              "optimization": false,
              "vendorChunk": true,
              "extractLicenses": false,
              "sourceMap": true,
              "namedChunks": true,
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.development.ts"
                }
              ]
            }
          }
        },
        "serve": {
          "configurations": {
            "development-es": {
              "browserTarget": "supermarket-frontend:build:development-es"
            },
            "development-en": {
              "browserTarget": "supermarket-frontend:build:development-en"
            }
          },
          "defaultConfiguration": "development-es"
        }
      }
    }
  }
}
```

## 3. Crear archivo `xliffmerge.json` (Opcional pero Recomendado)

En la raíz del proyecto:

```json
{
  "xliffmergeOptions": {
    "defaultLanguage": "es",
    "languages": ["es", "en"],
    "srcDir": "src/locale",
    "genDir": "src/locale"
  }
}
```

## 4. Actualizar `package.json` scripts

Agregar scripts para facilitar el proceso:

```json
{
  "scripts": {
    "ng": "ng",
    "extract-i18n": "ng extract-i18n --output-path=src/locale",
    "start": "ng serve --configuration=development-es",
    "start:es": "ng serve --configuration=development-es",
    "start:en": "ng serve --port 4201 --configuration=development-en",
    "build": "ng build",
    "build:i18n": "ng build --configuration=production-es && ng build --configuration=production-en",
    "watch": "ng build --watch --configuration development",
    "test": "ng test"
  }
}
```

## 5. Uso de i18n en Templates (HTML)

### Atributo `i18n` simple

Para traducir texto simple, agrega el atributo `i18n`:

```html
<h1 i18n>Productos</h1>
<p i18n>Este es un párrafo que será traducido</p>
<button i18n>Guardar</button>
```

### Con contexto y descripción

```html
<button i18n="@@saveButton" i18n="Save button|Save action">Guardar</button>
```

### Interpolaciones

```html
<p i18n>Hola, {{ userName }}</p>
<!-- O más específico -->
<p i18n="greeting|User greeting">Hola, {{ userName }}</p>
```

### Plurales

```html
<p i18n="products count">{count, plural, =1 {1 producto} other {{{ count }} productos}}</p>
```

### Selección de género

```html
<p i18n="gender selection">{gender, select, male {Él} female {Ella} other {Ellos}}</p>
```

## 6. Cómo Extraer Traducciones

Después de agregar atributos `i18n` en tus templates:

```bash
npm run extract-i18n
```

Esto crea `src/locale/messages.xlf` con todas las cadenas por traducir.

## 7. Traducir Archivos XLIFF

Copiar el archivo de origen para cada idioma:

```bash
cp src/locale/messages.xlf src/locale/messages.es.xlf
cp src/locale/messages.xlf src/locale/messages.en.xlf
```

Luego editar cada archivo para agregar las traducciones. Formato XLIFF:

```xml
<trans-unit id="greeting" datatype="html">
  <source>Hola</source>
  <target>Hello</target>
</trans-unit>
```

## 8. Servir en Diferentes Idiomas

### Desarrollo - Español (puerto 4200)
```bash
npm start
# o
npm run start:es
```

### Desarrollo - Inglés (puerto 4201)
```bash
npm run start:en
```

### Producción
```bash
npm run build:i18n
```

Esto genera:
- `dist/supermarket-frontend/es/` - Versión en español (raíz)
- `dist/supermarket-frontend/en/` - Versión en inglés (bajo `/en/`)

## 9. Estructura de Carpetas

```
src/
├── locale/
│   ├── messages.xlf          # Archivo source (generado automáticamente)
│   ├── messages.es.xlf       # Traducción al español
│   └── messages.en.xlf       # Traducción al inglés
├── app/
├── environments/
└── ...
```

## 10. Importante: En Componentes TypeScript

El atributo `i18n` solo funciona en **templates HTML**. Para traducciones dinámicas en TypeScript, deberías:

1. **Opción 1**: Usar `$localize` (función nativa de Angular)
   ```typescript
   const message = $localize`Hola, ${nombre}`;
   ```

2. **Opción 2**: Usar una librería como `ngx-translate` para traducciones dinámicas
   ```typescript
   this.translateService.get('key').subscribe(text => {
     // usar text traducido
   });
   ```

Para este proyecto, recomendamos mantener las traducciones en templates y evitar dinámicas en TypeScript.

## 11. Flujo de Trabajo Recomendado

1. **Desarrollo**: Editar templates con atributos `i18n`
2. **Extracción**: Ejecutar `npm run extract-i18n`
3. **Traducción**: Editar archivos `.es.xlf` y `.en.xlf`
4. **Testing**: Servir en ambos idiomas con `npm run start:es` y `npm run start:en`
5. **Build**: Ejecutar `npm run build:i18n` antes de producción

## 12. Diferencias con Parcial-Frontend

- **Parcial-Frontend** usa `xliffmerge` para merge automático
- **Este proyecto** puede funcionar sin él, pero lo hace más manual
- **Opcionalmente** puedes instalar y usar `xliffmerge` para automatizar

Para instalar xliffmerge:

```bash
npm install -D xliffmerge
```

Y crear `xliffmerge.json` en la raíz.

## Referencias

- [Angular i18n Documentation](https://angular.io/guide/i18n-common)
- [XLIFF Format](http://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html)

