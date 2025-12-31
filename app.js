// app.js: This is the main file for our simple Node.js CRUD API server.
// It's designed to teach you how to build a basic server without using
// any external libraries (like Express.js), focusing only on Node.js's built-in features.

// --- 1. Import Necessary Modules ---

// The 'http' module is Node.js's built-in way to create web servers.
// It allows us to handle incoming requests and send responses.
const http = require('http');

// We're importing two functions, 'readData' and 'writeData', from our
// custom 'fileHandler.js' file. This file (which we'll look at next)
// helps us save and load our user data to/from a 'users.json' file,
// making our data persistent even if the server restarts.
const { readData, writeData } = require('./utils/fileHandler');

// --- 2. Global Application State ---

// This 'users' array will temporarily hold all our user data in memory
// while the server is running. It's declared with 'let' because its
// content will change (users added, updated, deleted), and it will be
// reassigned when data is loaded from 'users.json' at startup.
let users = [];

// ============================================================================
//  3. HELPER FUNCTIONS: Tools to make our main logic cleaner and reusable.
// ============================================================================

/**
 * parseRequestBody: This function helps us read the data sent in the body
 * of incoming HTTP requests (like POST or PUT requests). Data often
 * arrives in small pieces (chunks), so we need to collect them all.
 *
 * @param {http.IncomingMessage} req - The incoming request object. This object
 *                                     contains all information about the client's
 *                                     request, including headers and the body stream.
 * @returns {Promise<object>} - It returns a Promise because reading data
 *                              from a stream is an asynchronous operation.
 *                              The Promise will resolve with the parsed JSON
 *                              object from the request body, or reject if there's
 *                              an error (e.g., invalid JSON).
 */
function parseRequestBody(req) {
  // A Promise represents an operation that hasn't completed yet but is expected.
  // It will eventually either 'resolve' (succeed) with a value, or 'reject' (fail) with an error.
  return new Promise((resolve, reject) => {
    // 'body' is an empty string where we'll accumulate all the incoming data chunks.
    let body = '';

    // 'req.on('data', ...)' listens for 'data' events.
    // The 'data' event fires whenever a new piece (chunk) of the request body arrives.
    req.on('data', (chunk) => {
      // We convert each chunk to a string and add it to our 'body' variable.
      body += chunk.toString();
    });

    // 'req.on('end', ...)' listens for the 'end' event.
    // The 'end' event fires when all parts of the request body have been received.
    req.on('end', () => {
      // We use a 'try...catch' block to handle potential errors.
      // Parsing JSON can fail if the 'body' isn't valid JSON.
      try {
        // If the body is empty, we resolve with an empty JavaScript object.
        // This prevents an error if a POST/PUT request has no body data.
        if (body === '') {
          resolve({}); // Resolve means the Promise succeeded.
          return;      // Exit the function early.
        }
        // If there's data, we try to convert the JSON string into a JavaScript object.
        // Then, we resolve the Promise with this new object.
        resolve(JSON.parse(body));
      } catch (error) {
        // If JSON parsing fails (e.g., malformed JSON), we reject the Promise
        // with an error indicating invalid data.
        reject(new Error('Invalid JSON')); // Reject means the Promise failed.
      }
    });

    // 'req.on('error', ...)' listens for any errors during the request stream itself.
    // This catches lower-level issues like network problems.
    req.on('error', (err) => {
      // If an error occurs, we reject the Promise with that error.
      reject(err);
    });
  });
}

/**
 * sendJSON: This is a helper function to send a standard JSON response
 * back to the client. It sets the correct HTTP headers and formats the data.
 *
 * @param {http.ServerResponse} res - The outgoing response object. We use
 *                                     this object to send data and headers back
 *                                     to the client.
 * @param {number} statusCode - The HTTP status code (e.g., 200 for OK,
 *                               404 for Not Found, 201 for Created).
 *                               This code tells the client the result of their request.
 * @param {object} data - The JavaScript object that we want to send back.
 *                          This object will be converted into a JSON string.
 */
function sendJSON(res, statusCode, data) {
  // 'res.writeHead()' sets the HTTP status code and response headers.
  res.writeHead(statusCode, {
    // 'Content-Type': 'application/json' tells the client that the data
    // we're sending is in JSON format. This is very important for clients
    // (like web browsers or 'curl') to understand how to read the response.
    'Content-Type': 'application/json'
  });
  // 'res.end()' sends the actual response body and signals that the response
  // is complete. It also converts our JavaScript 'data' object into a JSON string.
  res.end(JSON.stringify(data));
}

// ============================================================================
//  4. ROUTE HANDLERS: Functions that respond to specific API requests.
// ============================================================================

// --- GET /api/users ---
// This function handles requests to get all users.
function getAllUsers(req, res) {
  // We use our 'sendJSON' helper to send a 200 OK status
  // and the entire 'users' array as a JSON response.
  sendJSON(res, 200, users);
}

// --- GET /api/users/:id ---
// This function handles requests to get a single user by their ID.
// 'id' is extracted from the URL by the router.
function getUserById(req, res, id) {
  // 'users.find()' looks through the 'users' array for a user
  // whose 'id' property matches the 'id' provided in the URL.
  const user = users.find(u => u.id === id);

  // If a user was found...
  if (user) {
    // ...send a 200 OK status and the user object.
    sendJSON(res, 200, user);
  } else {
    // If no user was found with that ID, send a 404 Not Found error.
    sendJSON(res, 404, { message: 'User Not Found' });
  }
}

// --- POST /api/users ---
// This function handles requests to create a new user.
async function createUser(req, res) {
  // We use 'try...catch' to handle any errors that might occur
  // during the asynchronous operations (like parsing the request body).
  try {
    // 'await parseRequestBody(req)' waits for the entire request body
    // to be read and parsed as JSON. 'newUser' will contain the data
    // for the new user (e.g., { "name": "New User" }).
    const newUser = await parseRequestBody(req);

    // Basic validation: Check if the 'name' property exists in the new user data.
    if (!newUser.name) {
      // If not, send a 400 Bad Request error because the input is invalid.
      return sendJSON(res, 400, { message: 'Name is a required field' });
    }

    // Generate a unique ID for the new user.
    // We find the largest existing ID in our 'users' array and add 1 to it.
    // If the array is empty, max will be 0, so the first ID will be 1.
    const maxId = users.reduce((max, user) => Math.max(max, user.id), 0);
    newUser.id = maxId + 1;

    // Add the newly created user object to our 'users' array.
    users.push(newUser);

    // After modifying the 'users' array, we save it back to 'users.json'.
    // 'await' ensures this write operation completes before we send the response.
    await writeData(users); // This makes our data persistent!

    // Send a 201 Created status and the new user object as a response.
    // 201 is the standard HTTP status for a successful resource creation.
    sendJSON(res, 201, newUser);
  } catch (error) {
    // If any error occurred in the 'try' block (e.g., invalid JSON),
    // send a 400 Bad Request with the error message.
    sendJSON(res, 400, { message: error.message });
  }
}

// --- PUT /api/users/:id ---
// This function handles requests to update an existing user by their ID.
async function updateUser(req, res, id) {
  // Find the index (position) of the user with the matching 'id' in our 'users' array.
  const userIndex = users.findIndex(u => u.id === id);

  // If 'userIndex' is -1, it means no user was found with that ID.
  if (userIndex === -1) {
    // So, we send a 404 Not Found error.
    return sendJSON(res, 404, { message: 'User Not Found' });
  }

  // Use 'try...catch' to handle potential errors during request body parsing.
  try {
    // 'await parseRequestBody(req)' gets the updated data from the request body.
    const updatedData = await parseRequestBody(req);

    // Basic validation: Ensure the 'name' property is present in the updated data.
    if (!updatedData.name) {
      // If not, send a 400 Bad Request error.
      return sendJSON(res, 400, { message: 'Name is a required field' });
    }

    // Update the 'name' property of the found user in our 'users' array.
    users[userIndex].name = updatedData.name;

    // Save the updated 'users' array back to 'users.json' for persistence.
    await writeData(users);

    // Send a 200 OK status and the updated user object as a response.
    sendJSON(res, 200, users[userIndex]);
  } catch (error) {
    // If any error occurred, send a 400 Bad Request.
    sendJSON(res, 400, { message: error.message });
  }
}

// --- DELETE /api/users/:id ---
// This function handles requests to delete a user by their ID.
async function deleteUser(req, res, id) {
  // Find the index (position) of the user with the matching 'id'.
  const userIndex = users.findIndex(u => u.id === id);

  // If a user with that ID was found...
  if (userIndex !== -1) {
    // 'splice(userIndex, 1)' removes one element from the 'users' array
    // starting at the 'userIndex'. This effectively deletes the user.
    users.splice(userIndex, 1);

    // Save the modified 'users' array back to 'users.json'.
    await writeData(users);

    // Send a 204 No Content status. This is standard for successful deletions
    // where there's no content to send back in the response body.
    res.writeHead(204, { 'Content-Type': 'application/json' });
    // 'res.end()' sends the response headers and closes the connection.
    res.end();
  } else {
    // If no user was found, send a 404 Not Found error.
    sendJSON(res, 404, { message: 'User Not Found' });
  }
}

// ============================================================================
//  5. SERVER SETUP & ROUTER: The core logic for handling incoming requests.
// ============================================================================

// Define the port number our server will listen on.
// This is a constant because our server will always use this port.
const PORT = 3000;

/**
 * initializeServer: This asynchronous function sets up our server.
 * It's crucial because it first loads our persistent data and then starts
 * the HTTP server.
 */
async function initializeServer() {
  // Use a 'try...catch' block to handle potential errors during data loading
  // or server startup.
  try {
    // 'await readData()' waits for the 'users.json' file to be read
    // and its content (an array of users) to be parsed.
    // The 'users' global variable is then updated with this persistent data.
    users = await readData();
    console.log('Initial data loaded successfully:', users);

    // 'http.createServer(serverHandler)' creates an HTTP server.
    // 'serverHandler' is the function that will be called every time
    // our server receives an HTTP request.
    // '.listen(PORT, ...)' makes the server start listening for incoming
    // requests on the specified PORT.
    http.createServer(serverHandler).listen(PORT, () => {
      // This message is logged to the console once the server is successfully running.
      console.log(`Server is listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    // If any error occurs during data loading or server startup,
    // we log it and then exit the Node.js process with an error code (1).
    console.error('Failed to load initial data or start server:', error);
    process.exit(1); // 'process.exit(1)' terminates the program with an error status.
  }
}

/**
 * serverHandler: This is the main function that gets called for every
 * incoming HTTP request. It acts as our 'router', deciding which
 * specific 'route handler' function (like getAllUsers, createUser, etc.)
 * should be called based on the request's method (GET, POST, PUT, DELETE)
 * and URL.
 *
 * @param {http.IncomingMessage} req - The incoming request object.
 * @param {http.ServerResponse} res - The outgoing response object.
 */
const serverHandler = async (req, res) => {
  // Destructure the 'method' (e.g., 'GET', 'POST') and 'url' (e.g., '/api/users/1')
  // properties directly from the 'req' (request) object.
  const { method, url } = req;

  // 'url.split('/')' splits the URL string into an array of strings
  // based on the '/' character.
  // Example: '/api/users/1' becomes ['', 'api', 'users', '1']
  const urlParts = url.split('/');

  // Log every incoming request to the console for debugging purposes.
  console.log(`Incoming Request: ${method} ${url}`);

  // --- Main Routing Logic (if-else if chain) ---

  // Handle GET requests for all users: '/api/users'
  if (method === 'GET' && url === '/api/users') {
    getAllUsers(req, res);
  }
  // Handle GET requests for a single user: '/api/users/:id'
  // 'url.startsWith('/api/users/')' checks if the URL begins with this path.
  else if (method === 'GET' && url.startsWith('/api/users/')) {
    // The ID part of the URL is at index 3 in the 'urlParts' array.
    // 'parseInt()' converts the string ID from the URL into a number.
    const id = parseInt(urlParts[3]);
    // Call our handler function to get a user by ID.
    getUserById(req, res, id);
  }
  // Handle POST requests to create a new user: '/api/users'
  else if (method === 'POST' && url === '/api/users') {
    // Call our handler function to create a user.
    // Since createUser is an async function, we await it.
    await createUser(req, res);
  }
  // Handle PUT requests to update a user: '/api/users/:id'
  else if (method === 'PUT' && url.startsWith('/api/users/')) {
    // Extract and parse the ID from the URL.
    const id = parseInt(urlParts[3]);
    // Call our handler function to update a user.
    // Since updateUser is an async function, we await it.
    await updateUser(req, res, id);
  }
  // Handle DELETE requests to remove a user: '/api/users/:id'
  else if (method === 'DELETE' && url.startsWith('/api/users/')) {
    // Extract and parse the ID from the URL.
    const id = parseInt(urlParts[3]);
    // Call our handler function to delete a user.
    // Since deleteUser is an async function, we await it.
    await deleteUser(req, res, id);
  }
  // If none of the above routes match the incoming request...
  else {
    // ...send a 404 Not Found response for any unhandled route.
    sendJSON(res, 404, { message: `Route not found for ${method} ${url}` });
  }
};

// --- 6. Initialize the Server ---

// Call the function to start our server. This is the entry point
// for our application.
initializeServer();