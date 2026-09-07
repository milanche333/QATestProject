import { test, expect } from '../../support/fixtures';
import { inputValues } from '../../support/data';
import { DynamicControlsPage } from '../../pages/dynamic-controls.page';
import { InputsPage } from '../../pages/inputs.page';

test.describe('Form and dynamic controls', () => {
  test('UI-06 | displays submitted input values and clears the form', async ({ page }) => {
    const inputs = new InputsPage(page);
    await inputs.open();
    await inputs.expectLoaded();

    await test.step('Enter and verify input values', async () => {
      await inputs.enterValues(inputValues);
      await expect(inputs.inputs.number).toHaveValue(inputValues.number);
      await expect(inputs.inputs.text).toHaveValue(inputValues.text);
      await expect(inputs.inputs.password).toHaveValue(inputValues.password);
      await expect(inputs.inputs.password).toHaveAttribute('type', 'password');
      await expect(inputs.inputs.date).toHaveValue(inputValues.date);
    });

    await test.step('Display and verify output values', async () => {
      await inputs.displayValues();
      await expect(inputs.outputs.number).toHaveText(inputValues.number);
      await expect(inputs.outputs.text).toHaveText(inputValues.text);
      await expect(inputs.outputs.password).toHaveText(inputValues.password);
      await expect(inputs.outputs.date).toHaveText(inputValues.date);
    });

    await test.step('Clear and verify all fields and outputs', async () => {
      await inputs.clearValues();
      for (const locator of Object.values(inputs.inputs)) await expect(locator).toHaveValue('');
      for (const locator of Object.values(inputs.outputs)) await expect(locator).toHaveCount(0);
    });
  });

  test('UI-07 | waits for asynchronous remove, add and enable operations', async ({ page }) => {
    const controls = new DynamicControlsPage(page);
    await controls.open();
    await controls.expectLoaded();
    await expect(controls.checkbox).toBeVisible();

    await test.step('Remove the checkbox and wait for confirmation', async () => {
      await controls.removeCheckbox();
      await expect(controls.checkbox).toHaveCount(0);
      await expect(controls.messages).toContainText("It's gone!");
    });

    await test.step('Restore the checkbox and verify it can be selected', async () => {
      await controls.addCheckbox();
      await expect(controls.checkbox).toBeVisible();
      await expect(controls.messages).toContainText("It's back!");
      await controls.checkbox.check();
      await expect(controls.checkbox).toBeChecked();
    });

    await test.step('Enable the disabled input and verify it accepts text', async () => {
      await expect(controls.input).toBeDisabled();
      await controls.enableInput();
      await expect(controls.input).toBeEnabled();
      await expect(controls.messages).toContainText("It's enabled!");
      await controls.input.fill('Ready for input');
      await expect(controls.input).toHaveValue('Ready for input');
    });
  });
});
