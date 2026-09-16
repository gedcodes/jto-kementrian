const { body } = require('express-validator')
const validate = require('../validate.service')
const { t_app_versi, sequelize } = require('../../models')
const { Op } = require('sequelize');

exports.createValidate = validate([
    body('device_id', 'Device ID Tidak boleh kosong').not().isEmpty(),
    body('versi', 'Versi Tidak boleh kosong').not().isEmpty(),

    body('versi').custom((value) => {
        return t_app_versi.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('versi')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    {is_deleted: false}
                ],
                logging: false
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Versi Sudah Digunakan')
            }
        });
    }),       
])

exports.updateValidate = validate([
    body('device_id', 'Device ID Tidak boleh kosong').not().isEmpty(),
    body('versi', 'Versi Tidak boleh kosong').not().isEmpty(),
    body('versi').custom((value, {req}) => {
        return t_app_versi.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('versi')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id})
                ],
                logging: false 
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Versi Sudah Digunakan')
            }
        });
    }),    
])