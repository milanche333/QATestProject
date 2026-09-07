import path from 'node:path';
import { type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class UploadPage extends BasePage {
  private readonly fileInput = this.page.locator('input[type="file"]');
  private readonly uploadButton = this.page.getByRole('button', { name: 'Upload' });
  readonly uploadedFileHeading = this.page.getByRole('heading', { name: 'File Uploaded!', level: 1 });
  readonly uploadedFileName = this.page.locator('#uploaded-files');

  constructor(page: Page) {
    super(page, '/upload', page.getByRole('heading', { name: /File Uploader page/i, level: 1 }));
  }

  async uploadFixture(): Promise<string> {
    const fileName = 'upload.txt';
    await this.fileInput.setInputFiles(path.join(__dirname, '..', 'support', fileName));
    await this.uploadButton.click();
    return fileName;
  }
}
