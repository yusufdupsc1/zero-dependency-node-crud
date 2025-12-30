# Raw Node.js CRUD API Server

A simple yet complete RESTful CRUD API built from scratch using **only the raw, built-in Node.js `http` module**. This project was undertaken as a deep-dive learning exercise to master the fundamentals of Node.js without the aid of frameworks like Express.

---

## The Challenge

The goal was to build a fully functional API server that could perform all four CRUD (Create, Read, Update, Delete) operations for a list of users. The key constraint was to use zero external dependencies to gain a foundational understanding of how Node.js handles HTTP requests, routing, request bodies, and responses.

---

## Core Concepts Learned

*   **Node.js `http` Module:** Deep understanding of `http.createServer`, the `req` (IncomingMessage), and `res` (ServerResponse) objects.
*   **Request/Response Lifecycle:** Manually handling headers, status codes, and response bodies.
*   **Asynchronous Programming:** Handling streaming request bodies with `'data'` and `'end'` events.
*   **Routing from Scratch:** Implementing a router by parsing `req.method` and `req.url`.
*   **Development Workflow:** The critical importance of a stable workflow to manage background processes.
*   **State Management:** The difference between persistent and ephemeral in-memory storage and its implications.
*   **Debugging:** Tracing bugs from high-level symptoms to their root causes in code logic and environment setup.

---

## Setup and Running the Server

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/zero-dependency-node-crud.git
    cd zero-dependency-node-crud
    ```

2.  **Install Dependencies:**
    This project has no external dependencies listed in `package.json`. However, to ensure a consistent development environment, you can run:
    ```bash
    npm install
    ```

3.  **Run the server:**
    ```bash
    node app.js
    ```
    The server will start and listen on `http://localhost:3000`.

    **Note on `database.json`:** This file is used to simulate a database and is not committed to the repository (as specified in the `.gitignore` file). The server will create it automatically if it doesn't exist.

---

## API Endpoints & How to Test

**Prerequisites:** Your server must be running (`node app.js`).

**1. GET all users**
```bash
curl http://localhost:3000/api/users
```

**2. GET a single user**
```bash
curl http://localhost:3000/api/users/2
```

**3. CREATE a new user**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"name": "Diana"}' http://localhost:3000/api/users
```

**4. UPDATE an existing user**
```bash
curl -X PUT -H "Content-Type: application/json" -d '{"name": "Alice Smith"}' http://localhost:3000/api/users/1
```

**5. DELETE a user**
```bash
curl -X DELETE http://localhost:3000/api/users/3
```