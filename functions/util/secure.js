const CryptoJS = require('crypto-js');

const encrypt = (str) => {
  return process.env.ENCRYPT_KEY
    ? CryptoJS.AES.encrypt(str, process.env.ENCRYPT_KEY).toString()
    : str;
}

const decrypt = (str) => {
  return process.env.ENCRYPT_KEY
    ? CryptoJS.AES.decrypt(str, process.env.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8)
    : str;
}

module.exports = { encrypt, decrypt };
