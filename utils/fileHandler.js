// utils/fileHandler.js
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'users.json');

/**
 * Reads data from the users.json file.
 * @returns {Promise<Array>} A promise that resolves with the parsed data, or an empty array if the file doesn't exist or is empty.
 */
async function readData() {
  try {
    const data = await fs.promises.readFile(DATA_FILE, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File does not exist, return empty array
      return [];
    }
    throw error;
  }
}

/**
 * Writes data to the users.json file.
 * @param {Array} data - The array of users to write.
 * @returns {Promise<void>} A promise that resolves when the data is written.
 */
async function writeData(data) {
  await fs.promises.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  readData,
  writeData,
};
