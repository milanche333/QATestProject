import { type APIRequestContext, type APIResponse } from '@playwright/test';
import { type NoteData, type NotesAccount } from './data';

export interface ApiEnvelope<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

export interface NotesProfile {
  id: string;
  name: string;
  email: string;
}

export interface NotesUser extends NotesProfile {
  token: string;
}

export interface Note extends NoteData {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export class NotesApiClient {
  constructor(private readonly request: APIRequestContext) {}

  register(account: NotesAccount): Promise<APIResponse> {
    return this.request.post('/notes/api/users/register', {
      form: { name: account.name, email: account.email, password: account.password },
    });
  }

  login(account: NotesAccount): Promise<APIResponse> {
    return this.request.post('/notes/api/users/login', {
      form: { email: account.email, password: account.password },
    });
  }

  profile(token: string): Promise<APIResponse> {
    return this.request.get('/notes/api/users/profile', { headers: this.authHeaders(token) });
  }

  deleteAccount(token: string): Promise<APIResponse> {
    return this.request.delete('/notes/api/users/delete-account', { headers: this.authHeaders(token) });
  }

  listNotes(token?: string): Promise<APIResponse> {
    return this.request.get('/notes/api/notes', { headers: this.authHeaders(token) });
  }

  createNote(token: string | undefined, note: NoteData): Promise<APIResponse> {
    return this.request.post('/notes/api/notes', {
      headers: this.authHeaders(token),
      form: this.noteForm(note),
    });
  }

  getNote(token: string, noteId: string): Promise<APIResponse> {
    return this.request.get(`/notes/api/notes/${noteId}`, { headers: this.authHeaders(token) });
  }

  updateNote(token: string, noteId: string, note: NoteData): Promise<APIResponse> {
    return this.request.put(`/notes/api/notes/${noteId}`, {
      headers: this.authHeaders(token),
      form: this.noteForm(note),
    });
  }

  deleteNote(token: string, noteId: string): Promise<APIResponse> {
    return this.request.delete(`/notes/api/notes/${noteId}`, { headers: this.authHeaders(token) });
  }

  async body<T>(response: APIResponse): Promise<ApiEnvelope<T>> {
    return (await response.json()) as ApiEnvelope<T>;
  }

  private authHeaders(token?: string): Record<string, string> {
    return token ? { 'x-auth-token': token } : {};
  }

  private noteForm(note: NoteData): Record<string, string | boolean> {
    return {
      title: note.title,
      description: note.description,
      category: note.category,
      completed: note.completed,
    };
  }
}
