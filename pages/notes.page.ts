import { expect, type Locator, type Page } from '@playwright/test';
import { type NoteData } from '../support/data';
import { baseURL } from '../support/environment';

export class NotesPage {
  private readonly addNoteButton: Locator;

  constructor(private readonly page: Page) {
    this.addNoteButton = page.getByRole('button', { name: /Add Note/ });
  }

  async open(): Promise<void> {
    await this.page.goto('/notes/app', { waitUntil: 'domcontentloaded' });
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new URL('/notes/app', `${baseURL}/`).toString());
    await expect(this.addNoteButton).toBeVisible();
  }

  noteCard(title: string): Locator {
    return this.page.locator('.card').filter({ has: this.page.getByText(title, { exact: true }) });
  }

  async createNote(note: NoteData): Promise<void> {
    await this.addNoteButton.click();
    await this.fillNoteDialog(note);
    await this.page.getByRole('dialog').getByRole('button', { name: 'Create', exact: true }).click();
  }

  async updateNote(currentTitle: string, note: NoteData): Promise<void> {
    await this.noteCard(currentTitle).getByRole('button', { name: 'Edit', exact: true }).click();
    await this.fillNoteDialog(note);
    await this.page.getByRole('dialog').getByRole('button', { name: 'Save', exact: true }).click();
  }

  async expectNoteDetails(note: NoteData): Promise<void> {
    await this.noteCard(note.title).getByRole('button', { name: 'Edit', exact: true }).click();
    const dialog = this.page.getByRole('dialog');
    await expect(dialog.getByLabel('Category:')).toHaveValue(note.category);
    await expect(dialog.getByLabel('Title:')).toHaveValue(note.title);
    await expect(dialog.getByLabel('Description:')).toHaveValue(note.description);
    await expect(dialog.getByLabel('Completed')).toBeChecked({ checked: note.completed });
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  }

  async deleteNote(title: string): Promise<void> {
    await this.noteCard(title).getByRole('button', { name: 'Delete', exact: true }).click();
    await this.page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
  }

  async logout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Logout', exact: true }).click();
  }

  private async fillNoteDialog(note: NoteData): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel('Category:').selectOption(note.category);
    await dialog.getByLabel('Completed').setChecked(note.completed);
    await dialog.getByLabel('Title:').fill(note.title);
    await dialog.getByLabel('Description:').fill(note.description);
  }
}
