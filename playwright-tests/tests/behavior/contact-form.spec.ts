import { test, expect } from '../../fixtures/pages.fixture';
import { contactData } from '../../data/home.data';

test.describe('Contact form', () => {
  test('valid submission shows the success message and clears the fields', async ({ homePage, contactPage }) => {
    await homePage.goto();
    await expect(contactPage.successMessage).toBeHidden();

    await contactPage.fillForm(contactData.validMessage);
    await contactPage.submitButton.click();

    await expect(contactPage.successMessage).toBeVisible();
    await expect(contactPage.successMessage).toHaveText(contactData.successMessage);
    await expect(contactPage.nombreInput).toHaveValue('');
    await expect(contactPage.emailInput).toHaveValue('');
    await expect(contactPage.mensajeInput).toHaveValue('');
  });

  test('success message disappears after 4 seconds', async ({ page, homePage, contactPage }) => {
    await page.clock.install();
    await homePage.goto();

    await contactPage.fillForm(contactData.validMessage);
    await contactPage.submitButton.click();
    await expect(contactPage.successMessage).toBeVisible();

    await page.clock.fastForward(4000);
    await expect(contactPage.successMessage).toBeHidden();
  });

  test('empty submission is blocked by required fields', async ({ homePage, contactPage }) => {
    await homePage.goto();

    await contactPage.submitButton.click();

    await expect(contactPage.successMessage).toBeHidden();
    for (const input of [contactPage.nombreInput, contactPage.emailInput, contactPage.mensajeInput]) {
      expect(await input.evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
    }
  });

  test('invalid email is blocked', async ({ homePage, contactPage }) => {
    await homePage.goto();

    await contactPage.fillForm({ ...contactData.validMessage, email: 'no-es-un-correo' });
    await contactPage.submitButton.click();

    await expect(contactPage.successMessage).toBeHidden();
    expect(await contactPage.emailInput.evaluate((el: HTMLInputElement) => el.validity.typeMismatch)).toBe(true);
    await expect(contactPage.nombreInput).toHaveValue(contactData.validMessage.nombre);
  });

  test('shows contact details and a WhatsApp link that opens in a new tab', async ({ homePage, contactPage }) => {
    await homePage.goto();

    await expect(contactPage.contactList).toContainText(contactData.email);
    await expect(contactPage.contactList).toContainText(contactData.phone);
    await expect(contactPage.whatsappLink).toHaveAttribute('href', contactData.whatsappUrl);
    await expect(contactPage.whatsappLink).toHaveAttribute('target', '_blank');
    await expect(contactPage.whatsappLink).toHaveAttribute('rel', /noopener/);
  });
});
