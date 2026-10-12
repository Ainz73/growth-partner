export interface HomeCta {
  name: string;
  targetId: string;
}

export const homeCtas: HomeCta[] = [
  { name: 'Agenda tu cita', targetId: 'contacto' },
  { name: 'Ver servicios', targetId: 'servicios' },
  { name: 'Quiero empezar', targetId: 'contacto' },
  { name: 'Ver casos con resultados', targetId: 'servicios' },
];

export interface NavItem {
  name: string;
  targetId: string;
}

export const homeNavItems: NavItem[] = [
  { name: 'Inicio', targetId: 'inicio' },
  { name: 'Servicios', targetId: 'servicios' },
  { name: 'Nosotros', targetId: 'nosotros' },
  { name: 'Contáctanos', targetId: 'contacto' },
];

export interface ServiceCard {
  title: string;
  path: string;
}

export const serviceCards: ServiceCard[] = [
  { title: 'Branding e identidad visual', path: '/servicios/estrategia-marca.html' },
  { title: 'Estrategia de contenido', path: '/servicios/produccion-contenido.html' },
  { title: 'Creación de contenido', path: '/servicios/produccion-contenido.html' },
  { title: 'Gestión de redes sociales', path: '/servicios/redes-sociales.html' },
  { title: 'Publicidad online', path: '/servicios/publicidad.html' },
  { title: 'Plan de marketing digital', path: '/servicios/estrategia-digital.html' },
];

export const processSteps: string[] = [
  'Nos conocemos',
  'Armamos el plan',
  'Ejecutamos',
  'Revisamos juntos',
];

export const reviewAuthors: string[] = [
  'Puerto Azul Bolivia',
  'Trazitos Colors',
  "K'achamosas",
];

export const contactData = {
  email: 'growthpartner13@gmail.com',
  phone: '+591 67583824',
  whatsappUrl: 'https://wa.me/59167583824',
  successMessage: '¡Gracias! Te contactaremos muy pronto.',
  validMessage: {
    nombre: 'Ana Pérez',
    email: 'ana@ejemplo.com',
    mensaje: 'Quiero mejorar las redes de mi negocio.',
  },
};
