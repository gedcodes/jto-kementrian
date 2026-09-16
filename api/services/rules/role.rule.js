const { body } = require('express-validator')
const validate = require('../validate.service')
const { roles, sequelize } = require('../../models')
const { Op } = require('sequelize');

exports.createValidate = validate([
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),
    body('kode').custom((value) => {
        return roles.count(
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
        return roles.count(
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
])

exports.updateValidate = validate([
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),

    body('kode').custom((value, {req}) => {
        return roles.count(
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
        return roles.count({ 
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
])

exports.updateUserPrivilege = validate([
    body('id', 'Nama Tidak boleh kosong').not().isEmpty(),
    body('id').custom((value, {req}) => {
        return roles.count({ where:  { id: {[Op.eq]: req.body.id} }}).then(res => {
            if (res == 0) {
                throw new Error('ID Tidak Tersedia')
            }
        });        
    })
])