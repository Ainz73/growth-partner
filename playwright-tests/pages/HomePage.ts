import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly heroTitle = this.page.locator('h1.hero__title');
  readonly logo = this.header.locator('a.logo');
  readonly serviceCards = this.page.locator('#servicios a.card');
  readonly processSteps = this.page.locator('#nosotros .process__step');
  readonly reviewCards = this.page.locator('#resenias .review-card');

  constructor(page: Page) {
    super(page);
  }

  async goto(hash = '') {
    await super.goto(`/${hash}`);
  }

  section(id: string): Locator {
    return this.page.locator(`section#${id}`);
  }

  ctaLink(name: string): Locator {
    return this.page.locator('main').getByRole('link', { name, exact: true });
  }
}

export class ContactPage extends BasePage {
  readonly contactSection = this.page.locator('section#contacto');
  readonly contactForm = this.page.locator('#contact-form');
  readonly nombreInput = this.contactForm.locator('[name="nombre"]');
  readonly emailInput = this.contactForm.locator('[name="email"]');
  readonly mensajeInput = this.contactForm.locator('[name="mensaje"]');
  readonly submitButton = this.contactForm.getByRole('button', { name: 'Enviar mensaje' });
  readonly successMessage = this.page.locator('#form-success');
  readonly contactList = this.contactSection.locator('.contact__list');
  readonly whatsappLink = this.contactSection.getByRole('link', { name: 'WhatsApp' });

  async fillForm(data: { nombre: string; email: string; mensaje: string }) {
    await this.nombreInput.fill(data.nombre);
    await this.emailInput.fill(data.email);
    await this.mensajeInput.fill(data.mensaje);
  }
}
