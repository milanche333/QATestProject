import { test, expect } from '../../support/fixtures';
import { type Note } from '../../support/api-client';
import { createNoteData } from '../../support/data';

test(
  'DEMO-API-01 | intentional failure: create-note status contract mismatch',
  {
    tag: '@demo-failure',
    annotation: {
      type: 'intentional-failure',
      description: 'The API returns 200; expecting 201 deliberately demonstrates a failed assertion.',
    },
  },
  async ({ notesClient, notesSession }) => {
    const note = createNoteData();
    const response = await notesClient.createNote(notesSession.token, note);
    await test.step('Verify the real create-note behavior', async () => {
      expect(response.status()).toBe(200);
      expect(await notesClient.body<Note>(response)).toMatchObject({
        success: true,
        status: 200,
        data: { ...note, user_id: notesSession.user.id },
      });
    });
    await test.step('Demonstrate an intentional status contract failure', () => {
      // Deliberately wrong expectation. The core suite checks HTTP 200.
      expect(response.status(), 'DEMO: intentionally expect 201 although Notes returns 200').toBe(201);
    });
  },
);
