const { body } = require('express-validator')
const validate = require('../validate.service')
const { t_sumbu, sequelize } = require('../../models')
const { Op } = require('sequelize');

exports.createValidate = validate([
    body('konfig_sumbu', 'Konfigurasi Sumbu Tidak boleh kosong').not().isEmpty(),
    body('jml_sumbu', 'Jumlah Sumbu Tidak boleh kosong').not().isEmpty(),
    body('konfig_sumbu').custom((value) => {
        return t_sumbu.count(
            { 
                where: [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('konfig_sumbu')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    sequelize.where(sequelize.col('is_deleted'), false)
                ],
                logging: false
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Konfigurasi Sumbu Sudah Tersedia')
            }
        });
    }),    
    // body('jml_sumbu').custom((value) => {
    //     return t_sumbu.count(
    //         { 
    //             where:  sequelize.where(sequelize.fn('lower', sequelize.col('jml_sumbu')), sequelize.fn('lower', value.toLowerCase().trim())),
    //             logging: false
    //         }
    //     ).then(res => {
    //         if (res > 0) {
    //             throw new Error('Jumlah Sumbu Sudah Tersedia')
    //         }
    //     });
    // }),
])

exports.updateValidate = validate([
    body('konfig_sumbu', 'Konfigurasi Sumbu Tidak boleh kosong').not().isEmpty(),
    body('jml_sumbu', 'Jumlah Sumbu Tidak boleh kosong').not().isEmpty(),

    body('konfig_sumbu').custom((value, {req}) => {
        return t_sumbu.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('konfig_sumbu')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id})
                ],
                logging: true 
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Konfigurasi Sumbu Sudah Tersedia')
            }
        });
    }),    
    // body('jml_sumbu').custom((value, {req}) => {
    //     return t_sumbu.count({ 
    //         where:  [
    //             sequelize.where(
    //                 sequelize.fn('lower', sequelize.col('jml_sumbu')), 
    //                 sequelize.fn('lower', value.toLowerCase().trim())
    //             ),
    //             sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id})
    //         ],
    //         logging: true            
    //         //where:  { nama_provinsi: value, id_provinsi: {[Op.ne]: req.params.id} }
    //     }).then(res => {
    //         if (res > 0) {
    //             throw new Error('Jumlah Sumbu Sudah Tersedia')
    //         }
    //     });
    // }),
])