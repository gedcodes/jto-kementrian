const { body } = require('express-validator')
const validate = require('../validate.service')
const { t_petugas, sequelize } = require('../../models')
const { Op } = require('sequelize');

exports.createValidate = validate([
    // body('regu_id', 'Regu Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),
    body('pangkat', 'Pangkat Tidak boleh kosong').not().isEmpty(),
    body('jabatan', 'Jabatan Tidak boleh kosong').not().isEmpty(),

    // body('regu_id').custom((value, {req}) => {
    //     return t_petugas.count(
    //         { 
    //             where:  {
    //                 regu_id: value,
    //                 kode_uppkb: req.body.kode_uppkb,
    //                 is_deleted: false
    //             },
    //             logging: true 
    //         }
    //     ).then(res => {
    //         if (res > 0) {
    //             throw new Error(`Regu Sudah Tersedia Pada Kode UPPKB ${req.body.kode_uppkb}`)
    //         }
    //     });
    // }),     
    // body('nip').custom((value) => {
    //     return t_petugas.count(
    //         { 
    //             where:  [
    //                 sequelize.where(
    //                     sequelize.fn('lower', sequelize.col('nip')), 
    //                     sequelize.fn('lower', value ? value.toLowerCase().trim() : value)
    //                 ),
    //                 {is_deleted: false}
    //             ],
    //             logging: false
    //         }
    //     ).then(res => {
    //         if (res > 0) {
    //             throw new Error('Nip sudah digunakan')
    //         }
    //     });
    // }),    
])

exports.updateValidate = validate([
    // body('regu_id', 'Regu Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),
    body('pangkat', 'Pangkat Tidak boleh kosong').not().isEmpty(),
    body('jabatan', 'Jabatan Tidak boleh kosong').not().isEmpty(),
    // body('regu_id').custom((value, {req}) => {
    //     return t_petugas.count(
    //         { 
    //             where:  {
    //                 id: {[Op.ne]:req.params.id},
    //                 regu_id: value,
    //                 kode_uppkb: req.body.kode_uppkb
    //             },
    //             logging: true 
    //         }
    //     ).then(res => {
    //         if (res > 0) {
    //             throw new Error(`Regu Sudah Tersedia Pada Kode UPPKB ${req.body.kode_uppkb}`)
    //         }
    //     });
    // }),
    // body('nip').custom((value, {req}) => {
    //     console.log(req.body.nip);
    //     if (req.body.nip) {
    //         return t_petugas.count(
    //             { 
    //                 where: [ 
    //                     sequelize.where(
    //                         sequelize.fn('lower', sequelize.col('nip')), 
    //                         sequelize.fn('lower', value ? value.toLowerCase().trim() : value)
    //                     ),
    //                     sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id})
    //                 ],
    //                 logging: false
    //             }
    //         ).then(res => {
    //             if (res > 0) {
    //                 throw new Error('Nip sudah digunakan')
    //             }
    //         });
    //     }
    // }),
])