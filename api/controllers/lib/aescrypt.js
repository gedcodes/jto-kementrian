const crypto = require("crypto");

const cryptkey = 'C51GH00SE8499727';
const iv =  'BDA30EGDH1578F81';
// const url_enc = 'https://jto.marktelrnd.online/qr/rep/penindakan?#uEG/5RjJhDBr86bJQQ52DPpADDyzE2J6mMMlTKyH7BBIPbrMZY2Y62AVOCHKF9Qh';
// const params_url = url_enc.split("?#");
// console.log(decrypt(params_url[1]));
const encrypt = (text) => {
    try {
        var cipher = crypto.createCipheriv('aes-128-cbc',cryptkey,iv);
        var crypted = cipher.update(text,'utf8','base64');  //base64 , hex
        crypted += cipher.final('base64');
        return crypted;
    } catch (err) {
        console.error('encrypt error',err);
        return null;
    }
}

const decrypt = (encryptdata) => {
    // console.log(crypto.getCiphers()); // ['aes-128-cbc', 'aes-128-ccm', ...]
    
    try {
        let decipher = crypto.createDecipheriv('aes-128-cbc',cryptkey,iv)
        decipher.setAutoPadding(false)
        let decoded  = decipher.update(encryptdata,'base64','utf8') //base64 , hex
        decoded  += decipher.final('utf8')
        return decoded
    } catch (err) {
        console.error('decrypt error',err)
        return null
    }
}

module.exports = {
    encrypt,
    decrypt,
};
