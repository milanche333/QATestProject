import { test, expect } from '../../support/fixtures';
import { WindowsPage } from '../../pages/windows.page';

test.describe('Browser navigation', () => {
  test('UI-10 | opens the destination in a new tab and preserves the original page', async ({ page }) => {
    const windows = new WindowsPage(page);
    await windows.open();
    await windows.expectLoaded();

    const popup = await test.step('Open the linked destination in a new tab', async () => {
      return windows.openNewWindow();
    });

    await test.step('Verify the destination URL, title and content', async () => {
      await expect(popup).toHaveURL(/\/windows\/new$/);
      await expect(popup).toHaveTitle('Example of a new window');
      await expect(popup.getByRole('heading', { level: 1 })).toHaveText(
        'Example of a new window page for Automation Testing Practice',
      );
    });

    await test.step('Close the new tab and verify the original page remains available', async () => {
      await popup.close();
      await windows.expectLoaded();
    });
  });
});
