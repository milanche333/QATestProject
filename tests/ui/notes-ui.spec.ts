import { test, expect } from '../../support/fixtures';
import { NotesLoginPage } from '../../pages/notes-login.page';
import { NotesPage } from '../../pages/notes.page';
import { createNoteData, type NoteData } from '../../support/data';

test.describe('Notes application', () => {
  test(
    'UI-04 | registered user can log in to Notes and log out',
    { tag: ['@paired', '@smoke'] },
    async ({ page, registeredAccount }) => {
      const login = new NotesLoginPage(page);
      const notes = new NotesPage(page);

      await test.step('Log in with an account provisioned through the API', async () => {
        await login.open();
        await login.expectLoaded();
        await login.login(registeredAccount.account);
        await notes.expectLoaded();
      });

      await test.step('Log out and verify the anonymous home page', async () => {
        await notes.logout();
        await login.expectAnonymousHome();
      });
    },
  );

  test(
    'UI-05 | creates, reads, updates and deletes a note',
    { tag: ['@paired', '@smoke'] },
    async ({ page, registeredAccount }) => {
      const login = new NotesLoginPage(page);
      const notes = new NotesPage(page);
      const note = createNoteData();
      const updatedNote: NoteData = {
        ...note,
        title: `${note.title} updated`,
        description: `${note.description} and updated`,
        category: 'Personal',
        completed: true,
      };

      await test.step('Log in with an isolated test account', async () => {
        await login.open();
        await login.login(registeredAccount.account);
        await notes.expectLoaded();
      });

      await test.step('Create a note and read its persisted content after reopening Notes', async () => {
        await notes.createNote(note);
        await expect(notes.noteCard(note.title)).toContainText(note.description);
        await notes.open();
        await expect(notes.noteCard(note.title)).toHaveCount(1);
        await expect(notes.noteCard(note.title)).toContainText(note.description);
        await notes.expectNoteDetails(note);
      });

      await test.step('Update content, category and completion; verify changes after reopening Notes', async () => {
        await notes.updateNote(note.title, updatedNote);
        await expect(notes.noteCard(updatedNote.title)).toContainText(updatedNote.description);
        await notes.open();
        await expect(notes.noteCard(updatedNote.title)).toHaveCount(1);
        await expect(notes.noteCard(updatedNote.title)).toContainText(updatedNote.description);
        await expect(notes.noteCard(note.title)).toHaveCount(0);
        await notes.expectNoteDetails(updatedNote);
      });

      await test.step('Delete the note and verify it remains absent after reopening Notes', async () => {
        await notes.deleteNote(updatedNote.title);
        await expect(notes.noteCard(updatedNote.title)).toHaveCount(0);
        await notes.open();
        await expect(notes.noteCard(updatedNote.title)).toHaveCount(0);
      });
    },
  );
});
