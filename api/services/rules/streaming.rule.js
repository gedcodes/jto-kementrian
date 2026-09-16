const { body } = require('express-validator')
const validate = require('../validate.service')
const { t_streaming, sequelize } = require('../../models')
const { Op } = require('sequelize');

exports.createValidate = validate([
    body('bptd_id', 'UPPKB Tidak boleh kosong').not().isEmpty(),
    body('lokasi_id', 'UPPKB Tidak boleh kosong').not().isEmpty(),
    body('vendor_id', 'Vendor Tidak boleh kosong').not().isEmpty(),
    body('tipe_cctv_id', 'Tipe Cctv Tidak boleh kosong').not().isEmpty(),
    body('tipe_source_cctv_id', 'Tipe Source Cctv Tidak boleh kosong').not().isEmpty(),
    body('source_url', 'Source URL Tidak boleh kosong').not().isEmpty(),
    body('source_on_demand', 'Source On Demand Tidak boleh kosong').not().isEmpty(),
    body('source_on_demand_start_timeout', 'Source On Demand Start Timeout Tidak boleh kosong').not().isEmpty(),
    body('source_on_demand_close_after', 'Source On Demand Close After Tidak boleh kosong').not().isEmpty(),
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),
    body('kode').custom((value, {req}) => {
        return t_streaming.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('kode')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    sequelize.where(sequelize.col('lokasi_id'), {[Op.eq]: req.body.lokasi_id}),
                    {is_deleted: false}
                ],
                logging: false
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Kode Sudah Digunakan')
            }
        });
    }),    
])

exports.updateValidate = validate([
    body('bptd_id', 'UPPKB Tidak boleh kosong').not().isEmpty(),
    body('lokasi_id', 'UPPKB Tidak boleh kosong').not().isEmpty(),
    body('vendor_id', 'Vendor Tidak boleh kosong').not().isEmpty(),
    body('tipe_cctv_id', 'Tipe Cctv Tidak boleh kosong').not().isEmpty(),
    body('tipe_source_cctv_id', 'Tipe Source Cctv Tidak boleh kosong').not().isEmpty(),
    body('source_url', 'Source URL Tidak boleh kosong').not().isEmpty(),
    body('source_on_demand', 'Source On Demand Tidak boleh kosong').not().isEmpty(),
    body('source_on_demand_start_timeout', 'Source On Demand Start Timeout Tidak boleh kosong').not().isEmpty(),
    body('source_on_demand_close_after', 'Source On Demand Close After Tidak boleh kosong').not().isEmpty(),
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),
    body('kode').custom((value, {req}) => {
        return t_streaming.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('kode')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    sequelize.where(sequelize.col('lokasi_id'), {[Op.eq]: req.body.lokasi_id}),
                    sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id}),
                    {is_deleted: false}
                ],
                logging: false
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Kode Sudah Digunakan')
            }
        });
    }),     
])