import { type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  private readonly username = this.page.getByLabel('Username');
  private readonly password = this.page.getByLabel('Password');
  private readonly loginButton = this.page.getByRole('button', { name: 'Login' });
  readonly flash = this.page.locator('[role="alert"], #flash').first();
  readonly logoutButton = this.page.getByRole('link', { name: /logout/i });

  constructor(page: Page) {
    super(page, '/login', page.getByRole('heading', { name: /Test Login page/i, level: 1 }));
  }

  async login(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click({ timeout: 30_000 });
  }
}
