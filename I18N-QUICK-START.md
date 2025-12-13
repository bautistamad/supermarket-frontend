# i18n - Quick Start Guide

## 🚀 Inicio Rápido

### Ejecutar la App

```bash
# Español (defecto, puerto 4200)
npm start

# Inglés (puerto 4201)
npm start:en
```

### Agregar una Nueva Traducción

1. **En el template HTML:**
```html
<h1 i18n="Button label">Mi Botón</h1>
```

2. **Extraer strings:**
```bash
npm run extract-i18n
```

3. **Editar archivos de traducción:**
   - `src/locale/messages.es.xlf` - Español
   - `src/locale/messages.en.xlf` - Inglés

4. **Probar:**
```bash
npm start:es    # Ver en español
npm start:en    # Ver en inglés
```

## 📁 Estructura

```
src/locale/
├── messages.xlf      ← NO EDITAR (se genera automáticamente)
├── messages.es.xlf   ← Editar para español
└── messages.en.xlf   ← Editar para inglés
```

## 🔧 Comandos Útiles

| Comando | Función |
|---------|---------|
| `npm start` | Servir en español (puerto 4200) |
| `npm start:es` | Servir en español (puerto 4200) |
| `npm start:en` | Servir en inglés (puerto 4201) |
| `npm run extract-i18n` | Extraer nuevas strings del código |
| `npm run build:i18n` | Build para producción (ambos idiomas) |
| `npm run build` | Build solo producción (español por defecto) |

## 📝 Sintaxis i18n

### Texto Simple
```html
<h1 i18n="Meaningful description">Hello World</h1>
```

### Con Interpolación
```html
<p i18n="Greeting message">Hola, {{ nombre }}</p>
```

### Atributo (placeholder, title, etc.)
```html
<input placeholder="Ingrese nombre" i18n-placeholder="Name placeholder">
```

### En Elementos con *ngIf
```html
<span *ngIf="condition" i18n="Label">Visible</span>
```

## 🗂️ Editar Traducciones XLIFF

### Estructura básica
```xml
<trans-unit id="1234567890" datatype="html">
  <source>Texto en español</source>
  <target>English text</target>
  <context-group purpose="location">
    <context context-type="sourcefile">src/...</context>
  </context-group>
  <note priority="1" from="description">Descripción</note>
</trans-unit>
```

### Cómo traducir

1. Abre `src/locale/messages.en.xlf`
2. Busca `<source>` sin `<target>`
3. Agrega `<target>` con la traducción:

```xml
<trans-unit id="...">
  <source>Nuevo Proveedor</source>
  <target>New Supplier</target>  ← Agregado
  ...
</trans-unit>
```

## ✅ Traducciones Comunes

| Español | Inglés |
|---------|--------|
| Iniciar Sesión | Sign In |
| Usuario | Username |
| Contraseña | Password |
| Guardar | Save |
| Cancelar | Cancel |
| Eliminar | Delete |
| Cerrar | Close |
| Cerrar Sesión | Logout |
| Productos | Products |
| Proveedores | Suppliers |
| Pedidos | Orders |

## 🐛 Problemas Comunes

### "Module not found: Error: Can't resolve '@popperjs/core'"
```bash
npm install @popperjs/core
```

### "Cannot mark an element as translatable inside of a translatable section"
No anides `i18n` dentro de elementos con `i18n`:
```html
<!-- ❌ Malo -->
<div i18n="Parent">
  <span i18n="Child">Texto</span>
</div>

<!-- ✅ Bien -->
<div i18n="Parent">Texto 1</div>
<span i18n="Child">Texto 2</span>
```

### Las traducciones no aparecen
1. Ejecuta `npm run extract-i18n`
2. Verifica que el archivo XLIFF tiene `<target>` (no vacío)
3. Reinicia el servidor: `npm start:en`

## 📚 Ver Más

- [Guía de Implementación](./I18N-IMPLEMENTATION-GUIDE.md)
- [Guía de Traducción](./I18N-TRANSLATION-GUIDE.md)
- [README Completo](./I18N-README.md)

## 🎯 Checklist para Nueva Característica

- [ ] Agregar atributos `i18n` en el template
- [ ] Ejecutar `npm run extract-i18n`
- [ ] Traducir en `messages.es.xlf` si es necesario
- [ ] Traducir en `messages.en.xlf`
- [ ] Probar con `npm start:es`
- [ ] Probar con `npm start:en`
- [ ] Verificar que no hay errores de compilación

---

**Tip**: Copia este archivo en tu área de trabajo para referencia rápida! 🚀
