const { sequelize } = require('../../models');
const { QueryTypes } = require('sequelize');

const reportTemplate = async () => {
    try {
        const sql = `SELECT * FROM report_header WHERE is_active = true LIMIT 1`;

        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (Array.isArray(result) && result.length > 0) {
            return result[0];
        }

        // Kalau kosong tetap kembalikan default
        return {
            logo: 'logo_dishub.png',
            judul: 'KEMENTERIAN PERHUBUNGAN',
            sub_judul: 'DIREKTORAT PRASARANA ANGKUTAN JALAN'
        };

    } catch (error) {
        return {
            logo: 'logo_dishub.png',
            judul: 'KEMENTERIAN PERHUBUNGAN',
            sub_judul: 'DIREKTORAT PRASARANA ANGKUTAN JALAN'
        };
    }
};

module.exports = {
    reportTemplate
};
