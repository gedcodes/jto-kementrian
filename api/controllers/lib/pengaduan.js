const { t_distribusi_aduan, sequelize } = require('../../models');
const { Op, QueryTypes } = require('sequelize');
const config = require('../../../config/config');
const fs = require('fs');
const path = require("path");
const moment = require('moment');
const { resourceLimits } = require('worker_threads');


const timer = ms => new Promise(res => setTimeout(res, ms));

const uploadPathAduan = (file_name) => {
    const uploadPath = path.join(config.path_upload) + '/aduan/' + file_name;

    return uploadPath;
}

const imgUrlAduan = (file_name) => {
    const imageUrl = `${config.image_url}aduan/${file_name}`;

    return imageUrl;
}

exports.randomString = (length) => {
            var result = '';
            var characters = '0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        },

exports.uploadFile = async(nama, kode, req) => {
    if (req) {
        console.log('FILE IMAGE : ',req.name);
        let fileImg = req.name;
        if (req.size > 1 * 8192 * 8192) {
            console.log(`Size File Max. 4 Mb. File ${req.name} Melebihi Ukuran`);
        }

        const extensionName = path.extname(req.name); // fetch the file extension
        const allowedExtension = ['.pdf'];

        if (!allowedExtension.includes(extensionName)) {
            return res.status(422).send({
                success: false,
                message: "Format File Yang Di Izinkan [*.pdf]",
            });
        } 

        
        var filename = nama + '_' + moment().format('YYYY_MM_DD_HH_mm_ss') + '_' + moment().valueOf() + '_' + kode + '.pdf';

        const uploadPath = uploadPathAduan(filename); ////config.path_upload+'/'+file_name;
        const fileUrl = imgUrlAduan(filename); //`${config.image_url}penimbangan/${file_name}`;
        // fileImg.mv(uploadPath);
        var dataUpload = {
            pdfPath: uploadPath || '',
            pdfName: filename || '',
            pdfUrl: fileUrl || ''
        }

        req.mv(uploadPath, function(err) {
            if (err)
                console.log(err);
                return err;

        });
        return dataUpload;
    } else {
        var dataUpload = {
            pdfPath: '',
            pdfName: '',
            pdfUrl: ''
        }
        // console.log('DATA UPLOAD : ', dataUpload);
        return dataUpload;
    }
}

exports.uploadImage = async (kode, namaImg, req) => {
    if (req) {
        console.log('FILE IMAGE : ', req.name);
        console.log('SIZE IMAGE : ', req.size);
        // const nama_aset = nama.replace(/\s/g, '')
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


        var filename = kode + '_' + namaImg + '_' + moment().format('YYYY_MM_DD_HH_mm_ss') + '_' + moment().valueOf() + extensionName;

        const uploadPath = uploadPathAduan(filename); ////config.path_upload+'/'+file_name;
        const imageUrl = imgUrlAduan(filename); //`${config.image_url}penimbangan/${file_name}`;
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

exports.update_status_pengaduan = async (id, tablename, status) => {
    const t = await sequelize.transaction();
    try {
        var sql = `UPDATE ${tablename} SET is_penanganan = '${status}' WHERE id = '${id}'`;

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

exports.update_status_perbaikan = async (id, tablename, status) => {
    const t = await sequelize.transaction();
    try {
        var sql = `UPDATE ${tablename} SET status_perbaikan = '${status}' WHERE id = '${id}'`;

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

exports.update_perbaikan_by_aset = async (aset_id, tablename, status) => {
    const t = await sequelize.transaction();
    try {
        var sql = `UPDATE ${tablename} SET status_perbaikan = '${status}' WHERE aset_id = '${aset_id}'`;

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

exports.update_status_distribusi = async (pengaduan_id, tablename, status) => {
    const t = await sequelize.transaction();
    try {
        var sql = `UPDATE ${tablename} SET status = '${status}' WHERE pengaduan_id = '${pengaduan_id}'`;

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

exports.update_kondisi_aset = async (id, tablename, kondisi_id) => {
    const t = await sequelize.transaction();
    try {
        var sql = `UPDATE ${tablename} SET kondisi_id = '${kondisi_id}' WHERE id = '${id}'`;

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

exports.insert_distribusi = async (field, pengaduan_id) => {
    try {

        var sql = `SELECT * FROM jt_distribusi_aduan WHERE pengaduan_id = '${pengaduan_id}'`;// AND dokumen_id = ${arrdokumen[i]}`;
        //console.log(sql)    
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length == 0) {
            return sequelize.transaction().then(function (t) {
                return t_distribusi_aduan.create(field, { transaction: t, logging: false }).then(async (data) => {
                    try {
                        t.commit();
                        return data;
                    } catch (error) {
                        t.rollback();
                        return 0;
                    }
                });
            });
        } else {
            return sequelize.transaction().then(function (t) {
                return t_distribusi_aduan.update(field, { where: { pengaduan_id: pengaduan_id }, transaction: t, logging: false }).then(async (data) => {
                    try {
                        t.commit();
                        return result[0];
                    } catch (error) {
                        t.rollback();
                        return 0;
                    }
                });
            });
        }
    } catch (error) {
        await t.rollback();
    }
}

exports.insert_distribusi_tembusan = async (distribusi_id, arrdirektorat, created_at, created_by) => {
    if (arrdirektorat.length > 0) {
        console.log(distribusi_id);
        var upsert = [];
        var sql_chk = `SELECT COUNT(*) AS jml FROM jt_distribusi_tembusan WHERE distribusi_aduan_id = '${distribusi_id}';`;

        const result_chk = await sequelize.query(sql_chk, {
            type: QueryTypes.SELECT,
            logging: false
        });


        if (Number(result_chk[0].jml) > 0) {
            var del = await delete_tembusan(distribusi_id);
            console.log('DELETE DISTRIBUSI TEMBUSAN : ', del);
        }

        for (var i = 0; i < arrdirektorat.length; i++) {

            var sql = `SELECT * FROM jt_distribusi_tembusan WHERE distribusi_aduan_id = '${distribusi_id}' AND direktorat_id = ${Number(arrdirektorat[i])};`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            if (Object.keys(result).length > 0) {
                var del = await delete_distribusi_tembusan(distribusi_id, arrdirektorat[i]);
                if (del == 1) {
                    var insert = await insert_tembusan(distribusi_id, arrdirektorat[i], created_at, created_by);
                    upsert.push(Number(insert));
                } else {
                    var update = await update_distribusi_tembusan(distribusi_id, arrdirektorat[i], created_at, created_by);
                    upsert.push(Number(update));
                }
            } else {
                var sql = `SELECT * FROM jt_direktorat WHERE id = ${arrdirektorat[i]}`;
                const result_rol = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: true
                });

                if (result_rol.length > 0) {
                    var insert = await insert_tembusan(distribusi_id, arrdirektorat[i], created_at, created_by);
                    upsert.push(Number(insert));
                }
            }

            await timer(150);

        }

        return upsert;
    }
}

const insert_tembusan = async (distribusi_id, direktorat_id, created_at, created_by) => {
    const t = await sequelize.transaction();

    try {
        var sql = `INSERT INTO jt_distribusi_tembusan
                    (distribusi_aduan_id, direktorat_id, created_at, created_by)
                VALUES
                    ('${distribusi_id}', '${direktorat_id}', '${created_at}', ${created_by})`;

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

const update_distribusi_tembusan = async (distribusi_id, direktorat_id, updated_at, updated_by) => {
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_distribusi_tembusan SET
                    distribusi_aduan_id = '${distribusi_id}',
                    direktorat_id = '${direktorat_id}',
                    updated_at = '${moment(updated_at).format('YYYY-MM-DD HH:mm:ss')}',
                    updated_by = ${updated_by}
                WHERE
                    distribusi_aduan_id = '${distribusi_id}' AND direktorat_id = ${direktorat_id}`;
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

const delete_distribusi_tembusan = async (distribusi_id, direktorat_id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_distribusi_tembusan WHERE distribusi_aduan_id = '${distribusi_id}' AND direktorat_id = ${direktorat_id}`;

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

const delete_tembusan = async (distribusi_id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_distribusi_tembusan WHERE distribusi_aduan_id = '${distribusi_id}'`;

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

exports.upsert_kategori_status_role = async (arr_role, kategori_status_id, upsert_at, upsert_by) => {
    if (arr_role.length > 0) {

        var upsert = [];
        var sql_chk = `SELECT COUNT(*) AS jml FROM jt_kategori_status_role WHERE kategori_status_id = '${kategori_status_id}';`;

        const result_chk = await sequelize.query(sql_chk, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (Number(result_chk[0].jml) != arr_role.length) {
            var del = await delete_kategori_status_role_ktr(kategori_status_id);
            console.log('DELETE KATEGORI STATUS ROLE : ', del);
        }

        for (var i = 0; i < arr_role.length; i++) {

            var sql = `SELECT * FROM jt_kategori_status_role WHERE kategori_status_id = '${kategori_status_id}' AND role_id = ${Number(arr_role[i])};`;

            const result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            if (Object.keys(result).length > 0) {
                var del = await delete_kategori_status_role(kategori_status_id, arr_role[i]);
                if (del == 1) {
                    var insert = await insert_kategori_status_role(kategori_status_id, arr_role[i], upsert_at, upsert_by);
                    upsert.push(Number(insert));
                } else {
                    var update = await update_kategori_status_role(kategori_status_id, arr_role[i], upsert_at, upsert_by);
                    upsert.push(Number(update));
                }
            } else {
                var sql = `SELECT * FROM roles WHERE id = ${arr_role[i]}`;
                const result_rol = await sequelize.query(sql, {
                    type: QueryTypes.SELECT,
                    logging: true
                });

                if (result_rol.length > 0) {
                    var insert = await insert_kategori_status_role(kategori_status_id, arr_role[i], upsert_at, upsert_by);
                    upsert.push(Number(insert));
                }
            }

            await timer(150);

        }

        return upsert;
    }
}

const insert_kategori_status_role = async (kategori_status_id, role_id, created_at, created_by) => {
    const t = await sequelize.transaction();

    try {
        var sql = `INSERT INTO jt_kategori_status_role
                    (kategori_status_id, role_id, created_at, created_by)
                   VALUES
                    ('${kategori_status_id}', '${role_id}', '${moment(created_at).format('YYYY-MM-DD HH:mm:ss')}', ${created_by})`;

        // console.log(sql);
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

const update_kategori_status_role = async (kategori_status_id, role_id, updated_at, updated_by) => {
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_kategori_status_role SET
                    kategori_status_id = '${kategori_status_id}',
                    role_id = '${role_id}',
                    updated_at = '${moment(updated_at).format('YYYY-MM-DD HH:mm:ss')}',
                    updated_by = ${updated_by}
                  WHERE
                    kategori_status_id = '${kategori_status_id}'`;
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

const delete_kategori_status_role = async (kategori_status_id, role_id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_kategori_status_role WHERE kategori_status_id = '${kategori_status_id}' AND role_id = ${role_id}`;

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

const delete_kategori_status_role_ktr = async (kategori_status_id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_kategori_status_role WHERE kategori_status_id = '${kategori_status_id}'`;

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

exports.delete_pergantian = async (penanganan_id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_pergantian WHERE penanganan_id = '${penanganan_id}'`;

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

exports.delete_detail_penanganan = async (penanganan_id) => {
    const t = await sequelize.transaction();

    try {
        var sql = `DELETE FROM jt_detail_penanganan WHERE penanganan_id = '${penanganan_id}'`;

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
