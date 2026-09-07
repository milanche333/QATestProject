# QA Automation Portfolio

Playwright + TypeScript: **10 UI tests, 10 API tests, and 2 intentional failure examples**.

Covers authentication, Notes CRUD and persistence, account isolation, validation, and selected browser interactions
on [Expand Testing](https://practice.expandtesting.com). Tests create unique accounts and clean up afterward.

## Run

Requires Node.js **22.13+ (22.x)** or **24+**.

```sh
npm ci
npx playwright install chromium
npm test
npm run report
```

## Commands

| Command                      | Runs                                              |
| ---------------------------- | ------------------------------------------------- |
| `npm test`                   | All 20 regular tests: API + Chromium              |
| `npm run test:ui`            | 10 UI tests with a visible browser locally        |
| `npm run test:api`           | 10 API tests                                      |
| `npm run test:demo`          | 1 UI + 1 API example that intentionally fail      |
| `npm run test:cross-browser` | 3 UI smoke tests in Chromium, Firefox, and WebKit |
| `npm run check`              | TypeScript, ESLint, and formatting checks         |
| `npm run format`             | Format the project                                |
| `npm run report`             | Open the latest run's HTML report                 |

Local UI runs open a visible browser; runs with `CI` set (including GitHub Actions) use headless mode.
Use `npm run test:ui -- --grep UI-05` to select a case.
Run `npm run install:browsers` before cross-browser testing.

Demo tests are excluded by default. They deliberately expect incorrect login text and HTTP 201 instead of 200;
**two failures are the expected result**.

## Structure

```text
tests/ui/                UI scenarios + one failure example
tests/api/               API scenarios + one failure example
pages/                   Browser selectors and actions
support/                 Shared fixtures, API client, test data, environment, and upload file
playwright.config.ts     One configuration for all runs
```

Every run uses `playwright-report/` for the HTML report and `test-results/` for traces, screenshots, and video.
The next run replaces the previous results. Both folders are generated and ignored by Git.

GitHub Actions runs all 20 tests in Chromium/API and three UI smoke scenarios in Firefox/WebKit, retaining reports for 14 days.
The target can be changed with the `BASE_URL` environment variable; `.env` files are not loaded automatically.
The public demo service's availability and application changes can affect results.
