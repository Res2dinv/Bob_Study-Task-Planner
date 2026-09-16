# Contributing to Study Task Planner

Thank you for your interest in contributing! This project is a student capstone submission, but improvements and bug fixes are welcome.

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/Bob_Study-Task-Planner.git
   cd Bob_Study-Task-Planner
   ```
3. Create a descriptive branch:
   ```bash
   git checkout -b fix/date-validation
   # or
   git checkout -b feat/sort-by-due-date
   ```

---

## Development

No build step is required. Open `index.html` directly in a browser or use **VS Code Live Server**.

The project has exactly three application files:

| File | Responsibility |
|---|---|
| `index.html` | HTML structure only |
| `style.css` | Supplementary component styles |
| `script.js` | All application logic |

---

## Code Guidelines

- Match the existing code style (2-space indentation, `'use strict'`, descriptive names).
- Keep changes minimal and focused — one concern per pull request.
- Set user-supplied text via `.textContent`, never `.innerHTML`.
- Do not introduce new dependencies, frameworks, or a build process.
- Do not implement features listed under **Out of Scope** in the README.

---

## Submitting a Pull Request

1. Make sure the app still works end-to-end in a browser before opening a PR.
2. Write a clear PR title and description explaining **what** changed and **why**.
3. Reference any related issue numbers (e.g. `Closes #12`).
4. Keep PRs small and focused — large unrelated changes will be asked to be split.

---

## Reporting Bugs

Open a [GitHub Issue](../../issues) and include:

- Browser name and version
- Steps to reproduce
- What you expected vs. what happened

---

## License

By contributing, you agree that your changes will be licensed under the project's [MIT License](LICENSE).
