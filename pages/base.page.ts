import { expect, type Locator, type Page } from '@playwright/test';
import { baseURL } from '../support/environment';

export abstract class BasePage {
  protected constructor(
    protected readonly page: Page,
    private readonly path: string,
    readonly heading: Locator,
  ) {}

  async open(): Promise<void> {
    await this.page.goto(this.path);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new URL(this.path, `${baseURL}/`).toString());
    await expect(this.heading).toBeVisible();
  }
}
