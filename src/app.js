import express from "express";
import multer from "multer";
// import { handleFileUpload } from "./controllers/upload";
import mongoose from "mongoose";
const app = express()
const PORT = process.env.PORT || 3000;
const connectionString = "mongodb+srv://akari:akari@cluster0.xrdal5y.mongodb.net/?retryWrites=true&w=majority"

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('csvFile'), handleFileUpload);
async function configDb(connectionString) {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB Atlas!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Re-throw the error for handling in the calling code if needed
  }
}

configDb(connectionString)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});