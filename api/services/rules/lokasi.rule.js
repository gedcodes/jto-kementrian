const { body } = require('express-validator')
const validate = require('../validate.service')
const { t_lokasi, sequelize } = require('../../models')
const { Op } = require('sequelize');

exports.createValidate = validate([
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),
    body('kode').custom((value) => {
        return t_lokasi.count(
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
                throw new Error('Kode sudah digunakan')
            }
        });
    }),    
    body('nama').custom((value) => {
        return t_lokasi.count(
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
                throw new Error('Nama sudah digunakan')
            }
        });
    }),
])

exports.updateValidate = validate([
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),

    body('kode').custom((value, {req}) => {
        return t_lokasi.count(
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
                throw new Error('Kode sudah digunakan')
            }
        });
    }),    
    body('nama').custom((value, {req}) => {
        return t_lokasi.count({ 
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
                throw new Error('Nama sudah digunakan')
            }
        });
    }),
])