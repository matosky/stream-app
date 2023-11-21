
const { pipeline, Transform } = require('stream');
const csvParser = require('csv-parser');
const MSISDNTransform = require('../utils/MSISDNTransform.js');
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
        console.error('Error inserting into the database:', error);
        callback(error);
      }
    },
  });
}


 const handleFileUpload = async (req, res)=> {
    const { file } = req;
    // Use pipeline to handle streaming from request to database
    pipeline(
      file.buffer,
      csvParser({ headers: ['MSISDN', 'quantity', 'narration'] }),
      new MSISDNTransform(),
      dbStream(),
      (err) => {
        if (err) {
          console.error('Pipeline failed:', err);
          res.status(500).send('Internal Server Error');
        } else {
          res.send('Upload successful');
        }
      }
    );
  }

  module.exports = handleFileUpload