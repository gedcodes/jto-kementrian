const { body } = require('express-validator')
const validate = require('../validate.service')
const { t_kendaraan, sequelize } = require('../../models')
const { Op } = require('sequelize');

exports.createValidate = validate([
    body('no_reg_kend', 'No Kendaraan Tidak boleh kosong').not().isEmpty(),
    body('no_uji', 'No Uji Tidak boleh kosong').not().isEmpty(),
    body('tgl_uji', 'Tgl Uji Tidak boleh kosong').not().isEmpty(),
    body('masa_berlaku_uji', 'Masa Berlaku Uji Tidak boleh kosong').not().isEmpty(),
    body('nomor_rangka', 'Nomor Rangka Tidak boleh kosong').not().isEmpty(),
    body('no_reg_kend').custom((value) => {
        return t_kendaraan.count(
            { 
                //where:  sequelize.where(sequelize.fn('lower', sequelize.col('kode')), sequelize.fn('lower', value.toLowerCase().trim())),
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('no_reg_kend')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    {is_deleted: false}
                ],
                logging: true
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('No Kendaraan Sudah Digunakan')
            }
        });
    }),    
    body('no_uji').custom((value) => {
        return t_kendaraan.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('no_uji')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    {is_deleted: false}
                ],
                logging: false
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Nomor Uji Sudah Digunakan')
            }
        });
    }),
])

exports.updateValidate = validate([
    body('no_reg_kend', 'No Kendaraan Tidak boleh kosong').not().isEmpty(),
    body('no_uji', 'No Uji Tidak boleh kosong').not().isEmpty(),
    body('tgl_uji', 'Tgl Uji Tidak boleh kosong').not().isEmpty(),
    body('masa_berlaku_uji', 'Masa Berlaku Uji Tidak boleh kosong').not().isEmpty(),
    body('nomor_rangka', 'Nomor Rangka Tidak boleh kosong').not().isEmpty(),
    body('no_reg_kend').custom((value, {req}) => {
        return t_kendaraan.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('no_reg_kend')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id}),
                    {is_deleted: false}
                ],
                logging: true 
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('No Kendaraan Sudah Digunakan')
            }
        });
    }),    
    body('no_uji').custom((value, {req}) => {
        return t_kendaraan.count({ 
            where:  [
                sequelize.where(
                    sequelize.fn('lower', sequelize.col('no_uji')), 
                    sequelize.fn('lower', value.toLowerCase().trim())
                ),
                sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id}),
                {is_deleted: false}
            ],
            logging: true            
            //where:  { nama_provinsi: value, id_provinsi: {[Op.ne]: req.params.id} }
        }).then(res => {
            if (res > 0) {
                throw new Error('Nomor Uji Sudah Digunakan')
            }
        });
    }),
])