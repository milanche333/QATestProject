import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class TablesPage extends BasePage {
  private readonly semanticTable = this.page.locator('#table2');

  constructor(page: Page) {
    super(page, '/tables', page.getByRole('heading', { name: /Data Tables page/i, level: 1 }));
  }

  rowByEmail(email: string): Locator {
    return this.semanticTable
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell', { name: email, exact: true }) });
  }
}
