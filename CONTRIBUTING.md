# Contributing

- Keep 10 core UI and 10 core API scenarios with stable IDs. Replace a lower-priority case when adding coverage.
- Keep one `@demo-failure` example per layer. These must fail on their intended assertion; do not use `test.fail()`.
- Put scenarios in `tests/`, browser actions in `pages/`, and shared setup, API transport, and data in `support/`.
- Prefer accessible selectors and observable outcomes. Avoid fixed sleeps and committed credentials or generated reports.
- Use unique test accounts and verify cleanup.
- Run `npm run check` and `npm test` before submitting a change.
- After shared browser changes, run `npm run test:cross-browser`. After demo changes, verify both intended failures with `npm run test:demo`.

Describe the behavior changed and validation results in the pull request.
