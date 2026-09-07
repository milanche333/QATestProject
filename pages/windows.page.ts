import { type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class WindowsPage extends BasePage {
  private readonly openWindowLink = this.page.getByRole('link', { name: 'Click Here', exact: true });

  constructor(page: Page) {
    super(page, '/windows', page.getByRole('heading', { name: /Opening a new window page/i, level: 1 }));
  }

  async openNewWindow(): Promise<Page> {
    const [popup] = await Promise.all([this.page.waitForEvent('popup'), this.openWindowLink.click()]);
    await popup.waitForLoadState('domcontentloaded');
    return popup;
  }
}
