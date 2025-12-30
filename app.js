/*
 * app.js: A simple, raw Node.js CRUD API server with zero dependencies.
 * This file demonstrates the core concepts of Node.js's http module.
 */

const http = require('http');

// ============================================================================
//  IN-MEMORY DATABASE
// ============================================================================
// In a real application, this data would live in a database (e.g., PostgreSQL, MongoDB).
// For this learning exercise, we use a simple in-memory array.
// Note: This data resets every time the server restarts.

let users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
];

// A simple counter for generating unique IDs for new users.
// We start at 4 because we already have 3 users.
let nextUserId = 4;

// ============================================================================
//  HELPER FUNCTIONS
// ============================================================================

/**
 * Parses the JSON body of a request.
 * @param {http.IncomingMessage} req - The request object.
 * @returns {Promise<object>} A promise that resolves with the parsed JSON object.
 */
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        // Handle empty body case
        if (body === '') {
          resolve({});
          return;
        }
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * A helper function to send a JSON response.
 * @param {http.ServerResponse} res - The response object.
 * @param {number} statusCode - The HTTP status code.
 * @param {object} data - The JavaScript object to send as JSON.
 */
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// ============================================================================
//  ROUTE HANDLERS
// ============================================================================

// --- GET /api/users ---
function getAllUsers(req, res) {
  sendJSON(res, 200, users);
}

// --- GET /api/users/:id ---
function getUserById(req, res, id) {
  const user = users.find(u => u.id === id);
  if (user) {
    sendJSON(res, 200, user);
  } else {
    sendJSON(res, 404, { message: 'User Not Found' });
  }
}

// --- POST /api/users ---
async function createUser(req, res) {
  try {
    const newUser = await parseRequestBody(req);

    if (!newUser.name) {
      return sendJSON(res, 400, { message: 'Name is a required field' });
    }

    newUser.id = nextUserId++; // Assign a new ID from our counter
    users.push(newUser);
    sendJSON(res, 201, newUser); // 201 Created
  } catch (error) {
    sendJSON(res, 400, { message: error.message });
  }
}

// --- PUT /api/users/:id ---
async function updateUser(req, res, id) {
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return sendJSON(res, 404, { message: 'User Not Found' });
  }

  try {
    const updatedData = await parseRequestBody(req);

    if (!updatedData.name) {
      return sendJSON(res, 400, { message: 'Name is a required field' });
    }

    // Update the user's name
    users[userIndex].name = updatedData.name;
    sendJSON(res, 200, users[userIndex]);
  } catch (error) {
    sendJSON(res, 400, { message: error.message });
  }
}

// --- DELETE /api/users/:id ---
function deleteUser(req, res, id) {
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex !== -1) {
    users.splice(userIndex, 1); // Remove the user from the array
    res.writeHead(204, { 'Content-Type': 'application/json' }); // 204 No Content
    res.end();
  } else {
    sendJSON(res, 404, { message: 'User Not Found' });
  }
}

// ============================================================================
//  SERVER & ROUTER
// ============================================================================

const server = http.createServer((req, res) => {
  const { method, url } = req;
  const urlParts = url.split('/'); // e.g., ['', 'api', 'users', '1']

  // Log every request for debugging
  console.log(`Incoming Request: ${method} ${url}`);

  // --- Main Router Logic ---
  if (method === 'GET' && url === '/api/users') {
    getAllUsers(req, res);
  } else if (method === 'GET' && url.startsWith('/api/users/')) {
    const id = parseInt(urlParts[3]);
    getUserById(req, res, id);
  } else if (method === 'POST' && url === '/api/users') {
    createUser(req, res);
  } else if (method === 'PUT' && url.startsWith('/api/users/')) {
    const id = parseInt(urlParts[3]);
    updateUser(req, res, id);
  } else if (method === 'DELETE' && url.startsWith('/api/users/')) {
    const id = parseInt(urlParts[3]);
    deleteUser(req, res, id);
  } else {
    // Handle homepage or any other route as a 404
    sendJSON(res, 404, { message: `Route not found for ${method} ${url}` });
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
