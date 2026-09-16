const { body } = require('express-validator')
const validate = require('../validate.service')
const { t_kejaksaan, sequelize } = require('../../models')
const { Op } = require('sequelize');

exports.createValidate = validate([
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),
    body('kode').custom((value, {req}) => {
        return t_kejaksaan.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('kode')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    {lokasi_id: req.body.lokasi_id, is_deleted: false}
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
        return t_kejaksaan.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('nama')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    {lokasi_id: req.body.lokasi_id, is_deleted: false}
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
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),

    body('kode').custom((value, {req}) => {
        return t_kejaksaan.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('kode')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id}),
                    {lokasi_id: req.body.lokasi_id, is_deleted: false}
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
        return t_kejaksaan.count({ 
            where:  [
                sequelize.where(
                    sequelize.fn('lower', sequelize.col('nama')), 
                    sequelize.fn('lower', value.toLowerCase().trim())
                ),
                sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id}),
                {lokasi_id: req.body.lokasi_id, is_deleted: false}
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