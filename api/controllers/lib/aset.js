const { t_aset, sequelize } = require('../../models');
const { Op, QueryTypes } = require('sequelize');
const config = require('../../../config/config');
const fs = require('fs');
const path = require("path");
const moment = require('moment');

const uploadPathImageAset = (file_name) => {
    const uploadPath = path.join(config.path_upload) + '/aset/' + file_name;
    return uploadPath;
}

const imageUrlAset = (file_name) => {
    const imageUrl = `${config.image_url}aset/${file_name}`;
    return imageUrl;
}

exports.uploadImage = async (kode, nama, namaImage, req, res) => {
    if (req) {
        console.log('FILE IMAGE : ', req.name);
        console.log('SIZE IMAGE : ', req.size);
        const nama_aset = nama.replace(/\s/g, '')
        if (req.size > 2 * 1024 * 1024) {
            console.log(`Size File Max. 2 Mb. File ${req.name} Melebihi Ukuran`);
            return {
                success: false,
                message: `Size File Max. 2 Mb. File ${req.name} Melebihi Ukuran`
            }
        }

        const extensionName = path.extname(req.name); // fetch the file extension
        const allowedExtension = ['.png', '.jpg', '.jpeg'];

        console.log('FORMAT IMAGE : ', extensionName);

        if (!allowedExtension.includes(extensionName)) {
            
            return {
                success: false,
                message: "Format File Yang Di Izinkan [*.png, *.jpg, *.jpeg]"
            }
        }


        var filename = kode + '_'+ nama_aset + '_' + namaImage + '_' + moment().format('YYYY_MM_DD_HH_mm_ss') + '_' + moment().valueOf() + extensionName;

        const uploadPath = uploadPathImageAset(filename); ////config.path_upload+'/'+file_name;
        const imageUrl = imageUrlAset(filename); //`${config.image_url}penimbangan/${file_name}`;
        // fileImg.mv(uploadPath);
        var dataUpload = {
            status: true,
            imgPath: uploadPath || '',
            imgName: filename || '',
            imgUrl: imageUrl || ''
        }

        req.mv(uploadPath, function (err) {
            if (err)
                console.log(err);
            return err;

        });
        // console.log(dataUpload)
        return dataUpload;
    } else {
        var dataUpload = {
            imgPath: '',
            imgName: '',
            imgUrl: ''
        }
        console.log('DATA UPLOAD : ', dataUpload);
        return dataUpload;
    }

}

exports.removeImage = async (file_name) => {
    const pathImage = path.join(config.path_upload) + '/aset/' + file_name;
    console.log(`REMOVE IMAGE: ${pathImage}` )
    try {
        fs.unlinkSync(pathImage)
    } catch (error) {
        console.error(error)
    }
}

exports.upsert_kondisi = async (arr_kondisi, kondisi_id, upsert_at, upsert_by) => {
    console.log('SUB KONDISI : ', arr_kondisi);
    if (arr_kondisi.length > 0) {
        var upsert = [];

        // Mulai transaksi di sini
        const t = await sequelize.transaction();

        try {
            var sql_chk = `SELECT COUNT(*) AS jml FROM jt_kondisi WHERE kondisi_id = '${kondisi_id}';`;
            const result_chk = await sequelize.query(sql_chk, {
                type: QueryTypes.SELECT,
                transaction: t, // Sertakan transaksi di sini
                logging: false
            });

            if (Number(result_chk[0].jml) != arr_kondisi.length) {
                var del = await delete_kondisi_ktr(kondisi_id, t); // Sertakan transaksi di sini
                console.log('DELETE KONDISI : ', del);
            }

            for (var i = 0; i < arr_kondisi.length; i++) {
                var sql = `SELECT * FROM jt_kondisi WHERE kondisi_id = '${kondisi_id}' AND sub_kondisi_aset_id = ${Number(arr_kondisi[i])};`;
                const result = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    transaction: t, // Sertakan transaksi di sini
                    logging: false
                });

                console.log(Object.keys(result).length);

                if (Object.keys(result).length > 0) {
                    console.log('UPSERT');
                    var del = await delete_kondisi(kondisi_id, arr_kondisi[i], t); // Sertakan transaksi di sini
                    if (del == 1) {
                        var insert = await insert_kondisi(kondisi_id, arr_kondisi[i], upsert_at, upsert_by, t); // Sertakan transaksi di sini
                        upsert.push(Number(insert));
                    } else {
                        var update = await update_kondisi(kondisi_id, arr_kondisi[i], upsert_at, upsert_by, t); // Sertakan transaksi di sini
                        upsert.push(Number(update));
                    }
                } else {
                    console.log('INSERT');
                    var sql = `SELECT * FROM jt_sub_kondisi_aset WHERE id =${Number(arr_kondisi[i])}`;
                    const result_rol = await sequelize.query(sql, {
                        type: QueryTypes.SELECT,
                        transaction: t, // Sertakan transaksi di sini
                        logging: true
                    });

                    if (result_rol.length > 0) {
                        var insert = await insert_kondisi(kondisi_id, arr_kondisi[i], upsert_at, upsert_by, t); // Sertakan transaksi di sini
                        upsert.push(Number(insert));
                    }
                }
            }

            // Commit transaksi setelah semua operasi selesai
            await t.commit();
            return upsert;
        } catch (error) {
            // Rollback transaksi jika terjadi kesalahan
            await t.rollback();
            console.log(error);
            return 0;
        }
    }
}

const insert_kondisi = async (kondisi_id, sub_kondisi_aset_id, created_at, created_by) => {
    const t = await sequelize.transaction();

    try {
        var sql = `INSERT INTO jt_kondisi
                    (kondisi_id, sub_kondisi_aset_id, created_at, created_by)
                   VALUES
                    ('${kondisi_id}', '${sub_kondisi_aset_id}', '${moment(created_at).format('YYYY-MM-DD HH:mm:ss')}', ${created_by})`;

        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        // console.log('INSERT : ',res);
        return res;
    } catch (error) {
        console.log(error);
        await t.rollback();
        return 0;
    }
}

const update_kondisi = async (kondisi_id, sub_kondisi_aset_id, updated_at, updated_by) => {
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_kondisi SET
                    kondisi_id = '${kondisi_id}',
                    sub_kondisi_aset_id = '${sub_kondisi_aset_id}',
                    updated_at = '${moment(updated_at).format('YYYY-MM-DD HH:mm:ss')}',
                    updated_by = ${updated_by}
                  WHERE
                    kondisi_id = '${kondisi_id}'`;
        // console.log(sql);
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
        await t.rollback();
    }
}

const delete_kondisi = async (kondisi_id, sub_kondisi_aset_id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_kondisi WHERE kondisi_id = '${kondisi_id}' AND sub_kondisi_aset_id = ${sub_kondisi_aset_id}`;

        const res_delete = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_delete[1].command == 'DELETE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        await t.rollback();
        return 0;
    }
}

const delete_kondisi_ktr = async (kondisi_id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_kondisi WHERE kondisi_id = '${kondisi_id}'`;

        const res_delete = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_delete[1].command == 'DELETE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        await t.rollback();
        return 0;
    }
}

exports.upsert_aset = async (arraset, kegiatan_id) => {
    console.log('ASET ARR : ', arraset);
    if (arraset.length > 0) {
        let upsert = '';
        for (let i = 0; i < arraset.length; i++) {
            var sql = `SELECT * FROM jt_aset_temp WHERE id = '${arraset[i]}'`;// AND dokumen_id = ${arrdokumen[i]}`;
            //console.log(sql)    
            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            //var arrImg = [];
            if (result.length > 0) {
                const field = {
                    kategori_id: result[0].kategori_id,
                    kegiatan_id: kegiatan_id,
                    jenis_id: result[0].jenis_id,
                    satuan_id: result[0].satuan_id,
                    lokasi_uppkb_id: result[0].lokasi_uppkb_id,
                    bptd_id: result[0].bptd_id,
                    kondisi_id: result[0].kondisi_id,
                    sub_kondisi_aset_id: result[0].sub_kondisi_aset_id,
                    kode: result[0].kode,
                    kode_bmn: result[0].kode_bmn,
                    nama: result[0].nama,
                    nup: result[0].nup,
                    nilai_perolehan: result[0].nilai_perolehan,
                    no_spk: result[0].no_spk,
                    uraian: result[0].uraian,
                    spesifikasi: result[0].spesifikasi,
                    keterangan: result[0].keterangan? result[0].keterangan : '',
                    is_active: result[0].is_active ? result[0].is_active : true,
                    img1_name: result[0].img1_name,
                    img1_url: result[0].img1_url,
                    img2_name: result[0].img2_name,
                    img2_url: result[0].img2_url,
                    img3_name: result[0].img3_name,
                    img3_url: result[0].img3_url,
                    img4_name: result[0].img4_name,
                    img4_url: result[0].img4_url,
                    created_at: result[0] .created_at,
                    created_by: result[0].created_by,
                    parent_id: result[0].parent_id,
                    is_terpasang: result[0].is_terpasang,
                    is_parent: result[0].is_parent,
                };

                var insert = await insert_aset(field);
                if (insert == 1) {
                    upsert = result[0].temp_id;
                    await delete_aset(result[0].id);
                    await update_pergantian(result[0].parent_id);
                }
            }
        }
        return upsert;
    }
}

const insert_aset = async (field) => {
    try {
        
        return sequelize.transaction().then(function (t) {
            return t_aset.create(field, { transaction: t, logging: false }).then(async (data) => {
                try {
                    t.commit();
                    return 1;
                } catch (error) {
                    t.rollback();
                    return 0;
                }
            });
        });

    } catch (error) {
        await t.rollback();
    }
}

const update_pergantian = async (aset_id) => {
    if (aset_id) {
        const t = await sequelize.transaction();

        try {
            var sql2 = `SELECT penanganan_id FROM jt_pergantian WHERE aset_id = '${aset_id}'`;
            //console.log(sql)    
            const result = await sequelize.query(sql2, {
                type: QueryTypes.SELECT,
                transaction: t,
                logging: false
            });

            var sql_up = `UPDATE jt_penanganan SET
                        is_penanganan = TRUE
                    WHERE
                        id = '${result[0].penanganan_id}'`;
            await sequelize.query(sql_up, {
                transaction: t,
                logging: false
            });

            var sql_up_asset = `UPDATE jt_aset SET
                        is_parent = TRUE
                    WHERE
                        id = '${aset_id}'`;
            await sequelize.query(sql_up_asset, {
                transaction: t,
                logging: false
            });

            var sql = `UPDATE jt_pergantian SET
                        status_pergantian = TRUE
                    WHERE
                        aset_id = '${aset_id}'`;
            // console.log(sql);
            const res_update = await sequelize.query(sql, {
                transaction: t,
                logging: false
            });

            await t.commit();
            if (res_update[1].command == 'UPDATE') {
                //console.log('UPDATE : ',res_update[1].command);
                return 1;
            } else {
                return 0;
            }
        } catch (error) {
            await t.rollback();
        }
    } else {
        return 0;
    }
}

exports.delete_aset_temp = async (temp_id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_aset_temp WHERE temp_id = '${temp_id}'`;

        const res_delete = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_delete[1].command == 'DELETE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        await t.rollback();
        return 0;
    }
}

const delete_aset = async (id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_aset_temp WHERE id = '${id}'`;

        const res_delete = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (res_delete[1].command == 'DELETE') {
            //console.log('UPDATE : ',res_update[1].command);
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(error);
        await t.rollback();
        return 0;
    }
}
