const { body } = require('express-validator')
const validate = require('../validate.service')
const { t_regu, sequelize } = require('../../models')
const { Op } = require('sequelize');

exports.createValidate = validate([
    // body('shift_id', 'Shift Tidak boleh kosong').not().isEmpty(),
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),

    // body('shift_id').custom((value, {req}) => {
    //     return t_regu.count(
    //         { 
    //             where:  {
    //                 shift_id: value,
    //                 kode_uppkb: req.body.kode_uppkb,
    //                 is_deleted: false
    //             },
    //             logging: true 
    //         }
    //     ).then(res => {
    //         if (res > 0) {
    //             throw new Error(`Shift Sudah Tersedia Pada Kode UPPKB ${req.body.kode_uppkb}`)
    //         }
    //     });
    // }),     
    body('kode').custom((value, {req}) => {
        return t_regu.count(
            { 
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
        return t_regu.count(
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
])

exports.updateValidate = validate([
    // body('shift_id', 'Shift Tidak boleh kosong').not().isEmpty(),
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),
    // body('shift_id').custom((value, {req}) => {
    //     return t_regu.count(
    //         { 
    //             where:  {
    //                 id: {[Op.ne]:req.params.id},
    //                 shift_id: value,
    //                 kode_uppkb: req.body.kode_uppkb
    //             },
    //             logging: true 
    //         }
    //     ).then(res => {
    //         if (res > 0) {
    //             throw new Error(`Shift Sudah Tersedia Pada Kode UPPKB ${req.body.kode_uppkb}`)
    //         }
    //     });
    // }),
    body('kode').custom((value, {req}) => {
        return t_regu.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('kode')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id}),
                ],
                logging: true 
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Kode sudah digunakan')
            }
        });
    }),    
    body('nama').custom((value, {req}) => {
        return t_regu.count({ 
            where:  [
                sequelize.where(
                    sequelize.fn('lower', sequelize.col('nama')), 
                    sequelize.fn('lower', value.toLowerCase().trim())
                ),
                sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id}),
            ],
            logging: true            
            //where:  { nama_provinsi: value, id_provinsi: {[Op.ne]: req.params.id} }
        }).then(res => {
            if (res > 0) {
                throw new Error('Nama sudah digunakan')
            }
        });
    }),
])