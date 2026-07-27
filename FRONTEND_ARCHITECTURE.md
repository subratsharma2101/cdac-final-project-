# 🏗️ FRONTEND ARCHITECTURE & FLOW — MERN Blogging App



## 📑 Table of Contents
1. [Backend Kya Deta Hai (Real API)](#part-1)
2. [Poora System Architecture](#part-2)
3. [Frontend Folder Structure](#part-3)
4. [3 Most Important Flows](#part-4)
5. [Build Order (Roadmap)](#part-5)
6. [Interview Q&A](#part-6)
7. [Key Terms Glossary (English)](#part-7)

---

<a name="part-1"></a>
## 🔌 Part 1 — Backend Kya Deta Hai (Real API)

Backend already ban chuka hai. Frontend ko sirf in **7 endpoints** se baat karni hai.

| Method | Endpoint | Protected? | Kaam | Response |
|--------|----------|:---:|------|----------|
| POST | `/api/user/register` | ❌ | Naya user banao | `{ _id, name, email, token }` |
| POST | `/api/user/login` | ❌ | Login karo | `{ _id, name, email, token }` |
| GET | `/api/posts` | ❌ | Saare **public** posts | `[ {post, author:{name}} ]` |
| GET | `/api/posts/dashboard` | ✅ | Mere **apne** posts (public+private) | `[ {post} ]` |
| POST | `/api/posts` | ✅ | Nayi post banao | `{ post }` |
| PUT | `/api/posts/:id` | ✅ | Post edit (sirf owner) | `{ updated post }` |
| DELETE | `/api/posts/:id` | ✅ | Post delete (sirf owner) | `{ message }` |

**Protected route ka matlab:**
Request ke saath `Authorization: Bearer <token>` header bhejna zaroori hai, warna
backend `401 Unauthorized` de dega.

> **English:** *A protected route requires a valid JWT sent in the `Authorization`
> header. The server's auth middleware verifies the token before running the controller.*

---

<a name="part-2"></a>
## 🎯 Part 2 — Poora System Architecture (Bird's Eye View)

```
┌─────────────────────────────────────────────────────────────────┐
│                          BROWSER (User)                           │
│                                                                   │
│   ┌──────────────────── REACT APP (Vite + MUI) ───────────────┐  │
│   │                                                            │  │
│   │   Pages ──▶ Axios (api layer) ──▶ HTTP Request             │  │
│   │     ▲                                    │                 │  │
│   │     │        AuthContext                 │                 │  │
│   │     │     (token + user state)           │                 │  │
│   │     │            │                       │                 │  │
│   │     └── localStorage (token save) ◀──────┘                 │  │
│   └────────────────────────────────────────────│──────────────┘  │
└──────────────────────────────────────────────── │ ───────────────┘
                                                   │  HTTP (JSON)
                          Axios har request mein   │  + Bearer token
                          token header bhejta hai  ▼
┌───────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express Server)                       │
│                                                                     │
│   server.js ──▶ Routes ──▶ [auth middleware] ──▶ Controller         │
│                   │              (JWT verify)         │             │
│                   │                                   ▼             │
│                   │                              Mongoose Model     │
└───────────────────│───────────────────────────────────│────────────┘
                    │                                     ▼
                    │                          ┌──────────────────┐
                    └─────────────────────────▶│     MongoDB      │
                                                │  Users & Posts   │
                                                └──────────────────┘
```

**Ek line mein:** `React → Axios → Express → Mongoose → MongoDB` (aur wapas ulta).

**Har layer ka kaam:**
- **React (Vite):** UI banata hai, user ka input leta hai. Vite = fast dev server + build tool.
- **MUI (Material-UI):** ready-made components (Button, Card, TextField) — jaldi sundar UI.
- **Axios:** browser se backend tak HTTP request bhejne wala library (fetch se aasan).
- **AuthContext:** login state (token + user) ko poore app mein globally share karta hai.
- **localStorage:** browser ka storage — token yaha save hota hai taaki refresh pe login bana rahe.
- **Express:** backend server, routes handle karta hai.
- **Mongoose:** MongoDB ke saath baat karne ka ODM (schema + query).

> **English:** *The frontend is a Single Page Application (SPA) built with React. It
> communicates with the Express backend over HTTP using Axios, sending/receiving JSON.
> Authentication state is kept in React Context and persisted in `localStorage`.*

---

<a name="part-3"></a>
## 🗂️ Part 3 — Frontend Folder Structure

```
client/src/
├── main.jsx              ← app entry; Router + AuthProvider yaha wrap hote hain
├── App.jsx               ← saare routes (URL → page mapping) yaha
│
├── api/
│   └── axios.js          ← axios instance: baseURL + token auto-attach interceptor
│
├── context/
│   └── AuthContext.jsx   ← login/logout functions, token+user global state
│
├── components/           ← reusable UI (chhote tukde)
│   ├── Navbar.jsx        ← top bar: Home / Dashboard / Login / Logout buttons
│   ├── PostCard.jsx      ← ek post dikhane ka card (title, content, edit/delete)
│   └── ProtectedRoute.jsx ← guard: login nahi to Home bhej do
│
└── pages/                ← poore page (route ke against dikhte hain)
    ├── Home.jsx          ← PUBLIC dashboard  (route "/")
    ├── Login.jsx         ← route "/login"
    ├── Register.jsx      ← route "/register"
    └── Dashboard.jsx     ← PRIVATE dashboard (route "/dashboard") + create/edit/delete
```

**components vs pages ka farak (interview favourite):**
- **Page** = ek poora screen jo kisi route pe khulta hai (Home, Login).
- **Component** = chhota reusable tukda jo pages ke andar use hota hai (PostCard, Navbar).

> **English:** *Pages map to routes and represent full screens; components are smaller,
> reusable UI pieces used inside pages.*

---

<a name="part-4"></a>
## 🔄 Part 4 — 3 Most Important FLOWS

### 🔐 Flow 1 — Login / Register (Token milna aur save hona)

```
User form bharta hai (email + password)
        │
        ▼
Login.jsx ──▶ axios.post("/api/user/login", { email, password })
        │
        ▼
Backend: password check (bcrypt) ✅ → JWT token banata hai
        │
        ▼
Response: { _id, name, email, token }
        │
        ▼
AuthContext: token → localStorage mein save + user state set
        │
        ▼
useNavigate("/dashboard")  ← private dashboard pe redirect
```

**Kya ho raha hai internally:**
1. User email+password bhejta hai.
2. Backend `bcrypt.compare()` se password check karta hai (DB mein hashed password hai).
3. Sahi hua to `jwt.sign()` se ek token banta hai (ismein user id chhupi hoti hai).
4. Frontend token ko `localStorage.setItem("token", token)` se save karta hai.
5. `useNavigate` hook se user dashboard pe chala jaata hai.

> **English:** *On login, the server verifies the hashed password with bcrypt and issues
> a signed JWT containing the user's id. The client stores the token in `localStorage`
> and redirects using React Router's `useNavigate`.*

---

### 📮 Flow 2 — Protected Request (Token har request ke saath)

```
Dashboard.jsx load hota hai
        │
        ▼
axios.get("/api/posts/dashboard")
        │
   ┌────┴──────────────────────────────────┐
   │ Axios REQUEST INTERCEPTOR:             │
   │ localStorage se token uthata hai aur   │
   │ header lagata hai automatically:       │
   │   Authorization: Bearer <token>        │
   └────┬──────────────────────────────────┘
        ▼
Backend auth middleware: jwt.verify(token)
        │
   ┌────┴────┐
   │ Valid?  │
   └─┬─────┬─┘
    ✅     ❌
     │      │
   data    401 → frontend token clear → redirect Home
```

**Interceptor kya hai (important):**
Ye ek "beech ka darwaza" hai — har request bahar jaane se pehle isme se guzarti hai.
Hum yaha ek baar token attach karne ka rule likh dete hain, phir har API call mein
manually token likhne ki zaroorat nahi.

> **English:** *An Axios request interceptor runs before every request and automatically
> attaches the JWT from `localStorage` to the `Authorization` header, so we don't repeat
> that logic in every API call.*

---

### 🚪 Flow 3 — Public vs Private Dashboard (Project ka CORE)

```
                    ┌──────────────────────┐
   Koi bhi user  ──▶│  HOME (Public)       │──▶ GET /api/posts
   (login zaroori   │  route: "/"          │    (sirf isPrivate:false)
    NAHI)           └──────────────────────┘

                    ┌──────────────────────┐
   Sirf logged-in──▶│  DASHBOARD (Private) │──▶ GET /api/posts/dashboard
   user            │  route: "/dashboard"  │    (mere saare posts)
   (ProtectedRoute) │  + Create/Edit/Delete │    + Bearer token
                    └──────────────────────┘
```

**Checkbox ka role (public/private):**
Create post form mein ek checkbox hota hai:
- ✅ tick = `isPrivate: true` → sirf mujhe (owner) dikhega.
- ⬜ untick = `isPrivate: false` → Home page pe sabko public dikhega.

**Edit / Delete + instant UI update:**
Delete pe do cheezein hoti hain:
1. Backend call: `axios.delete("/api/posts/" + id)`.
2. Frontend `state` (list) se wo post turant hata dete hain → page refresh nahi, UI turant update.

Ise **optimistic / immediate UI update** kehte hain.

```js
// delete ke baad list update (concept)
setPosts(posts.filter(p => p._id !== id));
```

> **English:** *The Home page shows only public posts (no auth needed). The Dashboard is a
> protected route showing the logged-in user's own posts. A checkbox controls the
> `isPrivate` flag. After edit/delete, local state is updated immediately for instant UI
> feedback without a full page reload.*

---

### 🛡️ Flow 4 — Protected Route + Logout

```
User "/dashboard" kholta hai
        │
        ▼
ProtectedRoute check: localStorage mein token hai?
        │
   ┌────┴────┐
   │ Token?  │
   └─┬─────┬─┘
    ✅     ❌
     │      │
 Dashboard  Redirect to "/" (Home)
 dikhao

LOGOUT dabaya:
  localStorage.removeItem("token")  → state clear → navigate("/")
```

> **English:** *A `ProtectedRoute` wrapper checks for a token before rendering a private
> page; if absent, it redirects to Home. Logout clears the token from `localStorage` and
> resets the auth state.*

---

<a name="part-5"></a>
## 🧩 Part 5 — Build Order (Step-by-Step Roadmap)

Chhote se bade — har step test karke aage badhenge:

```
1.  client setup      → Vite + React, install MUI/router/axios
2.  api/axios.js       → baseURL + token interceptor
3.  context/AuthContext → login/logout/token logic
4.  App.jsx routes     → saare pages wire up
5.  Register + Login   → auth chalu karo
6.  ProtectedRoute     → private guard
7.  Home page          → public posts dikhao
8.  Dashboard          → mere posts + Create form (checkbox)
9.  Edit + Delete      → instant UI update
10. Navbar + polish    → final look
```

**Packages jo install honge:**
```bash
npm create vite@latest client -- --template react
cd client
npm install
npm install @mui/material @emotion/react @emotion/styled
npm install react-router-dom axios
```

---

<a name="part-6"></a>
## 🎤 Part 6 — Interview Q&A (Ratne wale)

**Q1. Aapke project mein authentication kaise kaam karta hai?**
> "Login pe backend password ko bcrypt se verify karta hai aur ek JWT token deta hai. Wo
> token frontend `localStorage` mein save karta hai. Har protected request mein Axios
> interceptor automatically wo token `Authorization: Bearer` header mein bhejta hai, aur
> backend middleware use verify karke user identify karta hai."

**Q2. Public aur private posts mein kya farak hai?**
> "Har post mein ek `isPrivate` boolean flag hai. Public posts (`isPrivate:false`) Home
> feed pe sabko dikhte hain bina login ke. Private posts sirf owner ko uske Dashboard pe
> dikhte hain. Backend query me `isPrivate` filter aur `author` ownership check hota hai."

**Q3. ProtectedRoute kaise banaya?**
> "Ek wrapper component jo `localStorage` mein token check karta hai. Token hai to page
> dikhata hai, nahi to React Router ke `Navigate` se Home pe bhej deta hai."

**Q4. State (Context) ka use kyu kiya?**
> "Login ki state (token + user) poore app mein chahiye — Navbar, Dashboard, Home sab me.
> Har jagah props pass karne ki jagah maine React Context (AuthContext) use kiya taaki
> ek central jagah se state milti rahe."

**Q5. Delete pe page refresh kyu nahi karte?**
> "Delete ke baad main sirf local state se wo post filter karke hata deta hu, isse UI
> turant update ho jaata hai. Poora page reload karna slow aur bekaar hota."

**Q6. CORS kya hai, kaha use hua?**
> "CORS browser ka security rule hai jo alag origin (port) se request block karta hai.
> Backend `cors` middleware se frontend ka URL allow karta hai taaki React (port 5173)
> se Express (port 5000) pe request ja sake."

---

<a name="part-7"></a>
## 📖 Part 7 — Key Terms Glossary (English notes)

| Term | Definition |
|------|-----------|
| **SPA** | Single Page Application — one HTML page, JS swaps content without full reloads. |
| **JWT** | JSON Web Token — a signed token carrying user data, used for stateless auth. |
| **bcrypt** | A hashing algorithm to securely store passwords (never plain text). |
| **Axios interceptor** | A function that runs before every request/after every response to add common logic (e.g. attach token). |
| **React Context** | A way to share state globally without prop-drilling. |
| **Protected Route** | A route that only renders if the user is authenticated. |
| **localStorage** | Browser storage that persists data across page reloads. |
| **useNavigate** | React Router hook to redirect the user programmatically. |
| **CORS** | Cross-Origin Resource Sharing — browser security allowing/blocking cross-origin requests. |
| **Optimistic UI update** | Updating the UI immediately (local state) without waiting for a full reload. |

---

## ✅ Next Step
Agla kaam: **Step 1 — client setup** (Vite + MUI + router + axios).
Jab ready ho, bolo: *"Step 1 chalu karo"* — code likhna shuru karenge.
