const { pipeline, Transform, Readable } = require("stream");
const csvParser = require("csv-parser");
const MSISDNTransform = require("../utils/MSISDNTransform.js");
const Entry = require("../model/entry.js");

function dbStream() {
  return new Transform({
    objectMode: true,
    async transform(chunk, encoding, callback) {
      try {
        // Create a new Mongoose document and save it to the database
        const entry = new Entry({
          MSISDN: chunk.MSISDN,
          quantity: chunk.quantity,
          narration: chunk.narration,
        });
        await entry.save();
        callback();
      } catch (error) {
        console.error("Error inserting into the database:", error);
        callback(error);
      }
    },
  });
}

// Function to normalize MSISDN to international format
function normalizeMSISDN(msisdn) {
  // Example: Assuming all MSISDNs start with '0' and you want to replace it with '+234'
  return `+234${msisdn.slice(1)}`;
}


const csvTransform = csvParser({
  mapHeaders: ({ header, index }) => header.trim(),
});

const transformStream = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    const msisdn = normalizeMSISDN(chunk.MSISDN);

    this.push({
      msisdn,
      quantity: parseInt(chunk.quantity),
      narration: chunk.narration,
    });
    callback();
  },
});
// Function to process CSV file
async function processCSV(buffer) {
  // Signal the end of the stream

  const entries = [];


}

const handleFileUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // Determine the correct buffer source based on multer configuration
  const fileBuffer = req.file.buffer;
  const readableStream = new Readable();
  readableStream.push(fileBuffer);
  readableStream.push(null);
  if (!fileBuffer) {
    return res.status(500).send("Invalid file buffer.");
  }
  // Use pipeline to handle streaming from request to database
  console.log("file", fileBuffer);
  pipeline(
    readableStream,
    csvTransform,
    transformStream,
    dbStream(),
    (err) => {
      if (err) {
        console.error("Pipeline failed:", err);
        res.status(500).send("Internal Server Error");
      } else {
        res.send("Upload successful");
      }
    }
  );
};




module.exports = handleFileUpload;
