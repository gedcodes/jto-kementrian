const { jt_pasal, jt_pengadilan, jt_kejaksaan, sequelize } = require('../api/models');
const { Op } = require('sequelize');
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const axios = require('axios');
const { ConfigObject } = require('svg-captcha-express');
var kode = 'ETILANG';

const loginEtilang = async() => {
    try {
        var sql =  `SELECT * FROM jt_integrasi_sistem WHERE kode = '${kode}'`;
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });
    
        if (result.length > 0) {
            var api_url = result[0].api_url;
            var api_auth_params = result[0].api_auth_params;
            var endpoint = `${api_url}/auth/login`
            
            var config = {
                method: 'post',
                url: endpoint,
                headers: { 
                  'Content-Type': 'application/json'
                },
                data : api_auth_params
            };
            // console.log(config);
            axios(config).then(async function (response) {
                // console.log(JSON.stringify(response.data));
                if (response.data.statusCode == 200) {
                    var access_token = `${response.data.data.access_token}`;

                    var update = await update_token(access_token);

                    return update;
                } else {
                    return 0;
                }
            }).catch(function (error) {
                console.log(error);
                return 0;
            });
    
        }   
    } catch (error) {
        console.log(error);
        return 0;
    }
}

const update_token = async(token) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_integrasi_sistem SET api_auth_token = '${token}' WHERE kode = '${kode}'`;

        const res_update = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_update[1].command == 'UPDATE') {
            console.log('UPDATE TOKEN BERHASIL');
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        await t.rollback();
    }
}

const getPengadilan = async() => {
    try {
        var sql =  `SELECT * FROM jt_integrasi_sistem WHERE kode = '${kode}'`;
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });
    
        if (result.length > 0) {
            var api_url = result[0].api_url;
            var api_auth_token = result[0].api_auth_token;
            var endpoint = `${api_url}/courts`
            
            var config = {
                method: 'get',
                url: endpoint,
                headers: { 
                    'Authorization': `Bearer ${api_auth_token}`
                }
            };

            axios(config).then(async function (response) {
               //  console.log(JSON.stringify(response.data));
                if (response.data.statusCode == 200) {
                    //console.log(response.data.data);
                    var resp = response.data.data;

                    var i=0;
                    for (var row of resp) {
                        var kode = row.code ? row.code : `ET-${i}`;

                        var upsert = await upsert_pengadilan(row._id, Number(process.argv.slice(3)[0]), process.argv.slice(4)[0], kode, row.name, row.address, row.city._id, row.phoneNumber);

                        if (upsert == 1) {
                            console.log(upsert);
                        }
                    
                        i++;
                    }
                    
                } else {
                    return 0;
                }
            }).catch(function (error) {
                console.log(error);
                return 0;
            });
    
        }   
    } catch (error) {
        console.log(error);
        return 0;
    }
}

const upsert_pengadilan = async(etilang_id, lokasi_id, kode_uppkb, kode, nama, alamat, kota_kab_id, no_telp) => {
    const t = await sequelize.transaction();

    try {
        if (lokasi_id && kode_uppkb) {
            var sql =  `SELECT * FROM jt_pengadilan WHERE etilang_id = '${etilang_id}'`;
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });
        
            if (result.length > 0) {
                console.log('UPDATE PENGADILAN');
                let sql_update = `UPDATE
                                        jt_pengadilan
                                    SET
                                        lokasi_id = ${lokasi_id},
                                        kode_uppkb = '${kode_uppkb}',
                                        kode = '${kode}',
                                        nama = '${nama}',
                                        alamat = '${alamat}',
                                        updated_at = '${moment().format('YYYY-MM-DD HH:mm:ss')}',
                                        updated_by = 99,
                                        is_deleted = false,
                                        is_active = true,
                                        kota_kab_id = ${kota_kab_id},
                                        no_telp = '${no_telp}',
                                        etilang_id = '${etilang_id}'
                                    WHERE
                                        etilang_id = '${etilang_id}'`;

                const res_update = await sequelize.query(sql_update, {
                    logging: false
                }, { transaction: t })
        
                await t.commit();
                if (res_update[1].command == 'UPDATE') {
                    console.log('UPDATE PENGADILAN BERHASIL');
                    return 1;
                } else {
                    return 0;
                }

            } else {
                console.log('INSERT PENGADILAN');
                var sql_insert = `INSERT INTO jt_pengadilan
                                        (lokasi_id, kode_uppkb, kode, nama, alamat, created_at, created_by, is_deleted, is_active, kota_kab_id, no_telp, etilang_id)
                                    VALUES
                                        (${lokasi_id}, '${kode_uppkb}', '${kode}', '${nama}', '${alamat}', '${moment().format('YYYY-MM-DD HH:mm:ss')}', 99, false, true, ${kota_kab_id}, '${no_telp}', '${etilang_id}')`;
                // console.log(sql_insert);
                const res_insert = await sequelize.query(sql_insert, {
                    logging: false
                }, { transaction: t })
        
                await t.commit();
                const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")

                return res;
            }
        } else {
            console.log('ARGUMEN LOKASI DAN KODE UPPKB TIDAK TERSEDIA')
            return 0;
        }

    } catch (error) {
        console.log(error)
        await t.rollback();
    }
}

const geKejaksaan = async() => {
    try {
        var sql =  `SELECT * FROM jt_integrasi_sistem WHERE kode = '${kode}'`;
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });
    
        if (result.length > 0) {
            var api_url = result[0].api_url;
            var api_auth_token = result[0].api_auth_token;
            var endpoint = `${api_url}/attorneys`
            
            var config = {
                method: 'get',
                url: endpoint,
                headers: { 
                    'Authorization': `Bearer ${api_auth_token}`
                }
            };

            axios(config).then(async function (response) {
               //  console.log(JSON.stringify(response.data));
                if (response.data.statusCode == 200) {
                    //console.log(response.data.data);
                    var resp = response.data.data;

                    var i=0;
                    for (var row of resp) {
                        var kode = row.code ? row.code : `ET-${i}`;

                        var upsert = await upsert_kejaksaan(row._id, Number(process.argv.slice(3)[0]), process.argv.slice(4)[0], kode, row.name, row.address, row.city._id, row.phoneNumber, row.type);

                        if (upsert == 1) {
                            console.log(upsert);
                        }
                    
                        i++;
                    }
                    
                } else {
                    return 0;
                }
            }).catch(function (error) {
                console.log(error);
                return 0;
            });
    
        }   
    } catch (error) {
        console.log(error);
        return 0;
    }
}

const upsert_kejaksaan = async(etilang_id, lokasi_id, kode_uppkb, kode, nama, alamat, kota_kab_id, no_telp, tipe) => {
    const t = await sequelize.transaction();

    try {
        if (lokasi_id && kode_uppkb) {
            var sql =  `SELECT * FROM jt_kejaksaan WHERE etilang_id = '${etilang_id}'`;
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });
        
            if (result.length > 0) {
                console.log('UPDATE KEJAKSAAN');
                let sql_update = `UPDATE
                                        jt_kejaksaan
                                    SET
                                        lokasi_id = ${lokasi_id},
                                        kode_uppkb = '${kode_uppkb}',
                                        kode = '${kode}',
                                        nama = '${nama}',
                                        alamat = '${alamat}',
                                        tipe = '${tipe}',
                                        updated_at = '${moment().format('YYYY-MM-DD HH:mm:ss')}',
                                        updated_by = 99,
                                        is_deleted = false,
                                        is_active = true,
                                        kota_kab_id = ${kota_kab_id},
                                        no_telp = '${no_telp}',
                                        etilang_id = '${etilang_id}'
                                    WHERE
                                        etilang_id = '${etilang_id}'`;

                const res_update = await sequelize.query(sql_update, {
                    logging: false
                }, { transaction: t })
        
                await t.commit();
                if (res_update[1].command == 'UPDATE') {
                    console.log('UPDATE KEJAKSAAN BERHASIL');
                    return 1;
                } else {
                    return 0;
                }

            } else {
                console.log('INSERT KEJAKSAAN');
                var sql_insert = `INSERT INTO jt_kejaksaan
                                        (lokasi_id, kode_uppkb, kode, nama, alamat, tipe, created_at, created_by, is_deleted, is_active, kota_kab_id, no_telp, etilang_id)
                                    VALUES
                                        (${lokasi_id}, '${kode_uppkb}', '${kode}', '${nama}', '${alamat}', '${tipe}', '${moment().format('YYYY-MM-DD HH:mm:ss')}', 99, false, true, ${kota_kab_id}, '${no_telp}', '${etilang_id}')`;
                // console.log(sql_insert);
                const res_insert = await sequelize.query(sql_insert, {
                    logging: false
                }, { transaction: t })
        
                await t.commit();
                const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")

                return res;
            }
        } else {
            console.log('ARGUMEN LOKASI DAN KODE UPPKB TIDAK TERSEDIA')
            return 0;
        }

    } catch (error) {
        console.log(error)
        await t.rollback();
    }
}

/*
const getPasal = async() => {
    try {
        var sql =  `SELECT * FROM jt_integrasi_sistem WHERE kode = '${kode}'`;
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });
    
        if (result.length > 0) {
            var api_url = result[0].api_url;
            var api_auth_token = result[0].api_auth_token;
            var endpoint = `${api_url}/articles`
            
            var config = {
                method: 'get',
                url: endpoint,
                headers: { 
                    'Authorization': `Bearer ${api_auth_token}`
                }
            };

            axios(config).then(async function (response) {
               //  console.log(JSON.stringify(response.data));
                if (response.data.statusCode == 200) {
                    //console.log(response.data.data);
                    var resp = response.data.data;
                    console.log(resp);
                    
                    var i=0;
                    for (var row of resp) {
                        var kode = row.code ? row.code : `ET-${i}`;
                        var etilang_detention = row.etilang_detention ? row.etilang_detention : '';
                        var etilang_fine = row.etilang_fine ? row.etilang_fine : '';
                        var pasal = `Pasal ${row.article} Ayat ${row.section}`;
                        var desk_pasal = row.description;
                        var upsert = await upsert_pasal(row._id, row.article, process.argv.slice(4)[0], kode, row.name, row.address, row.city._id, row.phoneNumber);

                        if (upsert == 1) {
                            console.log(upsert);
                        }
                    
                        i++;
                    }
                    
                } else {
                    return 0;
                }
            }).catch(function (error) {
                console.log(error);
                return 0;
            });
    
        }   
    } catch (error) {
        console.log(error);
        return 0;
    }
}

const upsert_pasal = async(etilang_id, no_pasal, pasal, desk_pasal, keterangan, etilang_section, etilang_article, etilang_year, etilang_detention, etilang_fine) => {
    const t = await sequelize.transaction();

    try {

        var sql =  `SELECT * FROM jt_pengadilan WHERE etilang_id = '${etilang_id}'`;
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });
    
        if (result.length > 0) {
            console.log('UPDATE PASAL');
            let sql_update = `UPDATE
                                    jt_pasal   
                                SET
                                    no_pasal = ${no_pasal},
                                    pasal = '${pasal}',
                                    desk_pasal = '${desk_pasal}',
                                    keterangan = '${keterangan}',
                                    updated_at = '${moment().format('YYYY-MM-DD HH:mm:ss')}',
                                    updated_by = 99,
                                    is_deleted = false,
                                    is_active = true,
                                    etilang_id = '${etilang_id}',
                                    etilang_section = '${etilang_section}',
                                    etilang_article = '${etilang_article}',
                                    etilang_year = '${etilang_year}',
                                    etilang_detention = '${etilang_detention}',
                                    etilang_fine = '${etilang_fine}',
                                WHERE
                                    etilang_id = '${etilang_id}'`;

            const res_update = await sequelize.query(sql_update, {
                logging: false
            }, { transaction: t })
    
            await t.commit();
            if (res_update[1].command == 'UPDATE') {
                console.log('UPDATE PENGADILAN BERHASIL');
                return 1;
            } else {
                return 0;
            }

        } else {
            console.log('INSERT PASAL');
            var sql_insert = `INSERT INTO jt_pasal
                                    (no_pasal, pasal, desk_pasal, keterangan, created_at, created_by, is_deleted, is_active, etilang_id, etilang_section, etilang_article, etilang_year, etilang_detention, etilang_fine)
                                VALUES
                                    (${no_pasal}, '${pasal}', '${desk_pasal}', '${keterangan}', '${moment().format('YYYY-MM-DD HH:mm:ss')}', 99, false, true, ${etilang_id}, '${etilang_section}', '${etilang_article}', '${etilang_year}', '${etilang_detention}', '${etilang_fine}')`;
            // console.log(sql_insert);
            const res_insert = await sequelize.query(sql_insert, {
                logging: false
            }, { transaction: t })
    
            await t.commit();
            const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")

            return res;
        }

    } catch (error) {
        console.log(error)
        await t.rollback();
    }
}
*/ 

switch(Number(process.argv.slice(2)[0])) {
    case 1 : //npm run syncetilang 1 49 BLG
        getPengadilan();
        break;
    case 2 : //npm run syncetilang 2 49 BLG
        geKejaksaan();
        break;        
    default :
        loginEtilang();
        break;
}

console.log('process.argv', Number(process.argv.slice(2)[0]));