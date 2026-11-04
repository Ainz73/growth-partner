export interface SitePage {
  name: string;
  path: string;
  title: string;
  /** Meta description shown by Google and in link previews (WhatsApp, Facebook). */
  description: string;
  heroTextContains: string;
}

export const homePageData: SitePage = {
  name: 'home',
  path: '/',
  title: 'Growth Partner | Marketing Digital',
  description: 'Consultora de marketing digital: estrategia, marca, contenido, redes sociales y publicidad bajo una sola dirección, conectados a tus objetivos comerciales.',
  heroTextContains: 'crecimiento',
};

export const servicioPages: SitePage[] = [
  {
    name: 'estrategia-digital',
    path: '/servicios/estrategia-digital.html',
    title: 'Estrategia Digital | Growth Partner',
    description: 'Diseñamos el mapa completo de tu presencia digital: dónde estar, qué decir y cómo medirlo, para que cada acción sume a un mismo objetivo de negocio.',
    heroTextContains: 'Estrategia Digital',
  },
  {
    name: 'estrategia-marca',
    path: '/servicios/estrategia-marca.html',
    title: 'Estrategia de Marca | Growth Partner',
    description: 'Construimos una identidad clara y consistente, visual, verbal y emocional, para que tu marca sea reconocida y recordada en cada punto de contacto.',
    heroTextContains: 'Estrategia de Marca',
  },
  {
    name: 'produccion-contenido',
    path: '/servicios/produccion-contenido.html',
    title: 'Producción de Contenido | Growth Partner',
    description: 'Fotografía, video y diseño gráfico pensados para captar la atención en cada formato y convertir a tu audiencia en clientes.',
    heroTextContains: 'Producción de Contenido',
  },
  {
    name: 'publicidad',
    path: '/servicios/publicidad.html',
    title: 'Publicidad | Growth Partner',
    description: 'Campañas en Google y Meta Ads diseñadas con datos, creatividad y optimización constante para maximizar el retorno de tu inversión.',
    heroTextContains: 'Publicidad',
  },
  {
    name: 'redes-sociales',
    path: '/servicios/redes-sociales.html',
    title: 'Gestión de Redes Sociales | Growth Partner',
    description: 'Administramos tu comunidad y calendario de contenido con una estrategia clara para conectar con tu audiencia y fidelizar a tus clientes.',
    heroTextContains: 'Gestión de Redes Sociales',
  },
];

export const nosotrosPageData: SitePage = {
  name: 'nosotros',
  path: '/nosotros.html',
  title: 'Nosotros | Growth Partner',
  description: 'Somos una consultora de crecimiento digital que entiende primero, piensa después y ejecuta con propósito. Conoce al equipo detrás de Growth Partner.',
  heroTextContains: 'entender tu negocio',
};

export const allPages: SitePage[] = [homePageData, nosotrosPageData, ...servicioPages];

/** Header nav links, in order. Every page shares the same header. */
export const headerNavLinks = ['Inicio', 'Servicios', 'Nosotros', 'Contáctanos'];

/**
 * Public origin used in absolute share-preview URLs (og:image).
 * PLACEHOLDER until the domain is bought: replace it here and in every page's <head>.
 */
export const siteOrigin = 'https://growthpartner.example';
