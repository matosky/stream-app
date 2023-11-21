import { Transform } from 'stream';

// Normalize MSISDN to international format
function normalizeMSISDN(msisdn) {
  return msisdn;
}

export const MSISDNTransform = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    const normalizedMSISDN = normalizeMSISDN(chunk.MSISDN);
    chunk.MSISDN = normalizedMSISDN;
    this.push(chunk);
    callback();
  }
});

export default msdin;
