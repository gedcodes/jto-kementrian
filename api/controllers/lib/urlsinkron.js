const { sequelize } = require('../../models');
const { QueryTypes } = require('sequelize');

const urlSinkronisasiJto = (kode) => {
    // var sql = `SELECT * FROM jt_config_sinkronisasi WHERE is_active = true AND is_deleted = false ORDER BY id DESC LIMIT 1`;

    // sequelize.query(sql, {
    //     type: QueryTypes.SELECT,
    //     logging: false
    // }).then((res) => {
    //     console.log('RESULT URL SINK: ', res[0].domain_url);
    //     if (res) {
    //         if (res.length > 0) {
    //             return res[0].domain_url;
    //         } else {
    //             return 0;
    //         }
    //     }
    // });
    // return getUrlDomainSink().then((data) => {
    //     console.log('DOMAIN : ', data);
    //     return data;
    // });
    return getUrlDomainSink(kode);
}

const getUrlDomainSink = (kode = 'SN01') => {
    return new Promise(async (resolve, reject) => {
        var sql = `SELECT * FROM jt_config_sinkronisasi WHERE kode = '${kode}' AND is_active = true AND is_deleted = false ORDER BY id DESC LIMIT 1`;
        // console.log(sql)
        sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        }).then((res) => {

            if (Object.keys(res).length > 0) {
                console.log('RESULT URL SINK: ', res[0].domain_url, Object.keys(res).length);
                resolve(res[0].domain_url);
            } else {
                reject(0);
            }

        });
    });
}

module.exports = {
    urlSinkronisasiJto
};