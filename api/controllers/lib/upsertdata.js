const { sequelize } = require('../../models');
const { Op, QueryTypes } = require('sequelize');
const moment = require('moment');

const padLeft = (num, size) => {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

/*****************************************************************BEGIN PASAL******************************************************************************** */
const insert_pasal = async (id, no_pasal, pasal, desk_pasal, denda_maks, keterangan, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {        
        var sql = `INSERT INTO jt_pasal
                        (id, no_pasal, pasal, desk_pasal, denda_maks, keterangan, is_active, created_by, created_at)
                    VALUES
                        (${id}, ${no_pasal}, '${pasal}', '${desk_pasal}', ${denda_maks}, '${keterangan}', ${is_active}, ${upsertby}, '${upsert_date}')`;
        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        await t.rollback();
    }           
}

const update_pasal = async (id, no_pasal, pasal, desk_pasal, denda_maks, keterangan, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_pasal SET 
                        no_pasal = ${no_pasal},
                        pasal = '${pasal}',
                        desk_pasal = '${desk_pasal}',
                        denda_maks = ${denda_maks},
                        keterangan = '${keterangan}',
                        updated_by = ${upsertby},
                        updated_at = '${upsert_date}',
                        is_active = ${is_active}
                    WHERE id = ${id}`;
        //console.log(sql);
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
    //return res_update[1].command;
}    

exports.upsert_pasal = async(id, no_pasal, pasal, desk_pasal, denda_maks, keterangan, is_active, upsertby, upsert_date) => {
    var sql = `SELECT * FROM jt_pasal WHERE id = ${id} AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    // console.log('NO KENDARAAN : ', no_reg_kend);
    if (Object.keys(result).length > 0) {
        var update = await update_pasal(id, no_pasal, pasal, desk_pasal, denda_maks, keterangan, is_active, upsertby, upsert_date);
        console.log('update', update);
        return update;
    } else {
        var insert = await insert_pasal(id, no_pasal, pasal, desk_pasal, denda_maks, keterangan, is_active, upsertby, upsert_date);
        console.log('insert', insert);
        return insert;        
    }
}
/*****************************************************************END PASAL******************************************************************************** */


/*****************************************************************BEGIN SITAAN******************************************************************************** */
const insert_sitaan = async (id, sanksi_id, dokumen_id, keterangan, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {        
        var sql = `INSERT INTO jt_sitaan
                        (id, sanksi_id, dokumen_id, keterangan, is_active, created_by, created_at)
                    VALUES
                        (${id}, ${sanksi_id}, ${dokumen_id}, '${keterangan}', ${is_active}, ${upsertby}, '${upsert_date}')`;
        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        await t.rollback();
    }           
}

const update_sitaan = async (id, sanksi_id, dokumen_id, keterangan, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_sitaan SET 
                        sanksi_id = ${sanksi_id},
                        dokumen_id = ${dokumen_id},
                        keterangan = '${keterangan}',
                        updated_by = ${upsertby},
                        updated_at = '${upsert_date}',
                        is_active = ${is_active}
                    WHERE id = ${id}`;
        //console.log(sql);
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
    //return res_update[1].command;
}    

exports.upsert_sitaan = async(id, sanksi_id, dokumen_id, keterangan, is_active, upsertby, upsert_date) => {
    var sql = `SELECT * FROM jt_sitaan WHERE id = ${id} AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    // console.log('NO KENDARAAN : ', no_reg_kend);
    if (Object.keys(result).length > 0) {
        var update = await update_sitaan(id, sanksi_id, dokumen_id, keterangan, is_active, upsertby, upsert_date);
        console.log('update', update);
        return update;
    } else {
        var insert = await insert_sitaan(id, sanksi_id, dokumen_id, keterangan, is_active, upsertby, upsert_date);
        console.log('insert', insert);
        return insert;        
    }
}
/*****************************************************************END SUB SANKSI******************************************************************************** */


/*****************************************************************BEGIN SUB SANKSI******************************************************************************** */
const insert_sub_sanksi = async (id, sanksi_id, kode, nama, keterangan, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {        
        var sql = `INSERT INTO jt_sub_sanksi
                        (id, sanksi_id, kode, nama, keterangan, is_active, created_by, created_at)
                    VALUES
                        (${id}, ${sanksi_id}, '${kode}', '${nama}', '${keterangan}', ${is_active}, ${upsertby}, '${upsert_date}')`;
        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        await t.rollback();
    }           
}

const update_sub_sanksi = async (id, sanksi_id, kode, nama, keterangan, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_sub_sanksi SET 
                        sanksi_id = ${sanksi_id},
                        kode = '${kode}',
                        nama = '${nama}',
                        keterangan = '${keterangan}',
                        updated_by = ${upsertby},
                        updated_at = '${upsert_date}',
                        is_active = ${is_active}
                    WHERE id = ${id}`;
        //console.log(sql);
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
    //return res_update[1].command;
}    

exports.upsert_sub_sanksi = async(id, sanksi_id, kode, nama, keterangan, is_active, upsertby, upsert_date) => {
    var sql = `SELECT * FROM jt_sub_sanksi WHERE id = ${id} AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    // console.log('NO KENDARAAN : ', no_reg_kend);
    if (Object.keys(result).length > 0) {
        var update = await update_sub_sanksi(id, sanksi_id, kode, nama, keterangan, is_active, upsertby, upsert_date);
        console.log('update', update);
        return update;
    } else {
        var insert = await insert_sub_sanksi(id, sanksi_id, kode, nama, keterangan, is_active, upsertby, upsert_date);
        console.log('insert', insert);
        return insert;        
    }
}
/*****************************************************************END SUB SANKSI******************************************************************************** */



/*****************************************************************BEGIN SANKSI******************************************************************************** */
const insert_sanksi = async (id, kode, nama, deskripsi, keterangan, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {        
        var sql = `INSERT INTO jt_sanksi
                        (id, kode, nama, deskripsi, keterangan, is_active, created_by, created_at)
                    VALUES
                        (${id}, '${kode}', '${nama}', '${deskripsi}', '${keterangan}', ${is_active}, ${upsertby}, '${upsert_date}')`;
        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        await t.rollback();
    }           
}

const update_sanksi = async (id, kode, nama, deskripsi, keterangan, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_sanksi SET 
                        kode = '${kode}',
                        nama = '${nama}',
                        deskripsi = '${deskripsi}',
                        keterangan = '${keterangan}',
                        updated_by = ${upsertby},
                        updated_at = '${upsert_date}',
                        is_active = ${is_active}
                    WHERE id = ${id}`;
        //console.log(sql);
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
    //return res_update[1].command;
}    

exports.upsert_sanksi = async(id, kode, nama, deskripsi, keterangan, is_active, upsertby, upsert_date) => {
    var sql = `SELECT * FROM jt_sanksi WHERE id = ${id} AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    // console.log('NO KENDARAAN : ', no_reg_kend);
    if (Object.keys(result).length > 0) {
        var update = await update_sanksi(id, kode, nama, deskripsi, keterangan, is_active, upsertby, upsert_date);
        console.log('update', update);
        return update;
    } else {
        var insert = await insert_sanksi(id, kode, nama, deskripsi, keterangan, is_active, upsertby, upsert_date);
        console.log('insert', insert);
        return insert;        
    }
}
/*****************************************************************END SANKSI******************************************************************************** */


/*****************************************************************BEGIN  JENIS PELANGGARAN******************************************************************************** */
const insert_jenis_pelanggaran = async (id, kode, nama, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {        
        var sql = `INSERT INTO jt_jenis_pelanggaran
                        (id, kode, nama, is_active, created_by, created_at)
                    VALUES
                        (${id}, '${kode}', '${nama}', ${is_active}, ${upsertby}, '${upsert_date}')`;
        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        await t.rollback();
    }           
}

const update_jenis_pelanggaran = async (id, kode, nama, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_jenis_pelanggaran SET 
                        kode = '${kode}',
                        nama = '${nama}',
                        updated_by = ${upsertby},
                        updated_at = '${upsert_date}',
                        is_active = ${is_active}
                    WHERE id = ${id}`;
        //console.log(sql);
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
    //return res_update[1].command;
}    

exports.upsert_jenis_pelanggaran = async(id, kode, nama, is_active, upsertby, upsert_date) => {
    var sql = `SELECT * FROM jt_jenis_pelanggaran WHERE id = ${id} AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    // console.log('NO KENDARAAN : ', no_reg_kend);
    if (Object.keys(result).length > 0) {
        var update = await update_jenis_pelanggaran(id, kode, nama, is_active, upsertby, upsert_date);
        console.log('update', update);
        return update;
    } else {
        var insert = await insert_jenis_pelanggaran(id, kode, nama, is_active, upsertby, upsert_date);
        console.log('insert', insert);
        return insert;        
    }
}
/*****************************************************************END  JENIS PELANGGARAN******************************************************************************** */



/*****************************************************************BEGIN  DOKUMEN******************************************************************************** */
const insert_dokumen = async (id, kode, nama, is_optional, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {        
        var sql = `INSERT INTO jt_dokumen
                        (id, kode, nama, is_optional, is_active, created_by, created_at)
                    VALUES
                        (${id}, '${kode}', '${nama}', ${is_optional}, ${is_active}, ${upsertby}, '${upsert_date}')`;
        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        await t.rollback();
    }           
}

const update_dokumen = async (id, kode, nama, is_optional, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_dokumen SET 
                        kode = '${kode}',
                        nama = '${nama}',
                        is_optional = ${is_optional},
                        updated_by = ${upsertby},
                        updated_at = '${upsert_date}',
                        is_active = ${is_active}
                    WHERE id = ${id}`;
        //console.log(sql);
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
    //return res_update[1].command;
}    

exports.upsert_dokumen = async(id, kode, nama, is_optional, is_active, upsertby, upsert_date) => {
    var sql = `SELECT * FROM jt_dokumen WHERE id = ${id} AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    // console.log('NO KENDARAAN : ', no_reg_kend);
    if (Object.keys(result).length > 0) {
        var update = await update_dokumen(id, kode, nama, is_optional, is_active, upsertby, upsert_date);
        console.log('update', update);
        return update;
    } else {
        var insert = await insert_dokumen(id, kode, nama, is_optional, is_active, upsertby, upsert_date);
        console.log('insert', insert);
        return insert;        
    }
}
/*****************************************************************END DOKUMEN******************************************************************************** */



/*****************************************************************BEGIN  KATEGORI KEPEMILIKAN******************************************************************************** */
const insert_kategori_kepemilikan = async (id, kode, nama, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {        
        var sql = `INSERT INTO jt_kategori_kepemilikan
                        (id, kode, nama, is_active, created_by, created_at)
                    VALUES
                        (${id}, '${kode}', '${nama}', ${is_active}, ${upsertby}, '${upsert_date}')`;
        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        await t.rollback();
    }           
}

const update_kategori_kepemilikan = async (id, kode, nama,  is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_kategori_kepemilikan SET 
                        kode = '${kode}',
                        nama = '${nama}',
                        updated_by = ${upsertby},
                        updated_at = '${upsert_date}',
                        is_active = ${is_active}
                    WHERE id = ${id}`;
        //console.log(sql);
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
    //return res_update[1].command;
}    

exports.upsert_kategori_kepemilikan = async(id, kode, nama, is_active, upsertby, upsert_date) => {
    var sql = `SELECT * FROM jt_kategori_kepemilikan WHERE id = ${id} AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    // console.log('NO KENDARAAN : ', no_reg_kend);
    if (Object.keys(result).length > 0) {
        var update = await update_kategori_kepemilikan(id, kode, nama, is_active, upsertby, upsert_date);
        console.log('update', update);
        return update;
    } else {
        var insert = await insert_kategori_kepemilikan(id, kode, nama, is_active, upsertby, upsert_date);
        console.log('insert', insert);
        return insert;        
    }
}
/*****************************************************************END KATEGORI KEPEMILIKAN******************************************************************************** */


/*****************************************************************BEGIN GOL SIM / IDENTITAS******************************************************************************** */
const insert_golongan_sim = async (id, kode, nama, keterangan, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {        
        var sql = `INSERT INTO jt_gol_sim
                        (id, kode, nama, keterangan, is_active, created_by, created_at)
                    VALUES
                        (${id}, '${kode}', '${nama}', '${keterangan}', ${is_active}, ${upsertby}, '${upsert_date}')`;
        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        await t.rollback();
    }           
}

const update_golongan_sim = async (id, kode, nama, keterangan, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_gol_sim SET 
                        kode = '${kode}',
                        nama = '${nama}',
                        keterangan = '${keterangan}',
                        updated_by = ${upsertby},
                        updated_at = '${upsert_date}',
                        is_active = ${is_active}
                    WHERE id = ${id}`;
        //console.log(sql);
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
    //return res_update[1].command;
}    

exports.upsert_golongan_sim = async(id, kode, nama, keterangan, is_active, upsertby, upsert_date) => {
    var sql = `SELECT * FROM jt_gol_sim WHERE id = ${id} AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    // console.log('NO KENDARAAN : ', no_reg_kend);
    if (Object.keys(result).length > 0) {
        var update = await update_golongan_sim(id, kode, nama, keterangan, is_active, upsertby, upsert_date);
        console.log('update', update);
        return update;
    } else {
        var insert = await insert_golongan_sim(id, kode, nama, keterangan, is_active, upsertby, upsert_date);
        console.log('insert', insert);
        return insert;        
    }
}
/*****************************************************************END GOL SIM / IDENTITAS******************************************************************************** */


/*****************************************************************BEGIN SUMBU******************************************************************************** */
const insert_sumbu = async (id, konfig_sumbu, jml_sumbu, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {        
        var sql = `INSERT INTO jt_sumbu
                        (id, konfig_sumbu, jml_sumbu, is_active, created_by, created_at)
                    VALUES
                        (${id}, '${konfig_sumbu}', ${jml_sumbu}, ${is_active}, ${upsertby}, '${upsert_date}')`;
        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        await t.rollback();
    }           
}

const update_sumbu = async (id, konfig_sumbu, jml_sumbu, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_sumbu SET 
                        konfig_sumbu = '${konfig_sumbu}',
                        jml_sumbu = ${jml_sumbu},
                        updated_by = ${upsertby},
                        updated_at = '${upsert_date}',
                        is_active = ${is_active}
                    WHERE id = ${id}`;
        //console.log(sql);
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
    //return res_update[1].command;
}    

exports.upsert_sumbu = async(id, konfig_sumbu, jml_sumbu, is_active, upsertby, upsert_date) => {
    var sql = `SELECT * FROM jt_sumbu WHERE id = ${id} AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    // console.log('NO KENDARAAN : ', no_reg_kend);
    if (Object.keys(result).length > 0) {
        var update = await update_sumbu(id, konfig_sumbu, jml_sumbu, is_active, upsertby, upsert_date);
        console.log('update', update);
        return update;
    } else {
        var insert = await insert_sumbu(id, konfig_sumbu, jml_sumbu, is_active, upsertby, upsert_date);
        console.log('insert', insert);
        return insert;        
    }
}
/*****************************************************************END SUMBU******************************************************************************** */


/*****************************************************************BEGIN JENIS KENDARAAN******************************************************************************** */
const insert_jenis_kendaraan = async (id, kode, nama, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {        
        var sql = `INSERT INTO jt_jenis_kendaraan
                        (id, kode, nama, is_active, created_by, created_at)
                    VALUES
                        (${id}, '${kode}', '${nama}', ${is_active}, ${upsertby}, '${upsert_date}')`;
        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        await t.rollback();
    }           
}

const update_jenis_kendaraan = async (id, kode, nama, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_jenis_kendaraan SET 
                        kode = '${kode}',
                        nama = '${nama}',
                        updated_by = ${upsertby},
                        updated_at = '${upsert_date}',
                        is_active = ${is_active}
                    WHERE id = ${id}`;
        //console.log(sql);
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
    //return res_update[1].command;
}    

exports.upsert_jenis_kendaraan = async(id, kode, nama, is_active, upsertby, upsert_date) => {
    var sql = `SELECT * FROM jt_jenis_kendaraan WHERE id = ${id} AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    // console.log('NO KENDARAAN : ', no_reg_kend);
    if (Object.keys(result).length > 0) {
        var update = await update_jenis_kendaraan(id, kode, nama, is_active, upsertby, upsert_date);
        console.log('update', update);
        return update;
    } else {
        var insert = await insert_jenis_kendaraan(id, kode, nama, is_active, upsertby, upsert_date);
        console.log('insert', insert);
        return insert;        
    }
}
/*****************************************************************END JENIS KENDARAAN******************************************************************************** */


/*****************************************************************BEGIN UPSERT TOLERANSI******************************************************************************** */
const insert_toleransi = async (id, kode, nama, prosen_toleransi, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {        
        var sql = `INSERT INTO jt_toleransi
                        (id, kode, nama, prosen_toleransi, is_active, created_by, created_at)
                    VALUES
                        (${id}, '${kode}', '${nama}', ${prosen_toleransi}, ${is_active}, ${upsertby}, '${upsert_date}')`;
        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        await t.rollback();
    }           
}

const update_toleransi = async (id, kode, nama, prosen_toleransi, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_toleransi SET 
                        kode = '${kode}',
                        nama = '${nama}',
                        prosen_toleransi = ${prosen_toleransi},
                        updated_by = ${upsertby},
                        updated_at = '${upsert_date}',
                        is_active = ${is_active}
                    WHERE id = ${id}`;
        //console.log(sql);
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
    //return res_update[1].command;
}    

exports.upsert_toleransi = async(id, kode, nama, prosen_toleransi, is_active, upsertby, upsert_date) => {
    var sql = `SELECT * FROM jt_toleransi WHERE id = ${id} AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    // console.log('NO KENDARAAN : ', no_reg_kend);
    if (Object.keys(result).length > 0) {
        var update = await update_toleransi(id, kode, nama, prosen_toleransi, is_active, upsertby, upsert_date);
        console.log('update', update);
        return update;
    } else {
        var insert = await insert_toleransi(id, kode, nama, prosen_toleransi, is_active, upsertby, upsert_date);
        console.log('insert', insert);
        return insert;        
    }
}
/*****************************************************************END UPSERT TOLERANSI******************************************************************************** */

/*****************************************************************BEGIN UPSERT TOLERANSI UPPKB******************************************************************************** */
const insert_toleransi_uppkb = async (id, kode_uppkb, toleransi_id, keterangan, lokasi_id, komoditi_id, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {        
        var sql = `INSERT INTO jt_toleransi_uppkb
                        (id, kode_uppkb, toleransi_id, keterangan, lokasi_id, komoditi_id, is_active, created_by, created_at)
                    VALUES
                        (${id}, '${kode_uppkb}', ${toleransi_id}, '${keterangan}', ${lokasi_id}, ${komoditi_id}, ${is_active}, ${upsertby}, '${upsert_date}')`;
        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        await t.rollback();
    }           
}

const update_toleransi_uppkb = async (id, kode_uppkb, toleransi_id, keterangan, lokasi_id, komoditi_id, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_toleransi_uppkb SET 
                        kode_uppkb = '${kode_uppkb}',
                        toleransi_id = ${toleransi_id},
                        keterangan = '${keterangan}',
                        lokasi_id = ${lokasi_id},
                        komoditi_id = ${komoditi_id},
                        updated_by = ${upsertby},
                        updated_at = '${upsert_date}',
                        is_active = ${is_active}
                    WHERE id = ${id}`;
        //console.log(sql);
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
    //return res_update[1].command;
}    

exports.upsert_toleransi_uppkb = async(id, kode_uppkb, toleransi_id, keterangan, lokasi_id, komoditi_id, is_active, upsertby, upsert_date) => {
    var sql = `SELECT * FROM jt_toleransi_uppkb WHERE id = ${id} AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    console.log('UPSERT TOLERANSI UPPKB : ', result);
    if (Object.keys(result).length > 0) {
        var update = await update_toleransi_uppkb(id, kode_uppkb, toleransi_id, keterangan, lokasi_id, komoditi_id, is_active, upsertby, upsert_date);
        console.log('update', update);
        return update;
    } else {
        var insert = await insert_toleransi_uppkb(id, kode_uppkb, toleransi_id, keterangan, lokasi_id, komoditi_id, is_active, upsertby, upsert_date);
        console.log('insert', insert);
        return insert;        
    }
}
/*****************************************************************END UPSERT TOLERANSI UPPKB******************************************************************************** */

/*****************************************************************BEGIN UPSERT TOLERANSI DIMENSI******************************************************************************** */
const insert_toleransi_dimensi = async (id, kode_uppkb, prosen_pjg, prosen_lebar, prosen_tinggi, prosen_foh, prosen_roh, keterangan, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {        
        var sql = `INSERT INTO jt_toleransi_dimensi
                        (
                            id, 
                            kode_uppkb, 
                            prosen_pjg, 
                            prosen_lebar, 
                            prosen_tinggi, 
                            prosen_foh, 
                            prosen_roh, 
                            keterangan, 
                            is_active, 
                            created_by, 
                            created_at
                        )
                    VALUES
                        (
                            ${id}, 
                            '${kode_uppkb}', 
                            ${prosen_pjg}, 
                            ${prosen_lebar}, 
                            ${prosen_tinggi}, 
                            ${prosen_foh}, 
                            ${prosen_roh}, 
                            '${keterangan}', 
                            ${is_active}, 
                            ${upsertby}, 
                            '${upsert_date}'
                        )`;
        console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        console.log(error);
        await t.rollback();
    }           
}

const update_toleransi_dimensi = async (id, kode_uppkb, prosen_pjg, prosen_lebar, prosen_tinggi, prosen_foh, prosen_roh, keterangan, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_toleransi_dimensi SET 
                        kode_uppkb = '${kode_uppkb}',
                        prosen_pjg = ${prosen_pjg},
                        prosen_lebar = ${prosen_lebar},
                        prosen_tinggi = ${prosen_tinggi},
                        prosen_foh = ${prosen_foh},
                        prosen_roh = ${prosen_roh},
                        keterangan = '${keterangan}',
                        updated_by = ${upsertby},
                        updated_at = '${upsert_date}',
                        is_active = ${is_active}
                    WHERE id = ${id}`;
        console.log(sql);
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
        // console.log(error);
        await t.rollback();
    }
    //return res_update[1].command;
}    

exports.upsert_toleransi_dimensi = async(id, kode_uppkb, prosen_pjg, prosen_lebar, prosen_tinggi, prosen_foh, prosen_roh, keterangan, is_active, upsertby, upsert_date) => {
    var sql = `SELECT * FROM jt_toleransi_dimensi WHERE id = ${id} AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    // console.log('NO KENDARAAN : ', no_reg_kend);
    if (Object.keys(result).length > 0) {
        var update = await update_toleransi_dimensi(id, kode_uppkb, prosen_pjg, prosen_lebar, prosen_tinggi, prosen_foh, prosen_roh, keterangan, is_active, upsertby, upsert_date);
        console.log('update', update);
        return update;
    } else {
        var insert = await insert_toleransi_dimensi(id, kode_uppkb, prosen_pjg, prosen_lebar, prosen_tinggi, prosen_foh, prosen_roh, keterangan, is_active, upsertby, upsert_date);
        console.log('insert', insert);
        return insert;        
    }
}
/*****************************************************************END UPSERT TOLERANSI DIMENSI******************************************************************************** */


/*****************************************************************BEGIN UPSERT TOLERANSI KOMODITI******************************************************************************** */
const insert_toleransi_komoditi = async (id, kategori_komoditi_id, prosen_toleransi, tgl_mulai, tgl_selesai, durasi, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {        
        var sql = `INSERT INTO jt_toleransi_komoditi
                        (id, kategori_komoditi_id, prosen_toleransi, tgl_mulai, tgl_selesai, durasi, is_active, created_by, created_at)
                    VALUES
                        (${id}, ${kategori_komoditi_id}, ${prosen_toleransi}, '${tgl_mulai}', '${tgl_selesai}', ${durasi}, ${is_active}, ${upsertby}, '${upsert_date}')`;
        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        console.log(error);
        await t.rollback();
    }           
}

const update_toleransi_komoditi = async (id, kategori_komoditi_id, prosen_toleransi, tgl_mulai, tgl_selesai, durasi, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_toleransi_komoditi SET 
                        kategori_komoditi_id = ${kategori_komoditi_id},
                        prosen_toleransi = ${prosen_toleransi},
                        tgl_mulai = '${tgl_mulai}',
                        tgl_selesai = '${tgl_selesai}',
                        durasi = ${durasi},
                        updated_by = ${upsertby},
                        updated_at = '${upsert_date}',
                        is_active = ${is_active}
                    WHERE id = ${id}`;
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
        // console.log(error);
        await t.rollback();
    }
    //return res_update[1].command;
}    

exports.upsert_toleransi_komoditi = async(id, kategori_komoditi_id, prosen_toleransi, tgl_mulai, tgl_selesai, durasi, is_active, upsertby, upsert_date) => {
    var sql = `SELECT * FROM jt_toleransi_komoditi WHERE id = ${id} AND kategori_komoditi_id = ${kategori_komoditi_id} AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    // console.log('NO KENDARAAN : ', no_reg_kend);
    if (Object.keys(result).length > 0) {
        var update = await update_toleransi_komoditi(id, kategori_komoditi_id, prosen_toleransi, tgl_mulai, tgl_selesai, durasi, is_active, upsertby, upsert_date);
        console.log('update', update);
        return update;
    } else {
        var insert = await insert_toleransi_komoditi(id, kategori_komoditi_id, prosen_toleransi, tgl_mulai, tgl_selesai, durasi, is_active, upsertby, upsert_date);
        console.log('insert', insert);
        return insert;        
    }
}
/*****************************************************************END UPSERT TOLERANSI KOMODITI******************************************************************************** */


/*****************************************************************BEGIN UPSERT KATEGORI KOMODITI******************************************************************************** */
const insert_kategori_komoditi = async (id, kode, nama, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {        
        var sql = `INSERT INTO jt_kategori_komoditi
                        (id, kode, nama, is_active, created_by, created_at)
                    VALUES
                        (${id}, '${kode}', '${nama}', ${is_active}, ${upsertby}, '${upsert_date}')`;
        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        await t.rollback();
    }           
}

const update_kategori_komoditi = async (id, kode, nama, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_kategori_komoditi SET 
                        kode = '${kode}',
                        nama = '${nama}',
                        updated_by = ${upsertby},
                        updated_at = '${upsert_date}',
                        is_active = ${is_active}
                    WHERE id = ${id}`;
        //console.log(sql);
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
    //return res_update[1].command;
}    

exports.upsert_kategori_komoditi = async(id, kode, nama, is_active, upsertby, upsert_date) => {
    var sql = `SELECT * FROM jt_kategori_komoditi WHERE id = ${id} AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    // console.log('NO KENDARAAN : ', no_reg_kend);
    if (Object.keys(result).length > 0) {
        var update = await update_kategori_komoditi(id, kode, nama, is_active, upsertby, upsert_date);
        console.log('update', update);
        return update;
    } else {
        var insert = await insert_kategori_komoditi(id, kode, nama, is_active, upsertby, upsert_date);
        console.log('insert', insert);
        return insert;        
    }
}
/*****************************************************************END UPSERT KATEGORI KOMODITI******************************************************************************** */

/*****************************************************************BEGIN UPSERT KOMODITI******************************************************************************** */
const insert_komoditi = async (id, kategori_komoditi_id, kode, nama, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {        
        var sql = `INSERT INTO jt_komoditi
                        (id, kategori_komoditi_id, kode, nama, is_active, created_by, created_at)
                    VALUES
                        (${id}, ${kategori_komoditi_id}, '${kode}', '${nama}', ${is_active}, ${upsertby}, '${upsert_date}')`;
        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        await t.rollback();
    }           
}

const update_komoditi = async (id, kategori_komoditi_id, kode, nama, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_komoditi SET 
                        kategori_komoditi_id = ${kategori_komoditi_id},
                        kode = '${kode}',
                        nama = '${nama}',
                        updated_by = ${upsertby},
                        updated_at = '${upsert_date}',
                        is_active = ${is_active}
                    WHERE id = ${id}`;
        //console.log(sql);
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
    //return res_update[1].command;
}    

exports.upsert_komoditi = async(id, kategori_komoditi_id, kode, nama, is_active, upsertby, upsert_date) => {
    var sql = `SELECT * FROM jt_komoditi WHERE id = ${id} AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    // console.log('NO KENDARAAN : ', no_reg_kend);
    if (Object.keys(result).length > 0) {
        var update = await update_komoditi(id, kategori_komoditi_id, kode, nama, is_active, upsertby, upsert_date);
        console.log('update', update);
        return update;
    } else {
        var insert = await insert_komoditi(id, kategori_komoditi_id, kode, nama, is_active, upsertby, upsert_date);
        console.log('insert', insert);
        return insert;        
    }
}
/*****************************************************************END UPSERT KOMODITI******************************************************************************** */

/*****************************************************************BEGIN UPSERT KATEGORI PENGADUAN******************************************************************************** */
const insert_kategori_pengaduan = async (id, kode, nama, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {        
        var sql = `INSERT INTO jt_kategori_pengaduan
                        (id, kode, nama, is_active, created_by, created_at)
                    VALUES
                        (${id}, '${kode}', '${nama}', ${is_active}, ${upsertby}, '${upsert_date}')`;
        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        const res = JSON.stringify(res_insert).replace(/[^a-zA-Z0-9]/g, "")
        //console.log('INSERT : ',res);
        return res;
    } catch (error) {
        await t.rollback();
    }           
}

const update_kategori_pengaduan = async (id, kode, nama, is_active, upsertby, upsert_date) => {
    const t = await sequelize.transaction();

    try {
        let sql = `UPDATE jt_kategori_pengaduan SET 
                        kode = '${kode}',
                        nama = '${nama}',
                        updated_by = ${upsertby},
                        updated_at = '${upsert_date}',
                        is_active = ${is_active}
                    WHERE id = ${id}`;
        //console.log(sql);
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
    //return res_update[1].command;
}    

exports.upsert_kategori_pengaduan = async(id, kode, nama, is_active, upsertby, upsert_date) => {
    var sql = `SELECT * FROM jt_kategori_pengaduan WHERE id = ${id} AND is_deleted = false`;
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        logging: false
    });
    // console.log('NO KENDARAAN : ', no_reg_kend);
    if (Object.keys(result).length > 0) {
        var update = await update_kategori_pengaduan(id, kode, nama, is_active, upsertby, upsert_date);
        console.log('update', update);
        return update;
    } else {
        var insert = await insert_kategori_pengaduan(id, kode, nama, is_active, upsertby, upsert_date);
        console.log('insert', insert);
        return insert;        
    }
}
/*****************************************************************END UPSERT KATEGORI KOMODITI******************************************************************************** */