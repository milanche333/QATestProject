import { type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class DynamicControlsPage extends BasePage {
  // This demo intentionally has no proper <label>; scope the stable input to its form.
  readonly checkbox = this.page.locator('#checkbox-example input[type="checkbox"]');
  private readonly checkboxAction = this.page.getByRole('button', { name: /^(Remove|Add)$/ });
  readonly input = this.page.locator('input[type="text"]');
  private readonly inputAction = this.page.getByRole('button', { name: /^(Enable|Disable)$/ });
  readonly messages = this.page.locator('#message');

  constructor(page: Page) {
    super(page, '/dynamic-controls', page.getByRole('heading', { name: 'Dynamic Controls', level: 1 }));
  }

  async removeCheckbox(): Promise<void> {
    await this.checkboxAction.click();
  }

  async addCheckbox(): Promise<void> {
    await this.checkboxAction.click();
  }

  async enableInput(): Promise<void> {
    await this.inputAction.click();
  }
}
