const axios = require('axios');
const rax = require('retry-axios');
const { sequelize } = require('../../models');
const { Op, QueryTypes } = require('sequelize');
var client = require('redis').createClient();
const timer = ms => new Promise(res => setTimeout(res, ms))

const getpanbali = async (filter, value) => {
    return new Promise(async (resolve, reject) => {
        try {
            const urlPanBali = `${process.env.APP_API_PAN_BALI}/open-api/manifest?filter=${filter}&value=${value}`;
            var config_axios = {
                method: 'GET',
                timeout: 10000,
                url: urlPanBali // 'https://jto.dephub.go.id/api/v2/v2pb/jto/kendaraan/qrcode?qr=https://ujiberkala.dephub.go.id/qr/vi/C11D34C1DA66E9F89A2BF31EAF8DE7C9'.toString(),
            };

            const response = await axios(config_axios);
            // console.log(response.data);
            resolve(response.data);
        } catch (error) {
            // checkblue(no_registrasi_kendaraan, no_uji_kendaraan);
            console.log('ERROR RESPONSE PAN BALI');
            /*
            checkblue(no_registrasi_kendaraan, no_uji_kendaraan);
            */
            // console.log(error)
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
            reject(0)

        }
    });

}

const syncToPostPanBali = async (apiKey, platform, data) => {
    return new Promise(async (resolve, reject) => {
        // await synclogin();
        setTimeout(async () => {
            try {

                var config = {
                    method: 'POST',
                    url: `${process.env.APP_API_PAN_BALI}/platform/verify/e-manifest?platformName=${platform}&apiKey=${apiKey}`,
                    data: data,
                    timeout: 10000
                };

                axios(config).then(async function (response) {
                    resolve(response)
                }).catch(async (error) => {
                    console.log(error);
                    reject(error);
                });
            } catch (error) {
                // next(error);
                reject(error);
            }
        }, 1000);
    });
}

// const getIdKomoditi = async (komoditi) => {
//     var sql = `SELECT * FROM jt_komoditi WHERE nama = '${komoditi}' AND is_active = true AND is_deleted = false;`;

//     const result = await sequelize.query(sql, {
//         type: QueryTypes.SELECT,
//         logging: false
//     });

//     if (result.length > 0) {
//         var id = result[0].id;

//         return id;
//     } else {
//         return 0;
//     }
// }

module.exports = {
    getpanbali,
    syncToPostPanBali
};