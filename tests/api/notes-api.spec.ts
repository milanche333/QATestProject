import { type APIResponse } from '@playwright/test';
import { test, expect } from '../../support/fixtures';
import { type Note, type NotesProfile, type NotesUser } from '../../support/api-client';
import { createNoteData } from '../../support/data';

test.describe('Notes API | critical business flows', () => {
  test(
    'API-01 | register, authenticate and retrieve the correct profile',
    { tag: ['@smoke', '@paired'] },
    async ({ notesClient, registeredAccount }) => {
      const { account, registrationResponse } = registeredAccount;
      const registered =
        await test.step('Registration returns the new account without its password', async () => {
          expect(registrationResponse.status()).toBe(201);
          const body = await notesClient.body<NotesProfile>(registrationResponse);
          expect(body).toMatchObject({
            success: true,
            status: 201,
            data: { name: account.name, email: account.email },
          });
          expect(body.data.id).toEqual(expect.any(String));
          expect(body.data).not.toHaveProperty('password');
          return body.data;
        });

      const token = await test.step('Valid credentials issue a non-empty authentication token', async () => {
        const response = await notesClient.login(account);
        expect(response.status()).toBe(200);
        const body = await notesClient.body<NotesUser>(response);
        expect(body).toMatchObject({
          success: true,
          status: 200,
          data: { id: registered.id, email: account.email },
        });
        expect(body.data.token).toEqual(expect.any(String));
        expect(body.data.token.trim()).not.toBe('');
        expect(body.data).not.toHaveProperty('password');
        return body.data.token;
      });

      await test.step('The token retrieves the same account profile', async () => {
        const response = await notesClient.profile(token);
        expect(response.status()).toBe(200);
        const body = await notesClient.body<NotesProfile>(response);
        expect(body).toMatchObject({
          success: true,
          status: 200,
          data: { id: registered.id, name: account.name, email: account.email },
        });
        expect(body.data).not.toHaveProperty('password');
      });
    },
  );

  test('API-02 | reject duplicate registration without changing the account', async ({
    notesClient,
    notesSession,
  }) => {
    const response = await notesClient.register({
      ...notesSession.account,
      name: 'Attempted replacement',
    });
    expect(response.status()).toBe(409);
    expect(await notesClient.body<never>(response)).toMatchObject({
      success: false,
      status: 409,
      message: 'An account already exists with the same email address',
    });

    const profileResponse = await notesClient.profile(notesSession.token);
    expect(profileResponse.status()).toBe(200);
    expect((await notesClient.body<NotesProfile>(profileResponse)).data).toMatchObject({
      id: notesSession.user.id,
      name: notesSession.account.name,
      email: notesSession.account.email,
    });
  });

  test('API-03 | reject an incorrect password without issuing a token', async ({
    notesClient,
    registeredAccount,
  }) => {
    const response = await notesClient.login({
      ...registeredAccount.account,
      password: 'IncorrectPassword123!',
    });
    expect(response.status()).toBe(401);
    const body = await notesClient.body<never>(response);
    expect(body).toMatchObject({
      success: false,
      status: 401,
      message: 'Incorrect email address or password',
    });
    expect(body).not.toHaveProperty('data.token');
  });

  test('API-04 | require authentication to read or create notes', async ({ notesClient }) => {
    for (const operation of [
      { name: 'List notes', request: (): Promise<APIResponse> => notesClient.listNotes() },
      {
        name: 'Create a note',
        request: (): Promise<APIResponse> => notesClient.createNote(undefined, createNoteData()),
      },
    ]) {
      await test.step(`${operation.name}: reject a request without authentication`, async () => {
        const response = await operation.request();
        expect(response.status()).toBe(401);
        const body = await notesClient.body<never>(response);
        expect(body).toMatchObject({
          success: false,
          status: 401,
          message: 'No authentication token specified in x-auth-token header',
        });
        expect(body).not.toHaveProperty('data');
      });
    }
  });

  test(
    'API-05 | create a note and persist its content and ownership',
    { tag: ['@smoke', '@paired'] },
    async ({ notesClient, notesSession }) => {
      const note = createNoteData();
      const response = await notesClient.createNote(notesSession.token, note);
      expect(response.status()).toBe(200);
      const created = await notesClient.body<Note>(response);
      expect(created).toMatchObject({
        success: true,
        status: 200,
        data: { ...note, user_id: notesSession.user.id },
      });
      expect(created.data.id).toEqual(expect.any(String));
      expect(Number.isNaN(Date.parse(created.data.created_at))).toBe(false);

      const readResponse = await notesClient.getNote(notesSession.token, created.data.id);
      expect(readResponse.status()).toBe(200);
      expect((await notesClient.body<Note>(readResponse)).data).toEqual(created.data);
    },
  );

  test("API-06 | list only the authenticated account's notes", async ({
    notesClient,
    notesSession,
    accountFactory,
  }) => {
    const ownNotes = [createNoteData(), createNoteData()];
    const ownIds: string[] = [];
    for (const note of ownNotes) {
      const response = await notesClient.createNote(notesSession.token, note);
      expect(response.status()).toBe(200);
      ownIds.push((await notesClient.body<Note>(response)).data.id);
    }

    const otherAccount = await accountFactory();
    const loginResponse = await notesClient.login(otherAccount.account);
    expect(loginResponse.status()).toBe(200);
    const otherUser = (await notesClient.body<NotesUser>(loginResponse)).data;
    const otherNoteResponse = await notesClient.createNote(otherUser.token, createNoteData());
    expect(otherNoteResponse.status()).toBe(200);
    const otherNote = (await notesClient.body<Note>(otherNoteResponse)).data;

    const listResponse = await notesClient.listNotes(notesSession.token);
    expect(listResponse.status()).toBe(200);
    const list = await notesClient.body<Note[]>(listResponse);
    expect(list).toMatchObject({ success: true, status: 200 });
    expect(list.data.map((note) => note.id).sort()).toEqual(ownIds.sort());
    expect(list.data.every((note) => note.user_id === notesSession.user.id)).toBe(true);
    expect(list.data.map((note) => note.id)).not.toContain(otherNote.id);
    for (const note of ownNotes) expect(list.data).toContainEqual(expect.objectContaining({ ...note }));
  });

  test(
    'API-07 | persist edited content, category and completion status',
    { tag: '@paired' },
    async ({ notesClient, notesSession }) => {
      const response = await notesClient.createNote(notesSession.token, createNoteData());
      expect(response.status()).toBe(200);
      const created = (await notesClient.body<Note>(response)).data;
      const changes = {
        ...createNoteData(),
        category: 'Personal' as const,
        completed: true,
      };

      const updateResponse = await notesClient.updateNote(notesSession.token, created.id, changes);
      expect(updateResponse.status()).toBe(200);
      expect(await notesClient.body<Note>(updateResponse)).toMatchObject({
        success: true,
        status: 200,
        data: { ...changes, id: created.id, user_id: created.user_id },
      });

      const readResponse = await notesClient.getNote(notesSession.token, created.id);
      expect(readResponse.status()).toBe(200);
      expect((await notesClient.body<Note>(readResponse)).data).toMatchObject({
        ...changes,
        id: created.id,
        user_id: created.user_id,
        created_at: created.created_at,
      });
    },
  );

  test(
    'API-08 | delete a note and remove it from retrieval and listing',
    { tag: '@paired' },
    async ({ notesClient, notesSession }) => {
      const createResponse = await notesClient.createNote(notesSession.token, createNoteData());
      expect(createResponse.status()).toBe(200);
      const created = (await notesClient.body<Note>(createResponse)).data;

      const deleteResponse = await notesClient.deleteNote(notesSession.token, created.id);
      expect(deleteResponse.status()).toBe(200);
      expect(await notesClient.body<never>(deleteResponse)).toMatchObject({
        success: true,
        status: 200,
        message: 'Note successfully deleted',
      });

      const readResponse = await notesClient.getNote(notesSession.token, created.id);
      expect(readResponse.status()).toBe(404);
      expect(await notesClient.body<never>(readResponse)).toMatchObject({
        success: false,
        status: 404,
      });
      const listResponse = await notesClient.listNotes(notesSession.token);
      expect(listResponse.status()).toBe(200);
      expect((await notesClient.body<Note[]>(listResponse)).data).toEqual([]);
    },
  );

  test('API-09 | reject an empty title without creating a note', async ({ notesClient, notesSession }) => {
    const response = await notesClient.createNote(notesSession.token, {
      ...createNoteData(),
      title: '',
    });
    expect(response.status()).toBe(400);
    expect(await notesClient.body<never>(response)).toMatchObject({
      success: false,
      status: 400,
      message: 'Title must be between 4 and 100 characters',
    });

    const listResponse = await notesClient.listNotes(notesSession.token);
    expect(listResponse.status()).toBe(200);
    expect((await notesClient.body<Note[]>(listResponse)).data).toEqual([]);
  });

  test(
    'API-10 | prevent another account from reading, editing or deleting a note',
    { tag: '@smoke' },
    async ({ notesClient, notesSession, accountFactory }) => {
      const createResponse = await notesClient.createNote(notesSession.token, createNoteData());
      expect(createResponse.status()).toBe(200);
      const created = (await notesClient.body<Note>(createResponse)).data;
      const otherAccount = await accountFactory();
      const loginResponse = await notesClient.login(otherAccount.account);
      expect(loginResponse.status()).toBe(200);
      const otherUser = (await notesClient.body<NotesUser>(loginResponse)).data;

      // This service hides notes owned by another user behind a 404 response.
      for (const operation of [
        {
          name: 'Read',
          request: (): Promise<APIResponse> => notesClient.getNote(otherUser.token, created.id),
        },
        {
          name: 'Edit',
          request: (): Promise<APIResponse> =>
            notesClient.updateNote(otherUser.token, created.id, createNoteData()),
        },
        {
          name: 'Delete',
          request: (): Promise<APIResponse> => notesClient.deleteNote(otherUser.token, created.id),
        },
      ]) {
        await test.step(`${operation.name}: deny access to another account's note`, async () => {
          const response = await operation.request();
          expect(response.status()).toBe(404);
          const body = await notesClient.body<never>(response);
          expect(body).toMatchObject({ success: false, status: 404 });
          expect(body).not.toHaveProperty('data');
        });
      }

      await test.step('The owner can still retrieve the unchanged note', async () => {
        const response = await notesClient.getNote(notesSession.token, created.id);
        expect(response.status()).toBe(200);
        expect((await notesClient.body<Note>(response)).data).toEqual(created);
      });
    },
  );
});
