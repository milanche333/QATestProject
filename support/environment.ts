const DEFAULT_BASE_URL = 'https://practice.expandtesting.com';

export function resolveBaseURL(value = process.env.BASE_URL): string {
  const candidate = value?.trim() || DEFAULT_BASE_URL;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error(`BASE_URL must be an absolute URL, received: "${candidate}"`);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`BASE_URL must use HTTP or HTTPS, received: "${candidate}"`);
  }

  url.hash = '';
  url.search = '';
  return url.toString().replace(/\/$/, '');
}

export const baseURL = resolveBaseURL();
