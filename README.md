# Raw Node.js CRUD API Server

A simple yet complete RESTful CRUD API built from scratch using **only the raw, built-in Node.js `http` module**. This project was undertaken as a deep-dive learning exercise to master the fundamentals of Node.js without the aid of frameworks like Express.

---

## The Challenge

The goal was to build a fully functional API server that could perform all four CRUD (Create, Read, Update, Delete) operations for a list of users. The key constraint was to use zero external dependencies (`npm` packages) to gain a foundational understanding of how Node.js handles HTTP requests, routing, request bodies, and responses.

---

## The Journey: From Failure to Functionality

This project was built step-by-step, and the journey was filled with real-world challenges that required critical thinking and debugging to overcome.

### V1: The First Server & The `ERR_CONNECTION_REFUSED` Hurdle

The initial step was to create a basic server that could listen for connections. However, a persistent `ERR_CONNECTION_REFUSED` error plagued the early stages of development. This error indicated that the server process was not running, even when it seemed to be launched correctly.

This led to a critical realization about development workflows. Running the server (`node app.js`) and the interactive development assistant in the same terminal was impossible. One would always block the other.

### The Solution: A Professional Workflow with `tmux`

The breakthrough came with the implementation of a professional-grade development workflow using **`tmux`**, a terminal multiplexer.

1.  **Problem:** The server process needed to run persistently in the background, but attempts to do so with `&` failed silently.
2.  **Solution:** `tmux` was used to create a detached, persistent session in the background. The Node.js server was then started *inside* this `tmux` session.
3.  **Outcome:** This provided a stable, isolated environment for the server to run, freeing up the main terminal for continued development and testing. This solved the connection errors permanently and established a robust, scalable development workflow.

### V2: Implementing "Read" (GET)

With a stable server, the "Read" functionality was implemented:
- `GET /api/users`: Returns the full list of users.
- `GET /api/users/:id`: Returns a single user by their ID. This required learning how to parse the URL (`req.url`) to extract the ID parameter.

### V3: Implementing "Create" (POST) & The In-Memory Bug

Implementing the "Create" functionality (`POST /api/users`) introduced a new level of complexity: handling asynchronous request bodies.
- The Node.js `http` module streams request data in chunks. Event listeners (`req.on('data', ...)` and `req.on('end', ...)`) were used to assemble these chunks into a complete JSON string, which was then parsed.

During testing, a bug was discovered: newly created users would sometimes disappear. The root cause was twofold:
1.  **`nodemon` Restarts:** The `nodemon` tool, used for auto-restarting the server, would reset the application state on every file change.
2.  **In-Memory Data:** Because the `users` array is stored in memory, it was wiped clean on every server restart. This taught a valuable lesson about the ephemeral nature of in-memory storage.
3.  **Flawed ID Generation:** The initial logic to create a new ID was based on the current maximum ID. This proved to be unreliable when the server restarted.

### The Fix: Robust ID Generation

The bug was fixed by refactoring the ID generation logic. A simple, top-level counter (`let nextUserId = 4;`) was introduced. This counter persists for the life of the server process and simply increments, providing a predictable and robust way to assign unique IDs, even if other users are deleted.

### V4: Implementing "Update" (PUT) & "Delete" (DELETE)

The final pieces of the CRUD puzzle were put into place:
- **`PUT /api/users/:id`**: Combines the logic of finding a user by ID and parsing a request body to update an existing user's data.
- **`DELETE /api/users/:id`**: Finds a user by ID and removes them from the `users` array using `Array.prototype.splice()`. This route returns a `204 No Content` status, which is the standard for a successful deletion with no data to return.

The final refactoring organized all logic into small, single-purpose functions, making the code clean, readable, and easy to maintain.

---

## Core Concepts Learned

*   **Node.js `http` Module:** Deep understanding of `http.createServer`, the `req` (IncomingMessage), and `res` (ServerResponse) objects.
*   **Request/Response Lifecycle:** Manually handling headers, status codes, and response bodies.
*   **Asynchronous Programming:** Handling streaming request bodies with `'data'` and `'end'` events.
*   **Routing from Scratch:** Implementing a router by parsing `req.method` and `req.url`.
*   **Development Workflow:** The critical importance of a stable workflow using tools like `tmux` to manage background processes.
*   **State Management:** The difference between persistent and ephemeral in-memory storage and its implications.
*   **Debugging:** Tracing bugs from high-level symptoms (`ERR_CONNECTION_REFUSED`, `404 Not Found`) to their root causes in code logic and environment setup.

---

## API Endpoints & How to Test

**Prerequisites:** Your server should be running (`node app.js`).

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
