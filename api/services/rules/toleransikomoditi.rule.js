const { body } = require('express-validator')
const validate = require('../validate.service')
const { t_toleransi_komoditi, sequelize } = require('../../models')
const { Op } = require('sequelize');

exports.createValidate = validate([
    body('kategori_komoditi_id', 'Kategori Komoditi Tidak boleh kosong').not().isEmpty(),
    body('prosen_toleransi', 'Prosentase Tidak boleh kosong').not().isEmpty(),
    body('tgl_mulai', 'Tgl Mulai Tidak boleh kosong').not().isEmpty(),
    body('tgl_selesai', 'Tgl Selesai Tidak boleh kosong').not().isEmpty(),
    body('kategori_komoditi_id').custom((value) => {
        return t_toleransi_komoditi.count(
            { 
                where:  {
                    kategori_komoditi_id: value,
                    is_deleted: false,
                    is_active: true
                },
                logging: false
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Kategori Komoditi Sudah Digunakan')
            }
        });
    }),    
])

exports.updateValidate = validate([
    body('kategori_komoditi_id', 'Kategori Komoditi Tidak boleh kosong').not().isEmpty(),
    body('prosen_toleransi', 'Prosentase Tidak boleh kosong').not().isEmpty(),
    body('tgl_mulai', 'Tgl Mulai Tidak boleh kosong').not().isEmpty(),
    body('tgl_selesai', 'Tgl Selesai Tidak boleh kosong').not().isEmpty(),
    body('kategori_komoditi_id').custom((value, {req}) => {
        return t_toleransi_komoditi.count(
            { 
                where:  {
                    id: {[Op.ne]:req.params.id}, // req.params.id,
                    kategori_komoditi_id: value,
                    is_deleted: false,
                    is_active: true
                },
                logging: true
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Kategori Komoditi Sudah Digunakan')
            }
        });
    }), 
])