export interface SitePage {
  name: string;
  path: string;
  title: string;
  heroTextContains: string;
}

export const homePageData: SitePage = {
  name: 'home',
  path: '/',
  title: 'Growth Partner | Marketing Digital',
  heroTextContains: 'crecimiento',
};

export const servicioPages: SitePage[] = [
  { name: 'estrategia-digital', path: '/servicios/estrategia-digital.html', title: 'Estrategia Digital | Growth Partner', heroTextContains: 'Estrategia Digital' },
  { name: 'estrategia-marca', path: '/servicios/estrategia-marca.html', title: 'Estrategia de Marca | Growth Partner', heroTextContains: 'Estrategia de Marca' },
  { name: 'produccion-contenido', path: '/servicios/produccion-contenido.html', title: 'Producción de Contenido | Growth Partner', heroTextContains: 'Producción de Contenido' },
  { name: 'publicidad', path: '/servicios/publicidad.html', title: 'Publicidad | Growth Partner', heroTextContains: 'Publicidad' },
  { name: 'redes-sociales', path: '/servicios/redes-sociales.html', title: 'Gestión de Redes Sociales | Growth Partner', heroTextContains: 'Gestión de Redes Sociales' },
];

export const allPages: SitePage[] = [homePageData, ...servicioPages];
