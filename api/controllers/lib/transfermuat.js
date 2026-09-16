const { sequelize } = require('../../models');
const { Op, QueryTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const config = require('../../../config/config');
const fs = require('fs');
const path = require("path");
const moment = require('moment');

const timer = ms => new Promise(res => setTimeout(res, ms));


exports.update_status_transfer = async(kode_trx, no_kendaraan, kode_uppkb) => {
    const t = await sequelize.transaction();

    try {
        var sql = `UPDATE jt_penimbangan SET
                    status_transfer = true
                  WHERE
                    kode_trx = '${kode_trx}' AND no_kendaraan = '${no_kendaraan}' AND kode_uppkb = '${kode_uppkb}'`;

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