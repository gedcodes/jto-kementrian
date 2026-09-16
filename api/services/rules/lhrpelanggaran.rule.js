const { query } = require('express-validator')
const validate = require('../validate.service')

exports.filter = validate([
    query('lokasi', 'Lokasi Tidak boleh kosong').not().isEmpty(),
    query('interval', 'Interval Tidak boleh kosong').not().isEmpty(),    
])