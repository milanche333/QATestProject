import { test, expect } from '../../support/fixtures';
import { TablesPage } from '../../pages/tables.page';
import { UploadPage } from '../../pages/upload.page';

test.describe('Files and tabular data', () => {
  test('UI-08 | uploads a valid file and confirms its original filename', async ({ page }) => {
    const upload = new UploadPage(page);
    await upload.open();
    await upload.expectLoaded();

    const fileName = await test.step('Select and upload the text fixture', async () => {
      return upload.uploadFixture();
    });

    await test.step('Verify successful upload and the original filename', async () => {
      await expect(upload.uploadedFileHeading).toBeVisible();
      // The demo server prefixes the original name with a generated upload ID.
      await expect(upload.uploadedFileName).toContainText(fileName);
    });
  });

  test('UI-09 | finds a customer by email and validates the matching record', async ({ page }) => {
    const tables = new TablesPage(page);
    await tables.open();
    await tables.expectLoaded();

    await test.step('Locate exactly one customer using the email business key', async () => {
      const row = tables.rowByEmail('jdoe@hotmail.com');
      await expect(row).toHaveCount(1);
      await expect(row.getByRole('cell')).toHaveText([
        'Doe',
        'Jason',
        'jdoe@hotmail.com',
        '$100.00',
        'http://www.jdoe.com',
        /edit\s+delete/i,
      ]);
      await expect(row.getByRole('link', { name: 'Edit' })).toBeVisible();
      await expect(row.getByRole('link', { name: 'Delete' })).toBeVisible();
    });
  });
});
