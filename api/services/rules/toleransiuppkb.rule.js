const { body } = require('express-validator')
const validate = require('../validate.service')
const { t_toleransi_uppkb, sequelize } = require('../../models')
const { Op } = require('sequelize');

exports.createValidate = validate([
    body('toleransi_id', 'Prosentase Toleransi UPPKB Tidak boleh kosong').not().isEmpty(),
    body('lokasi_id', 'Lokasi UPPKB Tidak boleh kosong').not().isEmpty(),
    // body('lokasi_id').custom((value) => {
    //     return t_toleransi_uppkb.count(
    //         { 
    //             where:  {
    //                 lokasi_id: value,
    //                 is_deleted: false,
    //                 is_active: true
    //             },
    //             logging: false
    //         }
    //     ).then(res => {
    //         if (res > 0) {
    //             throw new Error('Lokasi UPPKB Sudah Tersedia')
    //         }
    //     });
    // }),    
])

exports.updateValidate = validate([
    body('toleransi_id', 'Prosentase Toleransi UPPKB Tidak boleh kosong').not().isEmpty(),
    body('lokasi_id', 'Lokasi UPPKB Tidak boleh kosong').not().isEmpty(),
    // body('lokasi_id').custom((value, {req}) => {
    //     return t_toleransi_uppkb.count(
    //         { 
    //             where:  {
    //                 id: {[Op.ne]: req.params.id},
    //                 lokasi_id: value,
    //                 is_deleted: false,
    //                 is_active: true
    //             },
    //             logging: true
    //         }
    //     ).then(res => {
    //         if (res > 0) {
    //             throw new Error('Lokasi UPPKB Sudah Tersedia')
    //         }
    //     });
    // }), 
])