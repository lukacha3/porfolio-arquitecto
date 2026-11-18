# Portfolio Arquitecto

Sitio web de portfolio en Astro — solo en sueco.

## Fase 1 

Base del proyecto: Astro + Tailwind v4 + fuentes autoalojadas (Hanken Grotesk y DM Mono) + layout + tokens del template.

## Fase 2 

Home estática portada del template: Header, AboutSection ("Om mig"), ProjectGrid (con filtro por categoría), StudioSection y Footer. Textos en sueco. Datos de ejemplo en `src/data/`.

## Fase 3 

Integración con Sanity CMS:
- Sanity Studio embebido en `/admin`.
- Esquema de datos en sueco (`project`, `category`, `siteSettings` singleton).
- Sección **"Om mig"** en `siteSettings` (`Webbplatsinställningar`):
  - `headline` ("Rubrik"): titular principal (`<h1>`) de la portada.
  - `aboutText` ("Om mig"): texto enriquecido Portable Text (párrafos, negrita, cursiva y enlaces) renderizado en el servidor mediante `src/lib/portableText.ts`.
  - `portrait` ("Porträtt"): foto de retrato con `hotspot: true` y validación de `alt` obligatorio cuando se sube imagen.
  - `tools` ("Verktyg"): lista cerrada y ordenable (drag & drop) de herramientas (`Revit`, `AutoCAD`, `Archicad`, `Lumion`, `Blender`), renderizadas con `src/components/ToolChip.astro` y `src/data/tools.ts` con iluminación en su color oficial de marca al pasar el cursor (`@media (hover: hover)`).
- Validaciones estrictas: `title` y `coverImage` obligatorios en proyectos.
- Generación automática de slugs adaptada a caracteres suecos (å, ä, ö).
- Ordenamiento manual de proyectos mediante **drag & drop** en Sanity Studio (`@sanity/orderable-document-list` con `orderRank` y proyectos nuevos ubicados al inicio `newItemPosition: 'before'`), reflejado en la portada, filtro por categorías y ciclo de "Nästa projekt".
- Cliente Sanity y helper `urlFor` en `src/lib/sanity.ts`.

## Fase 4 

Conexión de la home con datos reales de Sanity:
- Consultas GROQ optimizadas en `src/lib/queries.ts` para proyectos, categorías y `siteSettings`.
- Helper de imágenes responsivas en `src/lib/images.ts` con `srcset`, `width`/`height` y cálculo de punto de interés (`hotspot`).
- Eliminado `src/data/projects.ts` (todo el contenido de proyectos proviene ahora de Sanity).
- Filtrado dinámico por categorías reales de Sanity.
- Despliegue en GitHub Pages configurado con variables de entorno para Sanity.

> **Nota sobre compilación estática:** El contenido se lee desde Sanity **al compilar** (`npm run build`). Por ende, los cambios publicados en el panel aparecerán en el sitio publicado cuando se vuelva a compilar el proyecto (la reconstrucción automática con webhooks se implementará en la fase 8).

## Fase 5 

Página de proyecto con galería horizontal:
- Rutas dinámicas `/projekt/[slug]` generadas al compilar para cada proyecto publicado en Sanity.
- Estructura de la página de proyecto (alineada bajo un contenedor común `max-width: 1280px`):
  1. **Galería de fotos** arriba del todo, con contador (`Bild 1 av N`) y controles alineados a la derecha.
  2. **Bloque de dos columnas (Título + Descripción)**: columna izquierda con el título (`<h1>`), frase descriptiva opcional (`tagline` / *"Kort beskrivning"*, hasta 120 caracteres) y fila de metadatos (*Kategori*, *År*, *Fotograf*); columna derecha con los párrafos de descripción (`description`). Si no hay descripción, la columna izquierda ocupa todo el ancho sin dejar huecos.
  3. **Fila de datos técnicos / medidas opcional (`specs` / *"Fakta"*)**: grilla responsiva (`repeat(auto-fit, minmax(160px, 1fr))` en desktop y 2 columnas en mobile) de cajas ordenables (`Rubrik` + `Värde`, ej. *Planlösning / 1-plan*, *Boyta / 118,8 kvm*).
  4. **Planos (`Planritningar`)** con título `.section-title` y carrusel de planos (si existen).
  5. **"Nästa projekt"** al final con ciclo al primer proyecto y efecto "modo cine" dinámico.
- Componente de carrusel reutilizable (`src/components/Carousel.astro`), compartido entre la galería de fotos (`src/components/ProjectGallery.astro`) y la sección de planos (`src/components/ProjectPlans.astro`):
  - Inicialización independiente por instancia (`[data-carousel]`) sin IDs duplicados ni selectores globales, permitiendo múltiples carruseles autónomos en una misma página.
  - Proporciones naturales y soporte vertical universal: ancho dinámico proporcional calculado en base al aspect ratio real. Para imágenes horizontales la slide ocupa ~60vw (asomando ~1/4 de las vecinas); para imágenes verticales el contenedor se ajusta sin espacio vacío lateral, logrando que se aprecie la mitad (~50%) de la imagen vertical al asomarse.
  - Foco y nitidez total: sin difuminado/blur, manteniendo todas las imágenes 100% nítidas. La diapositiva activa resalta mediante opacidad completa (1.0) y escala natural, mientras las inactivas se atenúan suavemente (`opacity: 0.55`, `scale: 0.96`) con transiciones suaves (400ms).
  - Descripciones opcionales por imagen (`caption` / `Beskrivning`): tanto `coverImage` como cada foto de `gallery` y cada ítem de `plans` admiten una descripción opcional de hasta 200 caracteres debajo de la imagen (`<figcaption>`). En la galería de fotos, si ninguna foto tiene descripción no se reserva espacio extra debajo; si al menos una tiene, se reserva una fila inferior uniforme para evitar saltos de altura al cambiar de foto.
  - Centrado dinámico inteligente: cálculo de padding start/end automático en el track para garantizar que la primera y última diapositiva queden siempre perfectamente centradas sin importar si son horizontales o verticales.
  - Interactividad completa: navegación por botones prev/next, clic/tap en cualquier punto a la izquierda o derecha de la imagen activa (sobre la vecina o en el espacio vacío lateral) con cursores direccionales SVG personalizados y realce sutil al pasar el mouse (`@media (hover: hover)`), swipe/trackpad fluido (distinguiendo clic de arrastre a partir de 6 px) y navegación por teclado (flechas, Home, End, Enter/Espacio) aislada al carrusel con foco.
  - Progressive enhancement y accesibilidad: sin JS todas las imágenes y descripciones permanecen visibles y navegables mediante scroll horizontal nativo; respeta estrictamente `prefers-reduced-motion: reduce`. Si hay una sola imagen, se muestra centrada sin controles.
- Sección opcional de planos (`Planritningar`) en `src/components/ProjectPlans.astro`:
  - Configurable por proyecto desde Sanity (`hasPlans` / `Visa planritningar` y lista `plans` con descripción `caption` de hasta 200 caracteres y `alt`).
  - Se renderiza únicamente cuando `hasPlans === true` y existe al menos un plano válido, ubicada debajo de la galería de fotos y antes de "Nästa projekt".
  - Presentada en carrusel centrado independiente (`variant="plans"`), mostrando cada plano completo (`object-fit: contain`) con su `<figcaption>` debajo acompañando el desplazamiento (visible en el plano activo y oculto en los vecinos para evitar textos cortados, con altura mínima reservada para evitar saltos de layout).
- Metadatos de SEO y Open Graph (`og:title`, `og:description`, `og:image`) específicos por proyecto.
- Enlaces de las tarjetas de la home conectados a cada página de proyecto respetando el `base` de GitHub Pages.

## Fase 6 

Borradores y modo de previsualización:
- Modo preview estático accesible mediante `npm run dev:preview` y `npm run build:preview` (`--mode preview`).
- Lectura de borradores mediante cliente dedicado con perspectiva `previewDrafts` de Sanity y autenticación con `SANITY_API_READ_TOKEN`.
- El modo normal de producción (`npm run build` / `npm run dev`) sigue estricto con perspectiva `published` y no expone borradores ni requiere token.
- Barra fija de aviso "Förhandsvisning — utkast visas" y etiqueta `<meta name="robots" content="noindex, nofollow">` activadas exclusivamente en modo preview.
- Cero filtración del token: el token solo se ejecuta en Node.js al compilar y no se inyecta en el cliente ni en los archivos de salida `dist/`.

## Fase 7 

Pulido final de movimiento, accesibilidad (a11y), rendimiento y SEO:
- **Movimiento arquitectónico refinado**: Integración de Lenis para scroll suave y GSAP ScrollTrigger para transiciones y microinteracciones sutiles (fade-ins discretos en tarjetas y encabezados, transiciones tipográficas).
- **Aislamiento de Lenis**: Galería horizontal protegida con `data-lenis-prevent-horizontal` para permitir scroll vertical libre en toda la página mientras mantiene el desplazamiento horizontal nativo con trackpad y pantallas táctiles.
- **Exclusión en Admin**: GSAP y Lenis no se cargan en el panel de Sanity Studio (`/admin`), manteniendo su rendimiento intacto.
- **Accesibilidad y `prefers-reduced-motion`**:
  - Respeto total a las preferencias del usuario: con `prefers-reduced-motion: reduce`, Lenis y ScrollTrigger se desactivan instantáneamente y los estilos CSS eliminan transiciones y transformaciones.
  - Progressive enhancement: el contenido es 100% visible e interactivo si JavaScript está deshabilitado.
  - Skip-link accesible ("Hoppa till innehåll") enfocado en `#main` con indicador de foco visible (`--color-accent`).
  - Hovers y zooms de imágenes limitados a pantallas con cursor real (`@media (hover: hover)`) y con factor moderado (1.035) para evitar saltos en pantallas táctiles.
  - **Efecto "Modo cine" (Ambient Glow) en tarjetas de la portada (`src/components/ProjectCard.astro`)**: resplandor difuminado detrás de cada tarjeta de proyecto al pasar el cursor (`@media (hover: hover) and (pointer: fine)`) o hacer foco con teclado (`:focus-visible`), generado a partir de una miniatura ultraliviana del CDN de Sanity (`width(64).quality(50)`, `loading="lazy"`) con `filter: blur(48px) saturate(1.55)`, `transform: scale(1.09)` y `opacity: 0.72` (con transición de `450ms` y respetando `prefers-reduced-motion`).
- **SEO & Metadatos**:
  - Sitemap XML automático generado con `@astrojs/sitemap`, excluyendo `/admin` y deshabilitado en compilaciones de preview.
  - `robots.txt` que bloquea el indexado de `/admin/` y enlaza el sitemap con instrucciones en sueco.
  - Structured Data JSON-LD enriquecido: `ProfessionalService` en la portada y `VisualArtwork` en páginas de proyectos.
  - Etiquetas canónicas (`rel="canonical"`) dinámicas y etiquetas Open Graph / Twitter completas con imágenes reales de Sanity.
  - **Favicons adaptativos (`public/` y `scripts/generate-favicons.mjs`)**: `favicon.svg` limpio con soporte automático para pestañas claras/oscuras (`prefers-color-scheme: dark`), `favicon.ico` multiresolución (`16×16` y `32×32` con líneas reforzadas para legibilidad en tamaños chicos), `favicon-96x96.png` y `apple-touch-icon.png` (`180×180` con fondo sólido `--color-ground` y margen de ~12%), enlazados en `src/layouts/Layout.astro` respetando el `base` de GitHub Pages (`/porfolio-arquitecto/`).
- **Página 404 personalizada**: Página `404.astro` en sueco ("Sidan kunde inte hittas.") con navegación clara de retorno a la portada.
- **Barra de navegación superior fija (`src/components/Header.astro`)**:
  - Posicionada con `position: sticky; top: var(--preview-offset, 0px); z-index: 900` para permanecer siempre visible en todas las páginas públicas (home, proyectos y 404) sin superponerse con la barra de modo preview ni con el toast de copiado o el skip-link.
  - Detecta el desplazamiento mediante un `IntersectionObserver` sobre un elemento centinela superior (`[data-header-sentinel]`), compactando suavemente el padding vertical y añadiendo una línea inferior sutil, sombra y `backdrop-filter: blur(10px)` al hacer scroll (respetando `prefers-reduced-motion`).
  - **Desplazamiento suave por secciones (`src/scripts/motion.ts`)**: los enlaces `Projekt` (`#projekt`), `Studio` (`#studio`) y `Kontakt` (`#kontakt`) utilizan `lenis.scrollTo(target, { offset, duration, easing })` calculando dinámicamente la altura del header (y la barra de preview si aplica), actualizando la URL con `history.pushState` / `popstate`, posicionando el foco programático (`tabindex="-1"`, `focus({ preventScroll: true })`) al finalizar y soportando llegada con hash desde páginas internas (`/projekt/[slug]` o `404`). Con `prefers-reduced-motion: reduce` el salto es instantáneo respetando el offset, y sin JS actúa el fallback CSS `scroll-margin-top: var(--header-offset)`.
- **Contacto en Footer (`src/components/Footer.astro`) y Toast reutilizable (`src/components/Toast.astro`)**:
  - **Email con clic para copiar**: enlace `<a href="mailto:...">` con progressive enhancement (copia al portapapeles con `navigator.clipboard.writeText()` y fallback `execCommand('copy')` compatible con iOS Safari; si falla o no hay JS abre el cliente de correo). Incluye ícono de sobre, indicador visual de copiado en hover y muestra un toast accesible (`role="status"`, `aria-live="polite"`) con el texto *"E-postadressen har kopierats"*.
  - **Botón de LinkedIn**: ubicado debajo del email con logo oficial SVG inline (`fill="currentColor"`), texto `linkedin` en minúsculas (`--font-mono`) y línea inferior fina, iluminándose al hacer hover/focus en `#378FE9` (azul LinkedIn accesible para modo oscuro con contraste **5.15:1** WCAG AA sobre `--color-ink`).
- **Presupuesto de JavaScript**: El bundle total de scripts del cliente para páginas públicas pesa **~48.3 KB gzipped**, cumpliendo holgadamente el presupuesto límite de 60 KB gzipped.

### Acceso al Panel (Sanity Studio)

- **Local:** `http://localhost:4321/porfolio-arquitecto/admin`
- **Producción (GitHub Pages):** `https://lukacha3.github.io/porfolio-arquitecto/admin`

### Variables de Entorno

Crear un archivo `.env` en la raíz (ver `.env.example`):

```env
PUBLIC_SANITY_PROJECT_ID=tu_project_id_aqui
PUBLIC_SANITY_DATASET=production

# Token de lectura para modo preview (opcional para desarrollo normal)
SANITY_API_READ_TOKEN=tu_token_viewer_aqui

# Token de escritura para scripts de mantenimiento/inicialización (ej. scripts/init-order-rank.ts)
SANITY_API_WRITE_TOKEN=tu_token_editor_aqui
```

### Configuración del Token de Previsualización

1. En [sanity.io/manage](https://sanity.io/manage) → Seleccionar proyecto → pestaña **API** → **Tokens** → **Add API token**.
2. Nombre: `Preview (read)`, permiso: **Viewer**.
3. Copiar el token generado y guardarlo en `.env` como `SANITY_API_READ_TOKEN=...` (**sin prefijo PUBLIC_**).

### Inicialización y Ordenamiento de Proyectos (Drag & Drop)

Los proyectos se ordenan en Sanity Studio arrastrándolos directamente en la lista **Projekt**. Para inicializar el campo `orderRank` en proyectos existentes respetando el orden previo:

1. **Mediante script (`scripts/init-order-rank.ts`)**:
   - Simulacro sin escribir en Sanity: `npm run init:order:dry`
   - Ejecución real (requiere `SANITY_API_WRITE_TOKEN` con permiso **Editor** en `.env`): `npm run init:order`
2. **Desde Sanity Studio (`/admin`)**:
   - Abrir `/admin` → **Projekt** → menú de tres puntos (`⋯`) en la esquina superior derecha de la lista → **Reset Order**.

### Configuración de CORS en Sanity

En [sanity.io/manage](https://sanity.io/manage) → Seleccionar tu proyecto → pestaña **API** → **CORS origins**, agregar con "Allow credentials" activado:

1. `http://localhost:4321` (desarrollo local)
2. `https://lukacha3.github.io` (producción GitHub Pages)

## Comandos

```bash
npm install           # Instalar dependencias
npm run dev           # Iniciar servidor de desarrollo en modo normal (http://localhost:4321/porfolio-arquitecto/)
npm run dev:preview   # Iniciar servidor de desarrollo en modo preview con borradores
npm run build         # Compilar para producción (solo publicados)
npm run build:preview # Compilar en modo preview (con borradores)
npm run preview       # Previsualizar la compilación de producción
npm run init:order:dry # Previsualizar inicialización de orderRank sin modificar Sanity
npm run init:order    # Inicializar orderRank en proyectos existentes en Sanity
```
