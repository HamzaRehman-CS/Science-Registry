# PAF-IAST Science Society - Secret Roast & Toast Vault 🧪

An anonymous, interactive fun activity platform for the PAF-IAST Science Society where members can drop playful roasts, heartwarming appreciation, campus tea, and inside jokes about any society member or cabinet post.

---

## 🌟 Features

- **Public Roast & Toast Portal (`/`)**:
  - Interactive target selection (cabinet roles, committee leads, or custom member names)
  - Role/Designation tagger (President, Event Lead, Chai In-charge, etc.)
  - Vibe Selector:
    - 🔥 Spicy Roast
    - 💖 Sweet Toast & Appreciation
    - ☕ Spilling Tea & Campus Banter
    - 😂 Inside Joke
    - 🍿 Unpopular Opinion
  - Random Prompt Generator (click 🎲 for funny prompt ideas)
  - 100% Anonymous: No names, emails, IP addresses, or tracking cookies collected.

- **Admin Secret Vault (`/admin`)**:
  - Secure login:
    - **Admin ID**: `PAFSS26`
    - **Password**: `register`
  - Real-time comment stream from Supabase
  - Shows **only** the target member's name, post, vibe, comment, and timestamp (Strictly zero author identity)
  - Filter by vibe, search by member name or keyword
  - Quick-copy comment text
  - Moderation / Delete comment action
  - CSV Export for presentation at society events

---

## 🚀 Running Locally

```bash
npm install
npm run dev
```

Visit the local server:
- Portal: `http://localhost:5173/`
- Admin: `http://localhost:5173/admin`

---

## 🔐 Admin Credentials

- **Admin ID**: `PAFSS26` (or `pafss26@society.com`)
- **Password**: `register`
