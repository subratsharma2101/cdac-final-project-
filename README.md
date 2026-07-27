# Blogging App (MERN)

A full-stack MERN blogging application with JWT authentication, public/private posts,
and a comment system. The backend is an Express + MongoDB REST API, and the frontend is
a React (Vite) + Material-UI single-page app.

## Project Structure

```
cdac project/
├── server/      ← Express + MongoDB REST API (backend)
└── client/      ← React + Vite + MUI (frontend)
```

---

## Backend - How to Set Up and Run the Server Locally

1. Go into the server folder:

   ```
   cd server
   ```

2. Install the dependencies:

   ```
   npm install
   ```

3. Create a `.env` file inside the `server` folder (see the variables below).

4. Make sure MongoDB is running (local or MongoDB Atlas).

5. Start the server:

   ```
   npm run dev
   ```

   If everything is fine you will see `Server running on port 5000` and `MongoDB connected`.

## Required .env Variables

Create a `.env` file inside the `server` folder with these variables:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Note: Never commit your real `.env` file or actual secrets to GitHub.

## API Endpoint Documentation

Base URL: `http://localhost:5000`

| Route | Method | Access |
|-------|--------|--------|
| /api/user/register | POST | Public |
| /api/user/login | POST | Public |
| /api/posts | GET | Public |
| /api/posts | POST | Protected |
| /api/posts/dashboard | GET | Protected |
| /api/posts/:id | PUT | Protected |
| /api/posts/:id | DELETE | Protected |
| /api/posts/:postId/comments | GET | Public (private post: owner only) |
| /api/posts/:postId/comments | POST | Protected |
| /api/posts/comments/:id | DELETE | Protected (owner only) |

### Register a new user (Public)

- Method: `POST`
- URL: `/api/user/register`
- Request body:

  ```json
  {
    "name": "Subrat",
    "email": "subrat@test.com",
    "password": "123456"
  }
  ```

### Login (Public)

- Method: `POST`
- URL: `/api/user/login`
- Request body:

  ```json
  {
    "email": "subrat@test.com",
    "password": "123456"
  }
  ```

Both routes return a JWT token. Save this token, it is needed for the protected routes.

### Get all public posts (Public)

- Method: `GET`
- URL: `/api/posts`

### Create a new post (Protected)

- Method: `POST`
- URL: `/api/posts`
- Header: `Authorization: Bearer <your_token>`
- Request body:

  ```json
  {
    "title": "My first blog",
    "content": "This is the content of my post",
    "isPrivate": false
  }
  ```

### Get my own posts / dashboard (Protected)

- Method: `GET`
- URL: `/api/posts/dashboard`
- Header: `Authorization: Bearer <your_token>`
- Returns all the logged in user's posts (both public and private).

### Update a post (Protected)

- Method: `PUT`
- URL: `/api/posts/:id`
- Header: `Authorization: Bearer <your_token>`
- Only the author of the post can update it.
- Request body (send whatever you want to change):

  ```json
  {
    "title": "My updated title",
    "content": "Updated content",
    "isPrivate": true
  }
  ```

### Delete a post (Protected)

- Method: `DELETE`
- URL: `/api/posts/:id`
- Header: `Authorization: Bearer <your_token>`
- Only the author of the post can delete it.

### Get comments for a post (Public for public posts)

- Method: `GET`
- URL: `/api/posts/:postId/comments`
- For private posts, only the author can see the comments (send the Bearer token).
- Returns an array of comments, each with `{ _id, content, author: { name }, createdAt }`.

### Add a comment to a post (Protected)

- Method: `POST`
- URL: `/api/posts/:postId/comments`
- Header: `Authorization: Bearer <your_token>`
- Comments are only allowed on **public** posts (private posts return `403`).
- Request body:

  ```json
  {
    "content": "Nice post!"
  }
  ```

### Delete a comment (Protected)

- Method: `DELETE`
- URL: `/api/posts/comments/:id`
- Header: `Authorization: Bearer <your_token>`
- Only the author of the comment can delete it.

---

## Frontend - How to Set Up and Run the Client Locally

1. Make sure the backend server is already running (see the backend section above).

2. Go into the client folder:

   ```
   cd client
   ```

3. Install the dependencies:

   ```
   npm install
   ```

4. If your backend runs on a different URL, edit the `baseURL` in
   `client/src/api/axios.js` (default is `http://localhost:5000/api`).

5. Start the dev server:

   ```
   npm run dev
   ```

   If everything is fine you will see the Vite dev server URL
   (default: `http://localhost:5173`) and the app will open in the browser.

## Tech Stack (Client)

- **React 19** - UI library
- **Vite** - dev server and build tool (fast hot reload)
- **Material-UI (MUI)** - ready-made components (Button, Card, TextField, etc.)
- **React Router DOM** - client-side routing
- **Axios** - HTTP requests to the backend

## Client .env Variables (optional)

The frontend does not strictly require a `.env` file. By default it talks to the
backend at `http://localhost:5000/api`, which is hardcoded in
`client/src/api/axios.js`.

If your backend runs on a different URL, edit the `baseURL` value in that file:

```js
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});
```

Note: Never commit your real secrets or production URLs to GitHub.

## Frontend Folder Structure

```
client/src/
├── main.jsx              ← app entry; Router + AuthProvider + ThemeProvider wrap here
├── App.jsx               ← all routes (URL -> page mapping)
├── theme.js              ← custom MUI theme
│
├── api/
│   └── axios.js          ← axios instance: baseURL + token auto-attach interceptor
│
├── context/
│   └── AuthContext.jsx   ← login/logout functions + token/user global state
│
├── components/           ← reusable UI pieces
│   ├── Navbar.jsx        ← top bar: Home / Dashboard / Login / Logout buttons
│   ├── PostCard.jsx      ← one post displayed as a card (title, content, edit/delete)
│   ├── Comments.jsx      ← comment list + add/delete comment
│   └── ProtectedRoute.jsx ← guard: no token -> redirect to Home
│
└── pages/                ← full screens mapped to routes
    ├── Home.jsx          ← PUBLIC feed (route "/")
    ├── Login.jsx         ← route "/login"
    ├── Register.jsx      ← route "/register"
    └── Dashboard.jsx     ← PRIVATE dashboard (route "/dashboard") + create/edit/delete
```

## Frontend Pages and Routes

| Route | Page | Access |
|-------|------|--------|
| / | Home | Public |
| /login | Login | Public |
| /register | Register | Public |
| /dashboard | Dashboard | Protected (login required) |

### Home (Public)

- Route: `/`
- Shows all public posts fetched from `GET /api/posts`.
- No login required. A "Get Started" button links to Register if not logged in.

### Login (Public)

- Route: `/login`
- Form with email and password.
- Sends `POST /api/user/login` and saves the returned token via AuthContext.
- On success the user is redirected to `/dashboard`.

### Register (Public)

- Route: `/register`
- Form with name, email, and password.
- Sends `POST /api/user/register` and saves the returned token via AuthContext.
- On success the user is redirected to `/dashboard`.

### Dashboard (Protected)

- Route: `/dashboard`
- Only accessible when logged in (ProtectedRoute checks for a token).
- Shows the logged-in user's own posts (public + private) from
  `GET /api/posts/dashboard`.
- Create a new post with a form (title, content, and a "Make this post private"
  checkbox).
- Edit and delete existing posts. Updates apply immediately in local state.

## How the Frontend Works (Quick Summary)

- **Auth:** On login/register the backend returns a JWT token. The token is saved in
  `localStorage` and the logged-in user is kept in React `AuthContext`. An Axios
  request interceptor automatically attaches the token to every outgoing request
  (`Authorization: Bearer <token>`).
- **Public vs Private:** The Home page (`/`) shows only public posts (no login needed).
  The Dashboard (`/dashboard`, protected) shows the logged-in user's own posts (public
  and private) with create/edit/delete. A checkbox on the create form toggles the
  `isPrivate` flag.
- **Comments:** Each public post card has a "Show Comments" toggle. Logged-in users can
  add and delete their own comments. Private posts do not allow comments.
- **Optimistic UI:** After editing or deleting a post/comment, the list is updated in
  local state immediately (no full page reload).
- **Protected Routes:** `ProtectedRoute` checks for a logged-in user; if absent it
  redirects to Home. On a `401` from any protected API call, the Axios response
  interceptor clears the token and redirects to Home.

## Available Scripts (Client)

| Script | What it does |
|--------|--------------|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Build the production bundle in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint over the source |

## Notes

- Start the backend before the frontend so the API calls work.
- Never commit your real `.env` file or actual secrets to GitHub.
- The backend CORS is configured to allow the default client URL
  (`http://localhost:5173`). If you change the client port, update `CLIENT_URL` in
  `server/.env`.
