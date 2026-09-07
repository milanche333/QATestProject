import { randomUUID } from 'node:crypto';

export const credentials = {
  valid: { username: 'practice', password: 'SuperSecretPassword!' },
  invalidUsername: { username: 'wrongUser', password: 'SuperSecretPassword!' },
  invalidPassword: { username: 'practice', password: 'WrongPassword' },
} as const;

export const inputValues = {
  number: '42',
  text: 'Playwright POM',
  password: 'secret',
  date: '2026-09-04',
} as const;

export const messages = {
  loginSuccess: 'You logged into a secure area!',
  logoutSuccess: 'You logged out of the secure area!',
  invalidCredentials: 'Your password is invalid!',
} as const;

export interface NotesAccount {
  name: string;
  email: string;
  password: string;
}

export interface NoteData {
  title: string;
  description: string;
  category: 'Home' | 'Work' | 'Personal';
  completed: boolean;
}

export function createNotesAccount(): NotesAccount {
  return {
    name: 'Playwright Test User',
    email: `playwright.${randomUUID()}@example.com`,
    password: 'TestPassword123!',
  };
}

export function createNoteData(): NoteData {
  const id = randomUUID().slice(0, 8);
  return {
    title: `Automation note ${id}`,
    description: `Created by the automated test ${id}`,
    category: 'Work',
    completed: false,
  };
}
