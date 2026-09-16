const axios = require('axios');
const rax = require('retry-axios');
var client = require('redis').createClient();
const { Users, sequelize } = require('../../models');
const { urlSinkronisasiJto } = require('./urlsinkron');
const fs = require('fs');
const FormData = require('form-data');

const syncMidlewareToPostServer = async (method, endpoint, data) => {
    return new Promise(async (resolve, reject) => {
        var URL_SINK = await urlSinkronisasiJto();
        console.log('URL_SINK : ', URL_SINK);
        setTimeout(async () => {
            client.hgetall('session', async function (err, obj) {
                try {
                    var config = {
                        method: method || `post`,
                        url: URL_SINK != 0 ? `${URL_SINK}/${endpoint}` : `${process.env.APP_API_JTO_KEMENHUB}/${endpoint}`,
                        headers: {
                            'Authorization': `${obj.token}`,
                        },
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
            });
        }, 1500);

    });
}

const syncMidlewareToPostServerWithImg = async (method, endpoint, data, datafoto) => {
    return new Promise(async (resolve, reject) => {
        var URL_SINK = await urlSinkronisasiJto();
        console.log('URL_SINK : ', URL_SINK);
        setTimeout(async () => {
            client.hgetall('session', async function (err, obj) {
                try {
                    const form = new FormData();

                    for (const key in data) {
                        if (data[key] !== null && data[key] !== undefined) {
							form.append(key, data[key].toString());
						}
                    }

                    // Cek dan tambahkan foto jika tersedia
                    if (datafoto.fotoDepan && fs.existsSync(datafoto.fotoDepan)) {
                        form.append('fotoDepan', fs.createReadStream(datafoto.fotoDepan));
                    } else if (datafoto.fotoDepan) {
                        console.warn('fotoDepan tidak ditemukan:', datafoto.fotoDepan);
                    }

                    if (datafoto.fotoBelakang && fs.existsSync(datafoto.fotoBelakang)) {
                        form.append('fotoBelakang', fs.createReadStream(datafoto.fotoBelakang));
                    } else if (datafoto.fotoBelakang) {
                        console.warn('fotoBelakang tidak ditemukan:', datafoto.fotoBelakang);
                    }
                    
                    axios({
                        method: method || 'post',
                        url: URL_SINK != 0 ? `${URL_SINK}/${endpoint}` : `${process.env.APP_API_JTO_KEMENHUB}/${endpoint}`,
                        headers: {
                            'Authorization': `${obj.token}`,
                            ...form.getHeaders() // Add FormData headers
                        },
                        data: form, // Pass FormData object as data
                        timeout: 10000
                    }).then(async function (response) {
                        resolve(response)
                    }).catch(async (error) => {
                        console.log(error);
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            });
        }, 1500);

    });
}

const syncMidlewareToPostLocal = async (method, endpoint, data) => {
    return new Promise(async (resolve, reject) => {

        setTimeout(async () => {
            client.hgetall('session', async function (err, obj) {
                try {
                    var config = {
                        method: method || `post`,
                        url: `http://127.0.0.1:8021/api/${endpoint}`,
                        headers: {
                            'Authorization': `${obj.token}`,
                        },
                        data: data,
                        timeout: 5000
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
            });
        }, 1500);

    });
}

const syncToPostServer = async (token_id, method, endpoint, data) => {
    return new Promise(async (resolve, reject) => {
        if (process.env.IS_KEMENHUB == 0 && process.env.APP_SINKRONISASI == 1) {
            // await synclogin();
            var URL_SINK = await urlSinkronisasiJto();
            // console.log('URL_SINK : ', URL_SINK);

            var postUrl = URL_SINK != 0 ? `${URL_SINK}/${endpoint}` : `${process.env.APP_API_JTO_KEMENHUB}/${endpoint}`;
            // console.log('POST URL: ', postUrl);

            setTimeout(async () => {
                client.hgetall("session", async function (err, obj) {
                    // console.log('TOKEN ID, OBJ HGETALL: ', "session", obj);
                    try {
                        if (obj == null) {
                            await synclogin(token_id);
                            resolve(err);
                        }

                        var config = {
                            method: method || `post`,
                            url: postUrl,
                            headers: {
                                'Authorization': `${obj.token}`,
                            },
                            data: data,
                            timeout: 10000
                        };
                        // console.log('DATA POST: ', data);

                        axios(config).then(async function (response) {
                            resolve(response)
                        }).catch(async (error) => {
                            console.log(error);
                            if (error.response) {
                                if (error.response.status == 401) {
                                    await synclogin(token_id);
                                }
                            }
                            reject(error);
                        });
                    } catch (error) {
                        console.log('ERROR POST: ', error);
                        // next(error);
                        reject(error);
                    }
                });
            }, 800);

        }
    });
}

const syncToPostServerWithImage = async (token_id, method, endpoint, data) => {
    return new Promise(async (resolve, reject) => {
        if (process.env.IS_KEMENHUB == 0 && process.env.APP_SINKRONISASI == 1) {
            // await synclogin();
            var URL_SINK = await urlSinkronisasiJto();
            // console.log('URL_SINK : ', URL_SINK);

            var postUrl = URL_SINK != 0 ? `${URL_SINK}/${endpoint}` : `${process.env.APP_API_JTO_KEMENHUB}/${endpoint}`;
            // console.log('POST URL: ', postUrl);

            setTimeout(async () => {
                client.hgetall("session", async function (err, obj) {
                    // console.log('TOKEN ID, OBJ HGETALL: ', "session", obj);
                    try {
                        if (obj == null) {
                            await synclogin(token_id);
                            resolve(err);
                        }
                        // console.log(data);

                        const form = new FormData();
        
                        // Menambahkan bidang lainnya
                        for (const key in data) {
                            form.append(key, data[key]);
                        }

                        // console.log(fs.createReadStream(data.foto_depan));

                        if (data.fotoDepan) {
                            form.append('fotoDepan', fs.createReadStream(data.fotoDepan));
                        }

                        if (data.fotoBelakang) {
                            form.append('fotoBelakang', fs.createReadStream(data.fotoBelakang));
                        }

                        // console.log(form)
                        
                        var config = {
                            method: method || `post`,
                            url: postUrl,
                            headers: {
                                ...form.getHeaders(),
                                'Authorization': `${obj.token}`,
                            },
                            data: form,
                            timeout: 8000
                        };
                        // console.log('DATA POST: ', data);

                        axios(config).then(async function (response) {
                            resolve(response)
                        }).catch(async (error) => {
                            console.log(error);
                            if (error.response) {
                                if (error.response.status == 401) {
                                    await synclogin(token_id);
                                }
                            }
                            reject(error);
                        });
                    } catch (error) {
                        console.log('ERROR POST: ', error);
                        // next(error);
                        reject(error);
                    }
                });
            }, 800);

        }
    });
}

const syncToPostServerLhr = async (token_id, method, endpoint, data) => {
    return new Promise(async (resolve, reject) => {
        if (process.env.IS_KEMENHUB == 0 && process.env.APP_SINKRONISASI == 1) {
            // await synclogin();
            var URL_SINK = await urlSinkronisasiJto('SN02');
            // console.log('URL_SINK : ', URL_SINK);

            var postUrl = URL_SINK != 0 ? `${URL_SINK}/${endpoint}` : `${process.env.APP_API_JTO_KEMENHUB}/${endpoint}`;
            // console.log('POST URL: ', postUrl);

            setTimeout(async () => {
                client.hgetall("session", async function (err, obj) {
                    // console.log('TOKEN ID, OBJ HGETALL: ', "session", obj);
                    try {
                        if (obj == null) {
                            await synclogin(token_id);
                            resolve(err);
                        }

                        var config = {
                            method: method || `post`,
                            url: postUrl,
                            headers: {
                                'Authorization': `${obj.token}`,
                            },
                            data: data,
                            timeout: 15000
                        };
                        // console.log('DATA POST: ', data);

                        axios(config).then(async function (response) {
                            resolve(response)
                        }).catch(async (error) => {
                            console.log(error);
                            if (error.response) {
                                if (error.response.status == 401) {
                                    await synclogin(token_id);
                                }
                            }
                            reject(error);
                        });
                    } catch (error) {
                        console.log('ERROR POST: ', error);
                        // next(error);
                        reject(error);
                    }
                });
            }, 800);

        }
    });
}

const syncToPostServerWim = async (token_id, method, endpoint, data) => {
    return new Promise(async (resolve, reject) => {
        if (process.env.IS_KEMENHUB == 0 && process.env.APP_SINKRONISASI == 1) {
            // await synclogin();
            var URL_SINK = await urlSinkronisasiJto('SN02');
            // console.log('URL_SINK : ', URL_SINK);

            var postUrl = URL_SINK != 0 ? `${URL_SINK}/${endpoint}` : `${process.env.APP_API_JTO_KEMENHUB}/${endpoint}`;
            // console.log('POST URL: ', postUrl);

            setTimeout(async () => {
                client.hgetall("session", async function (err, obj) {
                    // console.log('TOKEN ID, OBJ HGETALL: ', "session", obj);
                    try {
                        if (obj == null) {
                            await synclogin(token_id);
                            resolve(err);
                        }

                        var config = {
                            method: method || `post`,
                            url: postUrl,
                            headers: {
                                'Authorization': `${obj.token}`,
                            },
                            data: data,
                            timeout: 15000,
                            maxContentLength: Infinity,
                            maxBodyLength: Infinity
                        };
                        // console.log('DATA POST: ', data);

                        axios(config).then(async function (response) {
                            resolve(response)
                        }).catch(async (error) => {
                            console.log(error);
                            if (error.response) {
                                if (error.response.status == 401) {
                                    await synclogin(token_id);
                                }
                            }
                            reject(error);
                        });
                    } catch (error) {
                        console.log('ERROR POST: ', error);
                        // next(error);
                        reject(error);
                    }
                });
            }, 800);

        }
    });
}

const loginUser = async (token_id) => {
    client.hgetall(token_id, async function (err, obj) {
        console.log(obj);
    })
}

const synclogin = async (token_id) => {
    console.log('TOKEN ID : ', token_id);

    client.hgetall(token_id, async function (err, obj) {
        console.log('OBJ : ', obj);
        var data = JSON.stringify({
            "email": obj ? obj.email : "admin@dephub.go.id",
            "password": obj ? obj.password : "hubdat123456"
        });
        console.log('DATA LOGIN : ', data);
        var URL_SINK = await urlSinkronisasiJto();
        console.log('URL_SINK : ', URL_SINK);
        var config = {
            method: 'post',
            url: URL_SINK != 0 ? `${URL_SINK}/v2pb/login/` : `${process.env.APP_API_JTO_KEMENHUB}/v2pb/login/`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: data
        };

        axios(config).then(function (result) {
            // console.log(JSON.stringify(result.data));
            client.del("session");
            client.hmset("session", {
                'token_type': 'Bearer',
                'expires_in': result.data.expired,
                'access_token': result.data.accessToken,
                'refresh_token': result.data.refreshToken,
                'token': `Bearer ${result.data.accessToken}`
            });
        }).catch(function (error) {
            console.log('ERROR LOGIN : ', error);
        });
    });
}

const updateStatusSyncToPusat = async (id, tablename) => {
    const t = await sequelize.transaction();
    try {
        var sql = `UPDATE ${tablename} SET sync_to_pusat = true WHERE id = '${id}'`;

        const res_update = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_update[1].command == 'UPDATE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        await t.rollback();
    }
}

const updateIdStatusSyncToPusat = async (id, kode, tablename) => {
    const t = await sequelize.transaction();
    try {
        var sql = `UPDATE ${tablename} SET id = ${id}, sync_to_pusat = true WHERE kode = '${kode}'`;
        const res_update = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_update[1].command == 'UPDATE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        await t.rollback();
    }
}

const updateIdNoKodeStatusSyncToPusat = async (id, idlocal, tablename) => {
    const t = await sequelize.transaction();
    try {
        var sql = `UPDATE ${tablename} SET id = ${id}, sync_to_pusat = true WHERE id = ${idlocal}`;
        const res_update = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_update[1].command == 'UPDATE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        await t.rollback();
    }
}

const syncGet = async (token_id, endpoint) => {
    return new Promise(async (resolve, reject) => {
        if (process.env.IS_KEMENHUB == 0 && process.env.APP_SINKRONISASI == 1) {
            // await synclogin();
            setTimeout(async () => {
                client.hgetall(token_id, async function (err, obj) {
                    try {
                        if (obj == null) {
                            await synclogin(token_id);
                            res.json({
                                success: false,
                                message: 'Login Sinkronisasi Gagal. Ulangi Sinkronisasi Kembali',
                            });
                        }

                        var URL_SINK = await urlSinkronisasiJto();
                        console.log('URL_SINK : ', URL_SINK);

                        var config = {
                            method: 'get',
                            url: URL_SINK != 0 ? `${URL_SINK}/v2pv/${endpoint}` : `${process.env.APP_API_JTO_KEMENHUB}/v2pv/${endpoint}`,
                            headers: {
                                'Authorization': `${obj.token}`,
                            },
                            timeout: 5000
                        };

                        axios(config).then(async function (response) {
                            resolve(response)
                        }).catch(async (error) => {
                            if (error.response.status == 401) {
                                await synclogin(token_id);
                            }
                            reject(error);
                        });
                    } catch (error) {
                        // next(error);
                        reject(error);
                    }
                });
            }, 1500);

        }
    });
}

const syncKategoriKomoditi = async (req, res, next) => {

    if (process.env.IS_KEMENHUB == 0 && process.env.APP_SINKRONISASI == 1) {
        await synclogin();
        setTimeout(async () => {
            client.hgetall("session", async function (err, obj) {
                try {
                    if (obj == null) {
                        await synclogin();
                        res.json({
                            success: false,
                            message: 'Login Sinkronisasi Gagal. Ulangi Sinkronisasi Kembali',
                        });
                    }

                    var URL_SINK = await urlSinkronisasiJto();
                    console.log('URL_SINK : ', URL_SINK);

                    var config = {
                        method: 'get',
                        url: URL_SINK != 0 ? `${URL_SINK}/v2pv/kategorikomoditi` : `${process.env.APP_API_JTO_KEMENHUB}/v2pv/kategorikomoditi`,
                        headers: {
                            'Authorization': `${obj.token}`,
                        },
                        timeout: 15000
                    };

                    axios(config).then(async function (response) {
                        if (response.data.success) {
                            var result = response.data.data;
                            for (var row of result) {
                                console.log(row);
                                // const sinkron_data = await upsert_komoditi(row.id, row.kategori_komoditi_id, row.kode, row.nama, row.is_active, req.token.id, moment().format('YYYY-MM-DD HH:mm:ss'));
                                // console.log('sinkron_data : ',sinkron_data);
                            }
                            res.json({
                                success: true,
                                message: 'Sinkronisasi Data Berhasil',
                                data: response.data.data,
                            });
                        } else {
                            res.json({
                                success: false,
                                message: 'Sinkronisasi Data Gagal',
                            });
                        }
                    }).catch(async (error) => {
                        console.log(error);
                        if (error.response.status == 401) {
                            await synclogin();
                        }
                    });
                } catch (error) {
                    next(error);
                }
            });
        }, 3000);

    } else {
        res.json({
            success: false,
            message: 'Aplikasi Tidak Di Dukung Sinkronisasi',
        });
    }
}

const syncKomoditi = async (req, res, next) => {

    if (process.env.IS_KEMENHUB == 0 && process.env.APP_SINKRONISASI == 1) {
        await synclogin();
        setTimeout(async () => {
            client.hgetall("session", async function (err, obj) {
                try {
                    if (obj == null) {
                        await synclogin();
                        res.json({
                            success: false,
                            message: 'Login Sinkronisasi Gagal. Ulangi Sinkronisasi Kembali',
                        });
                    }

                    var URL_SINK = await urlSinkronisasiJto();
                    console.log('URL_SINK : ', URL_SINK);

                    var config = {
                        method: 'get',
                        url: URL_SINK != 0 ? `${URL_SINK}/v2pv/komoditi` : `${process.env.APP_API_JTO_KEMENHUB}/v2pv/komoditi`,
                        headers: {
                            'Authorization': `${obj.token}`,
                        },
                        timeout: 15000
                    };

                    axios(config).then(async function (response) {
                        if (response.data.success) {
                            var result = response.data.data;
                            for (var row of result) {
                                const sinkron_data = await upsert_komoditi(row.id, row.kategori_komoditi_id, row.kode, row.nama, row.is_active, req.token.id, moment().format('YYYY-MM-DD HH:mm:ss'));
                                console.log('sinkron_data : ', sinkron_data);
                            }
                            res.json({
                                success: true,
                                message: 'Sinkronisasi Data Berhasil',
                                data: response.data.data,
                            });
                        } else {
                            res.json({
                                success: false,
                                message: 'Sinkronisasi Data Gagal',
                            });
                        }
                    }).catch(async (error) => {
                        console.log(error);
                        if (error.response.status == 401) {
                            await synclogin();
                        }
                    });
                } catch (error) {
                    next(error);
                }
            });
        }, 3000);

    } else {
        res.json({
            success: false,
            message: 'Aplikasi Tidak Di Dukung Sinkronisasi',
        });
    }
}

const syncBaTilangPusat = async (ticketId, typeNum) => {

    return new Promise(async (resolve, reject) => {
        if (process.env.IS_KEMENHUB == 0 && process.env.APP_SINKRONISASI == 1) {
            // await synclogin();
            var URL_SINK = await urlSinkronisasiJto();
            console.log('URL_SINK : ', URL_SINK);

            const urlJto = URL_SINK != 0 ? `${URL_SINK}/v2pv/penindakan/etilang/downloadba?ticketId=${ticketId}&typeNum=${typeNum}` : `${process.env.APP_API_JTO_KEMENHUB}/v2pv/penindakan/etilang/downloadba?ticketId=${ticketId}&typeNum=${typeNum}`;
            // console.log('POST URL: ', postUrl);

            setTimeout(async () => {
                client.hgetall("session", async function (err, obj) {
                    // console.log('TOKEN ID, OBJ HGETALL: ', "session", obj);
                    try {
                        if (obj == null) {
                            await synclogin(token_id);
                            resolve(err);
                        }

                        var config = {
                            method: `get`,
                            url: urlJto,
                            headers: {
                                'Authorization': `${obj.token}`,
                            },
                            timeout: 15000
                        };
                        // console.log('DATA POST: ', data);

                        axios(config).then(async function (response) {
                            resolve(response.data)
                        }).catch(async (error) => {
                            console.log(error);
                            if (error.response) {
                                if (error.response.status == 401) {
                                    await synclogin(token_id);
                                }
                            }
                            reject(error);
                        });
                    } catch (error) {
                        console.log('ERROR SYNC: ', error);
                        // next(error);
                        reject(error);
                    }
                });
            }, 800);

        }
    });
}


module.exports = {
    loginUser,
    synclogin,
    syncToPostServer,
    syncMidlewareToPostServer,
    syncMidlewareToPostServerWithImg,
    syncMidlewareToPostLocal,
    updateStatusSyncToPusat,
    updateIdStatusSyncToPusat,
    updateIdNoKodeStatusSyncToPusat,
    syncGet,
    syncToPostServerWithImage,
    syncToPostServerLhr,
    syncToPostServerWim,
    syncBaTilangPusat,
};
