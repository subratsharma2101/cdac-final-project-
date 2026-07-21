# Blogging App - Backend (MERN)

This is the backend for a full-stack blogging application built with the MERN stack.
Users can read public posts without logging in, but they need to register and log in
to create their own posts. Each post can be made Public or Private.

## Tech Used

- Node.js + Express.js
- MongoDB (Mongoose)
- JWT for authentication
- bcryptjs for password hashing

## How to Run Locally

1. Clone the repo and go into the server folder:

   ```
   cd server
   ```

2. Install the dependencies:

   ```
   npm install
   ```

3. Create a `.env` file inside the `server` folder (see the variables below).

4. Make sure MongoDB is running on your machine (or use a MongoDB Atlas URL).

5. Start the server:

   ```
   npm run dev
   ```

   If everything is fine you will see `Server running on port 5000` and `MongoDB connected`.

## Environment Variables

Create a `.env` file in the `server` folder with these variables:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Note: Never commit your real `.env` file or actual secrets to GitHub. It is already
added to `.gitignore`.

## API Endpoints

Base URL: `http://localhost:5000`

### User Routes (public)

**Register a new user**

- `POST /api/user/register`
- Body:

  ```json
  {
    "name": "Subrat",
    "email": "subrat@test.com",
    "password": "123456"
  }
  ```

**Login**

- `POST /api/user/login`
- Body:

  ```json
  {
    "email": "subrat@test.com",
    "password": "123456"
  }
  ```

Both of these return a JWT token. Save this token, you need it for the protected routes.

### Post Routes

**Get all public posts (public - no login needed)**

- `GET /api/posts`

**Create a new post (protected - login needed)**

- `POST /api/posts`
- Header: `Authorization: Bearer <your_token>`
- Body:

  ```json
  {
    "title": "My first blog",
    "content": "This is the content of my post",
    "isPrivate": false
  }
  ```

**Get my own posts / dashboard (protected - login needed)**

- `GET /api/posts/dashboard`
- Header: `Authorization: Bearer <your_token>`
- Returns all the logged in user's posts (both public and private).

## Public vs Protected Routes

| Route | Method | Access |
|-------|--------|--------|
| /api/user/register | POST | Public |
| /api/user/login | POST | Public |
| /api/posts | GET | Public |
| /api/posts | POST | Protected (token needed) |
| /api/posts/dashboard | GET | Protected (token needed) |
