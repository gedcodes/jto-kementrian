const { body } = require('express-validator')
const validate = require('../validate.service')
const { t_config_sinkronisasi, sequelize } = require('../../models')
const { Op } = require('sequelize');

exports.createValidate = validate([
    body('domain_url', 'Domain URL Tidak boleh kosong').not().isEmpty(),
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),

    body('kode').custom((value) => {
        return t_config_sinkronisasi.count(
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
])

exports.updateValidate = validate([
    body('domain_url', 'Domain URL Tidak boleh kosong').not().isEmpty(),
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),
    body('kode').custom((value, {req}) => {
        return t_config_sinkronisasi.count(
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
])