const { body } = require('express-validator')
const validate = require('../validate.service')
const { t_timbangan, sequelize } = require('../../models')
const { Op } = require('sequelize');

exports.createValidate = validate([
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),
    body('ip_server', 'IP Server Tidak boleh kosong').not().isEmpty(),

    body('kode').custom((value, {req}) => {
        return t_timbangan.count(
            { 
                //where:  sequelize.where(sequelize.fn('lower', sequelize.col('kode')), sequelize.fn('lower', value.toLowerCase().trim())),
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('kode')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    {kode_uppkb: req.body.kode_uppkb, is_deleted: false}
                ],
                logging: false
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Kode sudah digunakan')
            }
        });
    }),    
    body('nama').custom((value, {req}) => {
        return t_timbangan.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('nama')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    {kode_uppkb: req.body.kode_uppkb, is_deleted: false}
                ],
                logging: false
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Nama sudah digunakan')
            }
        });
    }),
    // body('ip_server').custom((value) => {
    //     return t_timbangan.count(
    //         { 
    //             where:  [
    //                 sequelize.where(
    //                     sequelize.fn('lower', sequelize.col('ip_server')), 
    //                     sequelize.fn('lower', value.toLowerCase().trim())
    //                 ),
    //                 {is_deleted: false}
    //             ],
    //             logging: false
    //         }
    //     ).then(res => {
    //         if (res > 0) {
    //             throw new Error('IP Server sudah digunakan')
    //         }
    //     });
    // }),
])

exports.updateValidate = validate([
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),
    body('ip_server', 'IP Server Tidak boleh kosong').not().isEmpty(),

    body('kode').custom((value, {req}) => {
        return t_timbangan.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('kode')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id}),
                    {kode_uppkb: req.body.kode_uppkb, is_deleted: false}
                ],
                logging: false 
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Kode sudah digunakan')
            }
        });
    }),    
    body('nama').custom((value, {req}) => {
        return t_timbangan.count({ 
            where:  [
                sequelize.where(
                    sequelize.fn('lower', sequelize.col('nama')), 
                    sequelize.fn('lower', value.toLowerCase().trim())
                ),
                sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id}),
                {kode_uppkb: req.body.kode_uppkb, is_deleted: false}
            ],
            logging: false            
            //where:  { nama_provinsi: value, id_provinsi: {[Op.ne]: req.params.id} }
        }).then(res => {
            if (res > 0) {
                throw new Error('Nama sudah digunakan')
            }
        });
    }),
    // body('ip_server').custom((value, {req}) => {
    //     return t_timbangan.count({ 
    //         where:  [
    //             sequelize.where(
    //                 sequelize.fn('lower', sequelize.col('ip_server')), 
    //                 sequelize.fn('lower', value.toLowerCase().trim())
    //             ),
    //             sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id})
    //         ],
    //         logging: true            
    //         //where:  { nama_provinsi: value, id_provinsi: {[Op.ne]: req.params.id} }
    //     }).then(res => {
    //         if (res > 0) {
    //             throw new Error('IP Server sudah digunakan')
    //         }
    //     });
    // }),    
])