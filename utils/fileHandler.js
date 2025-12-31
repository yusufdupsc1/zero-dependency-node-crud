// utils/fileHandler.js: This module is responsible for handling all
// file-related operations for our user data. It allows our server to
// read from and write to a 'users.json' file, ensuring data persistence.

// --- 1. Import Node.js Built-in Modules ---

// The 'fs' (File System) module provides functions for interacting with the
// file system. We specifically use 'fs.promises' for asynchronous operations
// that return Promises, which makes handling file I/O cleaner.
const fs = require('fs').promises;

// The 'path' module provides utilities for working with file and directory paths.
// It helps us construct file paths reliably across different operating systems.
const path = require('path');

// --- 2. Configuration for Data File ---

// DATA_FILE: This constant stores the full path to our 'users.json' file.
// - '__dirname': This is a special Node.js global variable that holds the
//                directory name of the current module (e.g., '/path/to/your/project/utils').
// - '..': We use '..' to go up one directory level (from 'utils' to the project root).
// - 'users.json': This is the name of the file where our user data will be stored.
// 'path.join()' correctly concatenates these parts into a full, valid path.
const DATA_FILE = path.join(__dirname, '..', 'users.json');

// ============================================================================
//  3. FILE HANDLING FUNCTIONS
// ============================================================================

/**
 * readData: This asynchronous function reads the contents of the 'users.json'
 * file, parses it as JSON, and returns the data. If the file doesn't exist,
 * it returns an empty array, which is useful for initializing an empty dataset.
 *
 * @returns {Promise<Array>} - A Promise that resolves with an array of user objects
 *                              or an empty array if the file is not found/empty.
 */
async function readData() {
  try {
    // 'await fs.readFile()' asynchronously reads the entire content of the
    // 'DATA_FILE'. 'utf8' specifies the character encoding.
    // 'await' pauses the execution of this function until the file is fully read.
    const data = await fs.readFile(DATA_FILE, 'utf8');

    // If 'data' is an empty string (e.g., empty file), we return an empty array.
    // Otherwise, we parse the JSON string back into a JavaScript array/object.
    return data ? JSON.parse(data) : [];
  } catch (error) {
    // If an error occurs during file reading...
    // 'error.code === 'ENOENT'' specifically checks if the error is
    // 'Error No ENtry' (meaning the file or directory does not exist).
    if (error.code === 'ENOENT') {
      // If the file doesn't exist, it's not a critical error for us;
      // it just means we're starting with no saved users, so return an empty array.
      return [];
    }
    // For any other type of error (e.g., permissions, invalid JSON format),
    // we re-throw the error, letting the calling function handle it.
    throw error;
  }
}

/**
 * writeData: This asynchronous function writes the given 'data' (an array
 * of user objects) to the 'users.json' file, converting it to a JSON string.
 *
 * @param {Array} data - The array of user objects to write to the file.
 * @returns {Promise<void>} - A Promise that resolves when the write operation
 *                             is successfully completed.
 */
async function writeData(data) {
  // 'JSON.stringify(data, null, 2)' converts the JavaScript 'data' array
  // into a formatted JSON string.
  // - 'null': This argument is for a replacer function (we don't need one here).
  // - '2': This argument specifies an indentation level of 2 spaces, making
  //        the 'users.json' file easy to read for humans.
  const jsonString = JSON.stringify(data, null, 2);

  // 'await fs.writeFile()' asynchronously writes the 'jsonString' to the 'DATA_FILE'.
  // 'utf8' specifies the character encoding.
  // 'await' pauses the execution until the write operation is complete.
  await fs.writeFile(DATA_FILE, jsonString, 'utf8');
}

// --- 4. Export Functions for External Use ---

// 'module.exports' is how we make functions, objects, or variables from
// this file available to other files that 'require' this module.
module.exports = {
  // We export both 'readData' and 'writeData' so 'app.js' can use them.
  readData,
  writeData,
};