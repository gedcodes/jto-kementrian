const { body } = require('express-validator')
const validate = require('../validate.service')
const { t_sitaan, sequelize } = require('../../models')
const { Op } = require('sequelize');

exports.createValidate = validate([
    body('dokumen_id', 'Dokumen ID Tidak boleh kosong').not().isEmpty(),
    body('sanksi_id', 'Sanksi ID Tidak boleh kosong').not().isEmpty(),
    
    body('sanksi_id').custom((value, {req}) => {
        return t_sitaan.count(
            { 
                where: {
                    dokumen_id: req.body.dokumen_id,
                    sanksi_id: value,
                    is_deleted: false,
                },
                logging: false
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Dokumen ID Sudah Digunakan')
            }
        });
    }),
])

exports.updateValidate = validate([
    body('dokumen_id', 'Dokumen ID Tidak boleh kosong').not().isEmpty(),
    body('sanksi_id', 'Sanksi ID Tidak boleh kosong').not().isEmpty(),

    body('sanksi_id').custom((value, {req}) => {
        return t_sitaan.count(
            { 
                where:{
                    id: {
                        [Op.ne] : req.params.id
                    },
                    dokumen_id: req.body.dokumen_id,
                    sanksi_id: value,
                    is_deleted: false,
                },
                logging: false 
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Dokumen ID Sudah Digunakan')
            }
        });
    }),
])