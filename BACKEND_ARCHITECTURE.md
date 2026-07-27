# 🏗️ BACKEND ARCHITECTURE & FLOW — MERN Blogging App

> Backend ek **Node.js + Express** REST API hai jo **MongoDB** (Mongoose ODM ke saath)
> se baat karti hai. Yeh `FRONTEND_ARCHITECTURE.md` ka counterpart hai — yaha hum
> server-side ka poora design samjhenge.

---

## 📑 Table of Contents
1. [Tech Stack & Dependencies](#part-1)
2. [Folder Structure](#part-2)
3. [Request Lifecycle (Ek Request ka Safar)](#part-3)
4. [Database Design — Mongoose Models](#part-4)
5. [Authentication System (JWT + bcrypt)](#part-5)
6. [API Endpoints Reference](#part-6)
7. [Middleware — `protect`](#part-7)
8. [Post CRUD Flow (Owner-Only)](#part-8)
9. [Comment System Flow](#part-9)
10. [Public vs Private Logic (Core Rule)](#part-10)
11. [Environment Variables](#part-11)
12. [How to Run the Server](#part-12)
13. [Interview Q&A (Backend)](#part-13)
14. [Key Terms Glossary](#part-14)

---

<a name="part-1"></a>
## 🧰 Part 1 — Tech Stack & Dependencies

`server/package.json` mein ye libraries use hui hain:

| Package | Version | Kaam |
|---------|---------|------|
| **express** | ^4.19.2 | Web framework — HTTP routes handle karta hai |
| **mongoose** | ^8.4.0 | MongoDB ODM — schema + queries ka easier interface |
| **bcryptjs** | ^2.4.3 | Password hashing (plaintext kabhi store nahi) |
| **jsonwebtoken** | ^9.0.2 | JWT token banana aur verify karna |
| **cors** | ^2.8.5 | Cross-origin requests allow (React ↔ Express) |
| **dotenv** | ^16.4.5 | `.env` file se secrets load karna |
| **nodemon** (dev) | ^3.1.0 | File change pe server auto-restart |

**Scripts:**
```bash
npm run dev   # nodemon — development mode (auto reload)
npm start     # node server.js — production mode
```

> **English:** *The backend is a stateless Express REST API. Mongoose models define the
> data shape in MongoDB, bcrypt hashes passwords, and JWT provides stateless auth.*

---

<a name="part-2"></a>
## 🗂️ Part 2 — Folder Structure

```
server/
├── server.js                  ← Entry point: app setup, middleware, route mounting, listen
├── package.json               ← dependencies + scripts
├── .env                       ← secrets (MONGO_URI, JWT_SECRET, PORT, CLIENT_URL)
│
├── config/
│   └── db.js                  ← MongoDB connection logic (connectDB)
│
├── models/                    ← Mongoose schemas (data shape)
│   ├── User.js                ← name, email, password (+ bcrypt hooks)
│   ├── Post.js                ← title, content, isPrivate, author(ref User)
│   └── Comment.js             ← content, author(ref), post(ref)
│
├── routes/                    ← URL → controller mapping (thin layer)
│   ├── userRoutes.js          ← /api/user (register, login)
│   ├── postRoutes.js          ← /api/posts (CRUD + dashboard)
│   └── commentRoutes.js       ← /api/posts (nested comments)
│
├── controllers/               ← Business logic (fat layer)
│   ├── userController.js      ← register, login, token generation
│   ├── postController.js      ← createPost, getPublicPosts, getMyPosts, update, delete
│   └── commentController.js   ← addComment, getComments, deleteComment
│
└── middleware/
    └── auth.js                ← `protect` — JWT verify middleware
```

**Layered architecture (request ka rasta):**
```
HTTP Request → Route → [Middleware] → Controller → Model → MongoDB
                                                       ▲
                                                       │
                                       Response wapas same path se aati hai
```

> **English:** *Routes map URLs to controller functions; controllers contain business
> logic and use Mongoose models to read/write MongoDB. Middleware sits between route
> and controller for cross-cutting concerns like authentication.*

---

<a name="part-3"></a>
## 🔄 Part 3 — Request Lifecycle (Ek Request ka Safar)

Maan lo frontend ne bheja: `GET /api/posts/dashboard` (with Bearer token).

```
1. Express server (server.js) request receive karta hai
        │
        ▼
2. Global middleware chalte hain (order matters):
   ┌─ cors({ origin: CLIENT_URL })   → origin check
   └─ express.json()                → body ko JSON parse
        │
        ▼
3. Route matching: "/api/posts" → postRoutes.js load
        │
        ▼
4. "/dashboard" → protect middleware (auth.js)
   ┌─ Authorization header se token nikalo
   ├─ jwt.verify(token, JWT_SECRET)
   ├─ valid → req.userId = decoded.id, next()
   └─ invalid/missing → 401 Unauthorized
        │
        ▼
5. Controller: getMyPosts (postController.js)
   └─ Post.find({ author: req.userId }) → MongoDB query
        │
        ▼
6. MongoDB documents return karta hai
        │
        ▼
7. res.json(posts) → JSON response frontend ko bhej di
```

> **English:** *Every request flows through global middleware, route matching, optional
> route middleware, the controller, then the model/DB — and the response comes back the
> same way as JSON.*

---

<a name="part-4"></a>
## 🗄️ Part 4 — Database Design — Mongoose Models

Teen collections hain MongoDB mein: **users**, **posts**, **comments**.

### User Model — `models/User.js`
```js
{
  name:     String,  required
  email:    String,  required, unique   // index automatically
  password: String,  required          // hashed (never plaintext)
}
```
**Hooks:**
- `pre("save")` — password modify hua to bcrypt se hash karke store.
- `matchPassword(entered)` — instance method, `bcrypt.compare` se verify.

> Password kabhi plain text mein DB mein nahi jata. `pre-save` hook automatically
> hash banata hai jab bhi user save hota hai (register ya password change).

### Post Model — `models/Post.js`
```js
{
  title:     String,  required
  content:   String,  required
  isPrivate: Boolean, default: false    // 👈 project ka core flag
  author:    ObjectId, ref: "User", required
}
// timestamps: true → createdAt, updatedAt auto-add hote hain
```

### Comment Model — `models/Comment.js`
```js
{
  content: String,  required
  author:  ObjectId, ref: "User",  required
  post:    ObjectId, ref: "Post",  required
}
// timestamps: true
```

**Relationships (ref-based, relational nahi but reference se):**
```
User 1 ────< Post N        (ek user ke kai posts)
Post 1 ────< Comment N     (ek post pe kai comments)
User 1 ────< Comment N     (ek user ke kai comments)
```

> **English:** *Mongoose uses references (ObjectId + `ref`) instead of true joins.
> `.populate()` is used to fetch referenced documents (e.g., post's author name).*

---

<a name="part-5"></a>
## 🔐 Part 5 — Authentication System (JWT + bcrypt)

### Register Flow — `userController.register`
```
POST /api/user/register  { name, email, password }
        │
        ▼
1. Validate: teeno fields required? nahi → 400
        │
        ▼
2. User.findOne({ email }) → already exists? → 400
        │
        ▼
3. User.create({ ... }) → pre-save hook password hash karta hai
        │
        ▼
4. generateToken(user._id):
   jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE || "1h" })
        │
        ▼
5. Response 201: { _id, name, email, token }
```

### Login Flow — `userController.login`
```
POST /api/user/login  { email, password }
        │
        ▼
1. User.findOne({ email }) → user nahi mila? → 401
        │
        ▼
2. user.matchPassword(password):
   bcrypt.compare(entered, storedHash) → false? → 401
        │
        ▼
3. Sahi → generateToken(user._id)
        │
        ▼
4. Response 200: { _id, name, email, token }
```

**Token structure (JWT):**
```
Header.Payload.Signature
       │
       └─ { id: <userId>, iat: <issued>, exp: <expiry> }
```
- Token **stateless** hai — server pe koi session store nahi karta.
- Har protected request mein yeh token `Authorization: Bearer <token>` header mein aata hai.

> **English:** *Authentication is stateless. On register/login the server verifies
> credentials and issues a signed JWT. The token (not the password) is stored client-side
> and sent with each protected request.*

---

<a name="part-6"></a>
## 📡 Part 6 — API Endpoints Reference

Sabhi routes `server.js` se mount hote hain:

```js
app.use("/api/user",  require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/posts", require("./routes/commentRoutes")); // nested under posts
```

### Auth Routes (`userRoutes.js`)
| Method | Endpoint | Protected | Handler | Response |
|--------|----------|:---:|---------|----------|
| POST | `/api/user/register` | ❌ | `register` | `201 { _id, name, email, token }` |
| POST | `/api/user/login` | ❌ | `login` | `200 { _id, name, email, token }` |

### Post Routes (`postRoutes.js`)
| Method | Endpoint | Protected | Handler | Response |
|--------|----------|:---:|---------|----------|
| GET | `/api/posts` | ❌ | `getPublicPosts` | `[ {post, author:{name}} ]` |
| GET | `/api/posts/dashboard` | ✅ | `getMyPosts` | `[ {post} ]` (sirf apne) |
| POST | `/api/posts` | ✅ | `createPost` | `201 { post }` |
| PUT | `/api/posts/:id` | ✅ | `updatePost` | `{ updated post }` |
| DELETE | `/api/posts/:id` | ✅ | `deletePost` | `{ message: "Post deleted" }` |

### Comment Routes (`commentRoutes.js`) — nested under `/api/posts`
| Method | Endpoint | Protected | Handler | Response |
|--------|----------|:---:|---------|----------|
| GET | `/api/posts/:postId/comments` | ⚠️ soft | `getComments` | `[ {comment, author:{name}} ]` |
| POST | `/api/posts/:postId/comments` | ✅ | `addComment` | `201 { comment }` |
| DELETE | `/api/posts/comments/:id` | ✅ | `deleteComment` | `{ message }` |

> **Note:** `getComments` route `protect` middleware use nahi karta — kyunki public
> posts ke comments bina login dekhne laayak hain. Lekin **private post** ke comments
> sirf owner ko milte hain (controller ke andar manual token check).

---

<a name="part-7"></a>
## 🛡️ Part 7 — Middleware — `protect`

File: `middleware/auth.js`

```js
const protect = (req, res, next) => {
  let token;
  // 1. Header se "Bearer xxx" format mein token nikalo
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  // 2. Token nahi → 401
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });
  // 3. Verify → req.userId set → next()
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;   // 👈 controllers isse use karte hain
    next();
  } catch {
    return res.status(401).json({ message: "token not authorized, auth failed" });
  }
};
```

**Kyunki yeh middleware `req.userId` set karta hai, controllers ko pata chal jaata hai
ki request kis user ne bheji hai — DB query mein `author: req.userId` use hota hai.**

> **English:** *`protect` is a reusable Express middleware. It extracts and verifies the
> JWT from the Authorization header, then attaches `req.userId` for downstream controllers
> to identify the authenticated user.*

---

<a name="part-8"></a>
## ✏️ Part 8 — Post CRUD Flow (Owner-Only)

### Create — `createPost`
```
POST /api/posts  { title, content, isPrivate }
protect middleware → req.userId milta hai
Post.create({ ..., author: req.userId })
201 response
```

### Read Public — `getPublicPosts`
```
GET /api/posts  (no auth)
Post.find({ isPrivate: false })
   .populate("author", "name")      // author ka sirf naam chahiye
   .sort({ createdAt: -1 })        // newest pehle
```

### Read My Posts — `getMyPosts`
```
GET /api/posts/dashboard  (protected)
Post.find({ author: req.userId }).sort({ createdAt: -1 })
// sirf meri posts, public + private dono
```

### Update — `updatePost` (ownership check)
```
PUT /api/posts/:id  (protected)
1. Post.findById(id) → nahi mila → 404
2. post.author.toString() !== req.userId → 403 (sirf owner edit kar sakta hai)
3. Optional fields update (title, content, isPrivate)
4. post.save() → response
```

### Delete — `deletePost` (ownership check)
```
DELETE /api/posts/:id  (protected)
1. Post.findById(id) → nahi mila → 404
2. post.author.toString() !== req.userId → 403
3. post.deleteOne() → { message: "Post deleted" }
```

**Important pattern:** Update aur delete dono mein **ownership check** hai — koi doosre
ki post edit/delete nahi kar sakta, even with valid token.

> **English:** *Post mutations are owner-scoped. After auth, the controller verifies
> `post.author === req.userId` before allowing edits/deletes, returning 403 otherwise.
> This is authorization (not authentication) — a common interview distinction.*

---

<a name="part-9"></a>
## 💬 Part 9 — Comment System Flow

Comments public posts pe allowed hain, nested under posts.

### Add Comment — `addComment` (protected)
```
POST /api/posts/:postId/comments  { content }
1. Post.findById(postId) → nahi mila → 404
2. post.isPrivate === true → 403 (comments sirf public posts pe)
3. Comment.create({ content, author: req.userId, post: postId })
4. comment.populate("author", "name")
5. 201 response
```

### Get Comments — `getComments` (semi-public)
```
GET /api/posts/:postId/comments
1. Post.findById(postId) → nahi mila → 404
2. Agar post public hai → saare comments bhej do
3. Agar post private hai:
   - Authorization header se manually token verify karo
   - requesterId === post.author? nahi → 403
4. Comment.find({ post: postId }).populate("author","name").sort({ createdAt: 1 })
```

**Interesting design choice:** Yaha `protect` middleware use nahi kiya gaya, kyunki
public posts ke comments anonymous user ko bhi dikhne chahiye. Private post case
controller ke andar manually handle hota hai. Yeh ek **hybrid/conditional auth** pattern
hai.

### Delete Comment — `deleteComment` (protected)
```
DELETE /api/posts/comments/:id
1. Comment.findById(id) → nahi mila → 404
2. comment.author !== req.userId → 403 (sirf apna comment delete)
3. comment.deleteOne() → { message: "Comment deleted" }
```

> **English:** *Comments are nested under posts. Adding requires auth and only public
> posts allow comments. Fetching is public for public posts but owner-restricted for
> private posts via manual token verification inside the controller.*

---

<a name="part-10"></a>
## 🌐 Part 10 — Public vs Private Logic (Core Rule)

Project ka central idea — har post ek visibility flag ke saath aata hai.

```
                    isPrivate: false              isPrivate: true
                    (PUBLIC)                       (PRIVATE)
                         │                              │
   ┌─────────────────────┴──────────┐    ┌───────────────┴──────────────┐
   │ Home feed (GET /api/posts)     │    │ Sirf owner ke Dashboard pe     │
   │ sabko dikhega (no login)       │    │ (GET /api/posts/dashboard)     │
   │ Comments allowed              │    │ Comments BLOCKED (403)          │
   └────────────────────────────────┘    └────────────────────────────────┘
```

**Backend enforcement points:**
1. `getPublicPosts` → `Post.find({ isPrivate: false })` — filter laga hua.
2. `getMyPosts` → `Post.find({ author: req.userId })` — author ki saari posts.
3. `addComment` → `if (post.isPrivate) return 403` — comment block.
4. `getComments` → private post pe sirf owner ko comments dikhata hai.

> **English:** *The `isPrivate` boolean is enforced at every read/comment endpoint.
> Public posts are open to everyone; private posts are restricted to their author.*
>
> ⚠️ Note: There's no separate admin role — only ownership-based access control.

---

<a name="part-11"></a>
## 🔑 Part 11 — Environment Variables

`.env` file (gitti mein commit NAHI hota — `.gitignore` mein hai):

| Variable | Use |
|----------|-----|
| `MONGO_URI` | MongoDB connection string (`mongodb://localhost:27017/...` ya Atlas URI) |
| `JWT_SECRET` | Token sign/verify karne ka secret — kabhi bhi public mat karo |
| `JWT_EXPIRE` | Token expiry (default `"1h"` agar set na ho) |
| `PORT` | Server port (default `5000`) |
| `CLIENT_URL` | Frontend URL — CORS ke liye allow (`http://localhost:5173`) |

**Defaults (code se):**
- `PORT || 5000`
- `JWT_EXPIRE || "1h"`

> **English:** *Secrets live in `.env` (gitignored). Never hardcode `JWT_SECRET` or
> `MONGO_URI` in source. Use `process.env.*` everywhere.*

---

<a name="part-12"></a>
## ▶️ Part 12 — How to Run the Server

```bash
cd server
npm install                 # dependencies install
# .env file banao (MONGO_URI, JWT_SECRET, PORT, CLIENT_URL)
npm run dev                 # nodemon — development
# ya
npm start                   # production
```

MongoDB chalu hona chahiye (local ya Atlas). Server chalu hote hi:
```
Server running on port 5000
MongoDB connected
```

Test: browser pe `http://localhost:5000/` → `"API is running"`.

---

<a name="part-13"></a>
## 🎤 Part 13 — Interview Q&A (Backend)

**Q1. Aapke backend ka architecture kya hai?**
> "Layered architecture hai — `server.js` entry point hai jo Express app banata hai,
> global middleware (cors, json) lagata hai aur routes mount karta hai. Routes controller
> functions ko call karte hain, jo Mongoose models ke through MongoDB se baat karte hain.
> Authentication ke liye ek `protect` middleware hai jo JWT verify karta hai."

**Q2. Password ko kaise secure store karte ho?**
> "Plaintext password kabhi save nahi karte. User model mein `pre("save")` hook hai jo
> `bcrypt.genSalt` + `bcrypt.hash` se password hash karta hai. Login pe `bcrypt.compare`
> se verify karte hain — original password kabhi DB se bahar nahi aata."

**Q3. JWT stateless kya matlab?**
> "Server pe koi session ya user record store nahi karta. Sirf token sign karta hai
> secret se, aur har request pe usko verify karta hai. Isse horizontally scale karna
> easy hai kyunki koi shared session state nahi."

**Q4. Authorization vs Authentication kya farak hai?**
> "Authentication = tum kaun ho (token verify via `protect`). Authorization = kya kar
> sakte ho (ownership check — `post.author === req.userId`). Update/delete mein dono
> checks hain — pehle auth, phir owner check."

**Q5. Private posts kaise protect kiye?**
> "`isPrivate` boolean flag hai. `getPublicPosts` sirf `isPrivate:false` laata hai.
> `getMyPosts` author filter lagata hai. Comments private posts pe blocked hain. Isse
> owner ke alawa koi private content nahi dekh sakta."

**Q6. CORS kyu zaroori hai?**
> "React (port 5173) aur Express (port 5000) alag origins hain — browser default
> block karta hai. `cors({ origin: CLIENT_URL })` specific origin allow karta hai
> taaki frontend API call kar sake."

**Q7. `populate` kya karta hai?**
> "Mongoose ka `populate` referenced ObjectId ko actual document se replace karta hai.
> Jaise `Post.find().populate("author","name")` se author ke saath sirf `name` field
> aata hai — JOIN jaisa kaam MongoDB mein."

**Q8. Agar token expire ho jaaye?**
> "`jwt.verify` exception throw karta hai, `protect` middleware catch karta hai aur
> 401 return karta hai. Frontend phir login page pe redirect kar deta hai."

---

<a name="part-14"></a>
## 📖 Part 14 — Key Terms Glossary

| Term | Definition |
|------|-----------|
| **Express** | Minimal Node.js web framework for building REST APIs. |
| **Mongoose** | ODM (Object Data Modeling) library for MongoDB — schema + validation + queries. |
| **ODM** | Object Data Mapper — maps JS objects to DB documents (like ORM for NoSQL). |
| **Middleware** | Function that runs between request and response; can modify req/res or end cycle. |
| **JWT** | JSON Web Token — signed, stateless token carrying user identity. |
| **bcrypt** | Password-hashing library with built-in salt to defeat rainbow-table attacks. |
| **Salt** | Random data added before hashing to make identical passwords hash differently. |
| **Pre-save hook** | Mongoose middleware that runs before a document is saved. |
| **Stateless Auth** | Auth that doesn't store server-side session; relies solely on token validation. |
| **Authorization Header** | HTTP header carrying credentials — `Authorization: Bearer <token>`. |
| **CORS** | Cross-Origin Resource Sharing — browser mechanism to allow/block cross-origin requests. |
| **REST** | Representational State Transfer — HTTP-based API design using verbs (GET/POST/PUT/DELETE). |
| **Ownership check** | Verifying a resource belongs to the requesting user before mutating it. |
| **populate()** | Mongoose method to replace ObjectId references with full documents. |
| **timestamps** | Mongoose option to auto-add `createdAt` and `updatedAt` fields. |
| **dotenv** | Loads environment variables from a `.env` file into `process.env`. |

---

## ✅ Summary

Backend ek **3-collection (User, Post, Comment) MERN REST API** hai:
- **Express** routes → **controllers** → **Mongoose models** → **MongoDB**.
- **bcrypt** se password hashing, **JWT** se stateless auth.
- **`protect` middleware** har protected route pe token verify karta hai aur
  `req.userId` set karta hai.
- **Ownership checks** ensure karte hain ki user sirf apna content edit/delete kare.
- **`isPrivate` flag** public vs private content ka core rule enforce karta hai.

> Companion file: **`FRONTEND_ARCHITECTURE.md`** — frontend (React) side ka design.
