const { body } = require('express-validator')
const validate = require('../validate.service')
const { t_toleransi, sequelize } = require('../../models')
const { Op } = require('sequelize');

exports.createValidate = validate([
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),
    body('prosen_toleransi', 'Prosentase Toleransi Tidak boleh kosong').not().isEmpty(),
    body('kode').custom((value) => {
        return t_toleransi.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('kode')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
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
    body('nama').custom((value) => {
        return t_toleransi.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('nama')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    {is_deleted: false}
                ],
                logging: false
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Nama Sudah Digunakan')
            }
        });
    }),
    // body('prosen_toleransi').custom((value) => {
    //     return t_toleransi.count(
    //         { 
    //             where: {
    //                 prosen_toleransi: value, 
    //                 is_deleted: false
    //             },
    //             logging: false
    //         }
    //     ).then(res => {
    //         if (res > 0) {
    //             throw new Error('Prosentase Toleransi Sudah Digunakan')
    //         }
    //     });
    // }),    
])

exports.updateValidate = validate([
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),
    body('prosen_toleransi', 'Prosentase Toleransi Tidak boleh kosong').not().isEmpty(),
    body('kode').custom((value, {req}) => {
        return t_toleransi.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('kode')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id})
                ],
                logging: false 
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Kode Sudah Digunakan')
            }
        });
    }),    
    body('nama').custom((value, {req}) => {
        return t_toleransi.count({ 
            where:  [
                sequelize.where(
                    sequelize.fn('lower', sequelize.col('nama')), 
                    sequelize.fn('lower', value.toLowerCase().trim())
                ),
                sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id})
            ],
            logging: false            
            //where:  { nama_provinsi: value, id_provinsi: {[Op.ne]: req.params.id} }
        }).then(res => {
            if (res > 0) {
                throw new Error('Nama Sudah Digunakan')
            }
        });
    }),
    // body('prosen_toleransi').custom((value, {req}) => {
    //     return t_toleransi.count(
    //         { 
    //             where: {
    //                 prosen_toleransi: value, 
    //                 is_deleted: false,
    //                 id: {[Op.ne]: req.params.id}
    //             },
    //             logging: false
    //         }
    //     ).then(res => {
    //         if (res > 0) {
    //             throw new Error('Prosentase Toleransi Sudah Tersedia')
    //         }
    //     });
    // }),    
])