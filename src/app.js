const  express  = require("express");
const multer = require("multer")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const cors = require("cors")
const handleFileUpload = require("./controller/entry")
const configDb = require("./config/config")
const app = express()
app.use(cors())
app.use(express.json())


const PORT = process.env.PORT || 3000;
dotenv.config()
const connectionString = process.env.MONGODB_URI;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.post('/upload', upload.single('csvFile'), handleFileUpload);
configDb(connectionString)
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
