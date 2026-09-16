# 📚 Study Task Planner

A simple, responsive web application that helps university students manage assignments, track deadlines, and monitor completion — all from a single browser tab, no account or installation required.

Built as a capstone project for the **IBM SkillsBuild** programme using **IBM Bob** as the AI coding assistant.

---

## ✨ Features

- **Create** assignments with a title and due date (DD/MM/YYYY)
- **Edit** assignment details inline
- **Delete** assignments with a confirmation prompt
- **Mark complete / restore** — toggle between Active and Completed
- **Filter** the list by All, Active, or Completed
- **Overdue indicator** — active assignments past their due date are highlighted in red
- **Persistent storage** — all data is saved to `localStorage`; nothing is lost on refresh
- **Responsive** — works on desktop and mobile browsers

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic page structure |
| Tailwind CSS (CDN) | Utility-first styling |
| Vanilla JavaScript | App logic, CRUD, filtering, validation |
| Browser `localStorage` | Client-side persistence |

No frameworks, no build step, no backend, no dependencies to install.

---

## 🚀 Getting Started

### Option 1 — VS Code Live Server (recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/Res2dinv/Bob_Study-Task-Planner.git
   cd Bob_Study-Task-Planner
   ```
2. Open the folder in **Visual Studio Code**.
3. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension if you haven't already.
4. Right-click `index.html` → **Open with Live Server**.
5. The app opens at `http://127.0.0.1:5500`.

### Option 2 — Open directly in a browser

Double-click `index.html`. No server is required.

> **Note:** The Tailwind CSS Play CDN requires an internet connection on first load.

---

## 📁 Project Structure

```
Bob_Study-Task-Planner/
├── index.html      # Page structure — header, form, filter tabs, task list
├── style.css       # Supplementary styles (components, badges, buttons)
├── script.js       # Application logic — CRUD, filtering, validation, localStorage
├── README.md       # This file
├── CONTRIBUTING.md # Contribution guidelines
├── LICENSE         # MIT License
└── innit           # Repository initialisation marker (do not modify)
```

---

## 🧪 Manual Testing Checklist

| Test | Expected Result |
|---|---|
| Add assignment with valid title + date | Card appears in list immediately |
| Submit with empty title | Inline error: "Assignment title is required." |
| Submit with invalid/missing date | Inline error: "Please enter a valid date in DD / MM / YYYY format." |
| Try date 31/02/YYYY | Rejected as invalid calendar date |
| Edit title and date | Card updates on Save |
| Save edit with empty title | Inline error shown inside card |
| Click ✓ Complete | Badge changes to Completed, title gains strikethrough |
| Click ↩ Restore | Badge returns to Active |
| Click ✕ Delete → Confirm | Card removed |
| Click ✕ Delete → Cancel | Card remains |
| Switch Active tab | Only active tasks visible |
| Switch Completed tab | Only completed tasks visible |
| Empty state | Appropriate message shown per filter |
| Refresh browser | All tasks and statuses restored |
| Active task past due date | Due date shown in red with "Overdue" label |

---

## ⚠️ Known Limitations

- No undo after delete — the native confirm dialog is the only safeguard.
- Tasks are listed newest-first only; no manual reordering.
- Tailwind CDN requires an internet connection (styling will not load fully offline).
- `localStorage` is browser- and device-specific; data does not sync across devices.

---

## 🔭 Out of Scope (MVP)

The following features are intentionally not implemented:

- User authentication
- Cloud synchronisation / backend
- Notifications or reminders
- Calendar integration
- Team collaboration
- Analytics

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 👤 Author

**Res2dinv**  
IBM SkillsBuild Capstone Project — developed with [IBM Bob](https://www.ibm.com/products/bob)
