const { pipeline, Transform, Readable, Writable } = require("stream");
const csvParser = require("csv-parser");
const MSISDNTransform = require("../utils/MSISDNTransform.js");
const Entry = require("../model/entry.js");
const throttle = require('stream-throttle');
const { promisify } = require('util');

async function dbStream() {
  const batchSize = 1000; // Adjust the batch size based on your requirements
  const entries = [];

  const writable = new Writable({
    objectMode: true,
    write(chunk, encoding, callback) {
      console.log('in db');

      // Store entries in an array for bulk insert
      entries.push({
        MSISDN: chunk.msisdn,
        quantity: chunk.quantity,
        narration: chunk.narration,
      });

      // Check if the number of entries has reached the batch size before inserting
      if (entries.length >= batchSize) {
        this.performInsert(callback);
      } else {
        callback();
      }
    },
    final(callback) {
      // Perform the final insert with any remaining entries
      this.performInsert(callback);
    },
  });

  // Explicitly bind the performInsert method to the writable object
  writable.performInsert = async function (callback) {
    try {
      // Perform bulk insert using insertMany
      await Entry.insertMany(entries);
      console.log('Insert successful');
      // Clear the entries array after a successful insert
      entries.length = 0;
      callback();
    } catch (error) {
      console.error('Error inserting into the database:', error);
      callback(error);
    }
  }.bind(writable); // Explicitly bind this function to the writable object

  return writable;
}



// Function to normalize MSISDN to international format
function normalizeMSISDN(msisdn) {
  // Example: Assuming all MSISDNs start with '0' and you want to replace it with '+234'
  const normalizedMSISDN = `+234${msisdn.slice(1)}`;
  console.log(`Original MSISDN: ${msisdn}, Normalized MSISDN: ${normalizedMSISDN}`);
  return normalizedMSISDN;
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
    console.log("in trans")
    callback();
  },
});

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
   // Promisify the pipeline function
     // Create a writable stream for the database insertion
  const dbWritable = await dbStream();
   const pipelineAsync = promisify(pipeline);

   try {
     // Use pipeline to handle streaming from request to database
     console.log('file', fileBuffer);
     await pipelineAsync(
       readableStream,
       csvTransform,
       transformStream,
       // throttle.Throttle({ rate: 500, chunksize: 16 }),
       dbWritable // Use the custom writable stream here
     );
 
     // Send the response after the pipeline is completed
     res.send('Upload successful');
   } catch (err) {
     console.error('Pipeline failed:', err);
     res.status(500).send('Internal Server Error');
   }
 };





module.exports = handleFileUpload;
