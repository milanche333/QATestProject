import { type Page } from '@playwright/test';
import { BasePage } from './base.page';

export interface InputValues {
  number: string;
  text: string;
  password: string;
  date: string;
}

export class InputsPage extends BasePage {
  private readonly numberInput = this.page.getByLabel('Input: Number');
  private readonly textInput = this.page.getByLabel('Input: Text');
  private readonly passwordInput = this.page.getByLabel('Input: Password');
  private readonly dateInput = this.page.getByLabel('Input: Date');
  private readonly displayButton = this.page.getByRole('button', { name: 'Display Inputs' });
  private readonly clearButton = this.page.getByRole('button', { name: 'Clear Inputs' });
  readonly inputs = {
    number: this.numberInput,
    text: this.textInput,
    password: this.passwordInput,
    date: this.dateInput,
  };
  readonly outputs = {
    number: this.page.locator('#output-number'),
    text: this.page.locator('#output-text'),
    password: this.page.locator('#output-password'),
    date: this.page.locator('#output-date'),
  };

  constructor(page: Page) {
    super(page, '/inputs', page.getByRole('heading', { name: /Web inputs page/i, level: 1 }));
  }

  async enterValues(values: InputValues): Promise<void> {
    await this.numberInput.fill(values.number);
    await this.textInput.fill(values.text);
    await this.passwordInput.fill(values.password);
    await this.dateInput.fill(values.date);
  }

  async displayValues(): Promise<void> {
    await this.displayButton.click();
  }

  async clearValues(): Promise<void> {
    await this.clearButton.click();
  }
}
