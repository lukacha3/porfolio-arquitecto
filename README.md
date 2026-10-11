# Portfolio Arquitecto

Sitio web de portfolio en Astro — solo en sueco.

## Fase 1 

Base del proyecto: Astro + Tailwind v4 + fuentes autoalojadas (Hanken Grotesk y DM Mono) + layout + tokens del template.

## Fase 2 

Home estática portada del template: Header, Hero, ProjectGrid (con filtro por categoría), StudioSection y Footer. Textos en sueco. Datos de ejemplo en `src/data/`.

## Fase 3 

Integración con Sanity CMS:
- Sanity Studio embebido en `/admin`.
- Esquema de datos en sueco (`project`, `category`, `siteSettings` singleton).
- Validaciones estrictas: `title` y `coverImage` obligatorios en proyectos.
- Generación automática de slugs adaptada a caracteres suecos (å, ä, ö).
- Cliente Sanity y helper `urlFor` en `src/lib/sanity.ts`.

## Fase 4 

Conexión de la home con datos reales de Sanity:
- Consultas GROQ optimizadas en `src/lib/queries.ts` para proyectos, categorías y `siteSettings`.
- Helper de imágenes responsivas en `src/lib/images.ts` con `srcset`, `width`/`height` y cálculo de punto de interés (`hotspot`).
- Eliminado `src/data/projects.ts` (todo el contenido de proyectos proviene ahora de Sanity).
- Filtrado dinámico por categorías reales de Sanity.
- Despliegue en GitHub Pages configurado con variables de entorno para Sanity.

> **Nota sobre compilación estática:** El contenido se lee desde Sanity **al compilar** (`npm run build`). Por ende, los cambios publicados en el panel aparecerán en el sitio publicado cuando se vuelva a compilar el proyecto (la reconstrucción automática con webhooks se implementará en la fase 8).

### Acceso al Panel (Sanity Studio)

- **Local:** `http://localhost:4321/porfolio-arquitecto/admin`
- **Producción (GitHub Pages):** `https://lukacha3.github.io/porfolio-arquitecto/admin`

### Variables de Entorno

Crear un archivo `.env` en la raíz (ver `.env.example`):

```env
PUBLIC_SANITY_PROJECT_ID=tu_project_id_aqui
PUBLIC_SANITY_DATASET=production
```

### Configuración de CORS en Sanity

En [sanity.io/manage](https://sanity.io/manage) → Seleccionar tu proyecto → pestaña **API** → **CORS origins**, agregar con "Allow credentials" activado:

1. `http://localhost:4321` (desarrollo local)
2. `https://lukacha3.github.io` (producción GitHub Pages)

## Comandos

```bash
npm install      # Instalar dependencias
npm run dev      # Iniciar servidor de desarrollo (http://localhost:4321/porfolio-arquitecto/)
npm run build    # Compilar para producción
npm run preview  # Previsualizar la compilación de producción
```
