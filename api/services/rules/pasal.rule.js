const { body } = require('express-validator')
const validate = require('../validate.service')
const { t_pasal, sequelize } = require('../../models')
const { Op } = require('sequelize');

exports.createValidate = validate([
    body('no_pasal', 'Nomor Pasal Tidak boleh kosong').not().isEmpty(),
    // body('no_pasal').custom((value) => {
    //     return t_pasal.count(
    //         { 
    //             where:  [
    //                 {
    //                     no_pasal: value,
    //                     is_deleted: false,
    //                 }
    //             ],
    //             logging: false
    //         }
    //     ).then(res => {
    //         if (res > 0) {
    //             throw new Error('Nomor Pasal Sudah Digunakan')
    //         }
    //     });
    // }),
])

exports.updateValidate = validate([
    body('no_pasal', 'Nomor Pasal Tidak boleh kosong').not().isEmpty(),
    // body('no_pasal').custom((value, {req}) => {
    //     return t_pasal.count(
    //         { 
    //             where:  [
    //                 sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id}),
    //                 {
    //                     no_pasal: value,
    //                     is_deleted: false,
    //                 }
    //             ],
    //             logging: false 
    //         }
    //     ).then(res => {
    //         if (res > 0) {
    //             throw new Error('Nomor Pasal Sudah Digunakan')
    //         }
    //     });
    // }),
])