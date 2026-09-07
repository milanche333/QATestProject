import { test as base, expect, type APIResponse } from '@playwright/test';
import { NotesApiClient, type NotesUser } from './api-client';
import { createNotesAccount, type NotesAccount } from './data';

interface RegisteredAccount {
  account: NotesAccount;
  registrationResponse: APIResponse;
}

interface NotesSession {
  account: NotesAccount;
  token: string;
  user: NotesUser;
}

interface NotesFixtures {
  notesClient: NotesApiClient;
  accountFactory: () => Promise<RegisteredAccount>;
  registeredAccount: RegisteredAccount;
  notesSession: NotesSession;
}

const adHostSuffixes = [
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'googletagservices.com',
];

function isAdvertisingRequest(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    return (
      adHostSuffixes.some((suffix) => url.hostname === suffix || url.hostname.endsWith(`.${suffix}`)) ||
      ((url.hostname === 'google.com' || url.hostname.endsWith('.google.com')) &&
        url.pathname.startsWith('/pagead/'))
    );
  } catch {
    return false;
  }
}

async function deleteTestAccounts(notesClient: NotesApiClient, accounts: NotesAccount[]): Promise<void> {
  const cleanupErrors: unknown[] = [];
  for (const account of accounts.reverse()) {
    try {
      // Login/logout in a test can invalidate the earlier session token.
      const loginResponse = await notesClient.login(account);
      expect(loginResponse.status(), 'Authenticate for account cleanup').toBe(200);
      const loginBody = await notesClient.body<NotesUser>(loginResponse);
      expect(Boolean(loginBody.data?.token), 'Cleanup receives an authentication token').toBe(true);
      const deleteResponse = await notesClient.deleteAccount(loginBody.data.token);
      expect(deleteResponse.status(), 'Delete the test account and its notes').toBe(200);
    } catch (error) {
      cleanupErrors.push(error);
    }
  }
  if (cleanupErrors.length) {
    throw new AggregateError(cleanupErrors, 'Failed to clean up Notes test accounts');
  }
}

export const test = base.extend<NotesFixtures>({
  page: async ({ context, page }, use) => {
    await context.route('**/*', async (route) => {
      if (isAdvertisingRequest(route.request().url())) {
        await route.abort('blockedbyclient');
        return;
      }

      await route.continue();
    });

    await context.addInitScript(() => {
      const style = document.createElement('style');
      style.dataset.testAdBlocker = 'true';
      style.textContent = `
        iframe[title="Advertisement"],
        iframe[aria-label="Advertisement"],
        ins.adsbygoogle,
        .adsbygoogle,
        [data-ad-status],
        [data-anchor-status],
        [id^="google_ads_"],
        [id^="aswift_"] {
          display: none !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }
      `;
      document.documentElement.append(style);
    });

    await use(page);
  },

  notesClient: async ({ request }, use) => {
    await use(new NotesApiClient(request));
  },

  accountFactory: async ({ notesClient }, use) => {
    const accounts: NotesAccount[] = [];

    const createAccount = async (): Promise<RegisteredAccount> => {
      const account = createNotesAccount();
      const registrationResponse = await notesClient.register(account);
      // Track successful creation before assertions so teardown also runs after setup failures.
      if (registrationResponse.ok()) accounts.push(account);
      expect(registrationResponse.status(), 'Create an isolated test account').toBe(201);
      return { account, registrationResponse };
    };

    try {
      await use(createAccount);
    } finally {
      await deleteTestAccounts(notesClient, accounts);
    }
  },

  registeredAccount: async ({ accountFactory }, use) => {
    await use(await accountFactory());
  },

  notesSession: async ({ notesClient, registeredAccount }, use) => {
    const loginResponse = await notesClient.login(registeredAccount.account);
    expect(loginResponse.status(), 'Authenticate the test account').toBe(200);
    const { data: user } = await notesClient.body<NotesUser>(loginResponse);
    expect(Boolean(user?.token), 'Login receives an authentication token').toBe(true);
    await use({ account: registeredAccount.account, token: user.token, user });
  },
});

export { expect };
