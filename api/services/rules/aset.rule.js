const { body } = require('express-validator')
const validate = require('../validate.service')
const { t_aset, sequelize } = require('../../models')
const { Op } = require('sequelize');

exports.createValidate = validate([
    body('kategori_id', 'Kategori Tidak boleh kosong').not().isEmpty(),
    body('kegiatan_id', 'Kegiatan Tidak boleh kosong').not().isEmpty(),
    body('lokasi_uppkb_id', 'UPPKB Tidak boleh kosong').not().isEmpty(),
    body('nup', 'NUP Tidak boleh kosong').not().isEmpty(),
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),
    // body('spesifikasi', 'Spesifikasi Tidak boleh kosong').not().isEmpty(),
    body('kode').custom((value, {req}) => {
        return t_aset.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('kode')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    sequelize.where(sequelize.col('lokasi_uppkb_id'), {[Op.eq]: req.body.lokasi_uppkb_id}),
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
    body('nup').custom((value, {req}) => {
        return t_aset.count(
            { 
                where:  [
                    sequelize.where(sequelize.col('nup'), value),
                    sequelize.where(sequelize.col('lokasi_uppkb_id'), {[Op.eq]: req.body.lokasi_uppkb_id}),
                    {is_deleted: false}
                ],
                logging: false
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Nomor Urut Pendaftaran Sudah Digunakan')
            }
        });
    }),  
])

exports.updateValidate = validate([
    body('kategori_id', 'Kategori Tidak boleh kosong').not().isEmpty(),
    body('kegiatan_id', 'Kegiatan Tidak boleh kosong').not().isEmpty(),
    // body('kondisi_id', 'Kondisi Tidak boleh kosong').not().isEmpty(),
    // body('satuan_id', 'Satuan Tidak boleh kosong').not().isEmpty(),
    body('lokasi_uppkb_id', 'UPPKB Tidak boleh kosong').not().isEmpty(),
    body('nup', 'NUP Tidak boleh kosong').not().isEmpty(),
    body('kode', 'Kode Tidak boleh kosong').not().isEmpty(),
    body('nama', 'Nama Tidak boleh kosong').not().isEmpty(),
    // body('spesifikasi', 'Spesifikasi Tidak boleh kosong').not().isEmpty(),
    // body('qty', 'Qty Tidak boleh kosong').not().isEmpty(),
    body('kode').custom((value, {req}) => {
        return t_aset.count(
            { 
                where:  [
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('kode')), 
                        sequelize.fn('lower', value.toLowerCase().trim())
                    ),
                    sequelize.where(sequelize.col('lokasi_uppkb_id'), {[Op.eq]: req.body.lokasi_uppkb_id}),
                    sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id}),
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
    body('nup').custom((value, {req}) => {
        return t_aset.count(
            { 
                where:  [
                    sequelize.where(sequelize.col('nup'), value),
                    sequelize.where(sequelize.col('lokasi_uppkb_id'), {[Op.eq]: req.body.lokasi_uppkb_id}),
                    sequelize.where(sequelize.col('id'), {[Op.ne]: req.params.id}),
                    {is_deleted: false}
                ],
                logging: false 
            }
        ).then(res => {
            if (res > 0) {
                throw new Error('Nomor Urut Pendaftaran Sudah Digunakan')
            }
        });
    }),
])