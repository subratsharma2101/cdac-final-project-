# Blogging App - Backend

## How to Set Up and Run the Server Locally

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
