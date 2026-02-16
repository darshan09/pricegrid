# Contributing to Tap-to-Trade Grid

Thanks for your interest in contributing.

## Ground Rules

- Be respectful and collaborative.
- Keep pull requests focused and small when possible.
- Include clear descriptions of behavior changes and screenshots for visible UI changes.
- Keep changes scoped: avoid unrelated refactors in the same PR.

## Development Setup

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

## Pull Request Checklist

Before opening a PR:

1. Ensure your branch is up to date.
2. Run relevant tests/checks locally.
3. Include screenshots for UI changes.
4. Add or update docs where behavior/config changed.
5. Confirm no secrets are committed.
6. Confirm license compatibility for any newly introduced dependency/code.

## Commit Style (recommended)

Use short, descriptive commit messages, for example:

- `feat: add bulk square-off confirmation`
- `fix: prevent duplicate armed order state`
- `docs: add governance and contribution policy`

## Sign-off (Developer Certificate of Origin)

By contributing, you certify that you have the right to submit the work under this repository's license.

For clarity, include a sign-off line in commits when possible:

```text
Signed-off-by: Your Name <you@example.com>
```

You can do this with:

```bash
git commit -s -m "your message"
```

## Reporting Bugs

Please include:

- expected behavior
- actual behavior
- repro steps
- environment details (OS/browser/node/python versions)

## License for Contributions

By submitting a contribution, you agree your contribution will be licensed under the repository license (GNU AGPL v3).
