const CryptoJS = require('crypto-js');

const encrypt = (val) => {
  if (!process.env.ENCRYPT_KEY) {
    return val;
  }
  const value = JSON.stringify({ val });
  return CryptoJS.AES.encrypt(value, process.env.ENCRYPT_KEY).toString()
}

const decrypt = (val) => {
  if (!process.env.ENCRYPT_KEY) {
    return val;
  }
  const value = CryptoJS.AES.decrypt(val, process.env.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
  return (JSON.parse(value)).val;
}

module.exports = { encrypt, decrypt };
