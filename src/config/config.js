/**
 * @file dbConnector.js
 * @description Module for connecting to MongoDB Atlas using Mongoose.
 */

const mongoose = require("mongoose");

/**
 * Connect to MongoDB Atlas using the provided connection string.
 * @param {string} connectionString - MongoDB Atlas connection string.
 * @returns {Promise<void>} - A promise that resolves when the connection is successful.
 */
async function configDb(connectionString) {
  try {
    await mongoose.connect(connectionString);
    console.log("Connected to MongoDB Atlas!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error; // Re-throw the error for handling in the calling code if needed
  }
}

module.exports = configDb;
