# Guía del framework de tests (Playwright)

Guía práctica para entender y manejar manualmente la suite de `playwright-tests/`.
Todos los comandos se ejecutan **desde dentro de `playwright-tests/`**.

## 1. Cómo está armado

```
playwright-tests/
├── playwright.config.ts      # configuración: servidor, proyectos, reporter
├── data/pages.data.ts        # datos de las páginas (path, título, texto del hero)
├── pages/                    # Page Objects (locators + acciones)
│   ├── BasePage.ts           # header, nav, burger, footer, navLink(), footerLink()
│   ├── HomePage.ts           # + heroTitle, goto()
│   └── ServicioPage.ts       # + heroTitle de las páginas de servicios
├── fixtures/pages.fixture.ts # inyecta homePage / servicioPage en cada test
└── tests/
    ├── structure/            # título, secciones visibles, links, assets
    ├── responsive/           # menú burger en móvil
    └── visual/               # capturas contra baselines (*-snapshots/)
```

Flujo mental: **datos** (`data/`) → **Page Objects** (`pages/`) → **fixtures** → **specs** (`tests/`).
Un spec nunca escribe selectores CSS directamente; los pide al Page Object.

### Proyectos (se ejecutan automáticamente ambos)
- `desktop-chromium` — Desktop Chrome
- `mobile-chromium` — Pixel 7

Cada test corre dos veces, una por proyecto. Por eso `mobile-nav.spec.ts` usa
`test.skip(!isMobile, ...)`.

### Servidor
`webServer` en la config levanta `npx serve .. -l 4173` (sirve la raíz del repo)
y los tests usan `baseURL: http://localhost:4173`. No hace falta arrancar nada a mano.

## 2. Primera vez

```bash
cd playwright-tests
npm install
npx playwright install chromium
```

## 3. Ejecutar tests

| Qué quieres | Comando |
|---|---|
| Todo | `npx playwright test` |
| Una carpeta | `npx playwright test tests/structure` |
| Un archivo | `npx playwright test tests/structure/home.spec.ts` |
| Por nombre | `npx playwright test -g "burger"` |
| Solo un proyecto | `npx playwright test --project=mobile-chromium` |
| Ver el navegador | `npx playwright test --headed` |
| Un solo worker (más fácil de seguir) | `npx playwright test --workers=1` |
| Reporte HTML | `npx playwright show-report` |

## 4. Depurar manualmente

1. **UI Mode** (lo más cómodo): `npx playwright test --ui`
   Lista de tests, timeline, DOM en cada paso, re-ejecución al guardar.
2. **Debug paso a paso**: `npx playwright test tests/structure/home.spec.ts --debug`
   Abre el Inspector; avanzas acción por acción.
3. **Pausar en un punto**: pon `await page.pause();` dentro del test y ejecuta con `--headed`.
4. **Trace** (post-mortem): `npx playwright test --trace on` y luego
   `npx playwright show-trace test-results/<carpeta>/trace.zip`.
   Por defecto solo se graba en el primer reintento (`on-first-retry`, y reintentos solo en CI).
5. **Generar locators**: `npx playwright codegen http://localhost:4173`
   (con el servidor levantado: `npx serve .. -l 4173` en otra terminal).

## 5. Tests visuales

Baselines en `tests/visual/*-snapshots/` (`*-win32.png` local, `*-linux.png` CI).
Tolerancia: `maxDiffPixelRatio: 0.01`.

- Si falla por un cambio **no intencional**: abre el reporte (`show-report`), revisa
  las pestañas *Expected / Actual / Diff*.
- Si el cambio es **intencional**, actualiza los baselines y revisa el diff de git:
  ```bash
  npx playwright test tests/visual --update-snapshots
  git diff --stat
  ```
- `prepareForVisualSnapshot()` (en `BasePage`) congela las animaciones `.reveal` y el
  typewriter para que la captura sea determinista. Úsalo siempre antes de `toHaveScreenshot`.
- Los baselines de Linux (CI) se generan con Docker; ver `README.md`.

## 6. Cómo agregar tests (paso a paso)

### A. Una página nueva de servicio
1. Crea el HTML en `servicios/`.
2. Añade una entrada a `servicioPages` en `data/pages.data.ts`:
   ```ts
   { name: 'nuevo', path: '/servicios/nuevo.html', title: 'Nuevo | Growth Partner', heroTextContains: 'Nuevo' }
   ```
3. Los tests que iteran sobre `servicioPages` (navegación, estructura, visual) la cubren solos.
4. Genera su baseline: `npx playwright test tests/visual --update-snapshots`.

### B. Un test nuevo sobre una página existente
1. Si necesitas un elemento nuevo, agrégalo como `readonly` en el Page Object:
   ```ts
   // pages/HomePage.ts
   readonly ctaButton = this.page.getByRole('link', { name: 'Contáctanos' }).first();
   ```
2. Crea o edita un spec en `tests/<categoría>/`:
   ```ts
   import { test, expect } from '../../fixtures/pages.fixture';

   test('el CTA es visible', async ({ homePage }) => {
     await homePage.goto();
     await expect(homePage.ctaButton).toBeVisible();
   });
   ```
3. Ejecútalo solo: `npx playwright test -g "el CTA es visible" --headed`.
4. Revisa que pase en **ambos** proyectos; si es solo de móvil o escritorio, usa
   `test.skip(!isMobile, '...')` o `test.skip(isMobile, '...')`.

### C. Una página/Page Object nuevo
1. `pages/NuevaPage.ts` que `extends BasePage`.
2. Regístralo en `fixtures/pages.fixture.ts` (tipo `Fixtures` + `base.extend`).
3. Úsalo en el spec como parámetro: `async ({ nuevaPage }) => {...}`.

## 7. Buenas prácticas del proyecto

- Prefiere `getByRole` / `getByText` sobre CSS; usa CSS por id/clase solo cuando no hay rol claro.
- Usa aserciones **web-first** (`await expect(locator).toBeVisible()`), que reintentan solas.
  Evita `waitForTimeout`.
- Un test = un comportamiento. Datos repetidos van en `data/`, no copiados en cada spec.
- Mobile-first: cada cambio de UI debe verse verde en `mobile-chromium` también.

## 8. Problemas frecuentes

| Síntoma | Causa / solución |
|---|---|
| `port 4173 already in use` | Otro `serve` activo; en local se reutiliza (`reuseExistingServer`). Si es otro proceso, ciérralo. |
| Visual falla solo en CI | Faltan baselines `*-linux.png` (ver `README.md`, sección bootstrap). |
| Visual falla local tras cambiar CSS | Cambio intencional → `--update-snapshots` y revisar el diff. |
| Test pasa aislado pero falla en suite | Prueba `--workers=1`; busca estado compartido o animaciones sin esperar. |
| `Executable doesn't exist` | `npx playwright install chromium`. |

## 9. CI

`.github/workflows/playwright.yml` corre en push/PR a `master`: `npm ci` → instalar
chromium → `npx playwright test` → sube `playwright-report/` como artefacto (14 días).
En CI hay 2 reintentos y `forbidOnly` activo (un `test.only` olvidado rompe el build).

## 10. Rutina manual recomendada

```bash
cd playwright-tests
npx playwright test --ui                 # desarrollar/depurar
npx playwright test                      # suite completa antes de commitear
npx playwright show-report               # si algo falló
npx playwright test tests/visual --update-snapshots   # solo si el cambio visual es intencional
```
