import { expect, type Locator, type Page } from '@playwright/test';
import { type NotesAccount } from '../support/data';
import { baseURL } from '../support/environment';

export class NotesLoginPage {
  private readonly email: Locator;
  private readonly password: Locator;
  private readonly loginButton: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.email = page.getByLabel('Email address');
    this.password = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.error = page.getByRole('alert');
  }

  async open(): Promise<void> {
    await this.page.goto('/notes/app/login');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new URL('/notes/app/login', `${baseURL}/`).toString());
    await expect(this.page.getByRole('heading', { name: 'Login', exact: true })).toBeVisible();
  }

  async expectAnonymousHome(): Promise<void> {
    await expect(this.page).toHaveURL(new URL('/notes/app', `${baseURL}/`).toString());
    await expect(this.page.getByRole('heading', { name: 'Welcome to Notes App', exact: true })).toBeVisible();
  }

  async login(account: NotesAccount): Promise<void> {
    await this.email.fill(account.email);
    await this.password.fill(account.password);
    await this.loginButton.click();
  }
}
