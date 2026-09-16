const {
    sequelize
} = require('../models');

const {
    upsert_komoditi, upsert_pelanggaran,
    moveRowDocumentTemp, getKodeKota,
    checkMasaBerlaku, getIsMelanggarDokumen,
    ltrim, rtrim
} = require('./lib/penimbangan');

const {
    getWilayahLokasiUppkbById,
    getWilayahLokasiUppkbByKodeUppkb,
    getKorsatpelByKode,
    getShift,
    getRegu,
    getNamaKategoriAset,
    getNamaKegiatan,
    getNamaBptd,
} = require('./lib/dataid');
var QRCode = require('qrcode');
const { downloadImageToUrl } = require('./lib/cctvcapture');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const messageService = require('../services/message.service');
const uploadFile = require('../middleware/upload');
const config = require('../../config/config');
const { padLeft, kelebihanBerat, prosenKelebihanBerat } = require('../lib/utilities');
const { reportTemplate } = require('../controllers/lib/report_template');
const fs = require('fs');
const moment = require('moment');
const path = require("path");
let ejs = require("ejs");
const { generatePdfFile } = require('../middleware/pdfGenerator');
const excel = require('exceljs');

var logoKemenhub = './images/logo_dishub.png';

const LaporanController = () => {

    // const headerHtml = () => {
    //     var html = `<!DOCTYPE html>
    //                 <html lang="en">
    //                 <head>
    //                     <meta charset="UTF-8">
    //                     <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //                     <meta http-equiv="X-UA-Compatible" content="ie=edge">
    //                     <title>Jembatan Timbang Online</title>
    //                     <style>
    //                     body {
    //                         margin-top: 20px;
    //                         padding: 4px;
    //                     }
    //                     </style>
    //                 </head>
    //                 <body>`;

    //     return html;
    // }

    // const footerHtml = () => {
    //     var html = `</body></html>`;
    //     return html;
    // }

    // const headerReport = () => {
    //     var path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
    //     const fs = require('fs');
    //     const logo = fs.readFileSync(path_img, {encoding: 'base64'});
    //     var html = `<table
    //                     style="width: 100%; padding: 0px; border-spacing: 0px; border-style: solid; border-width: 1px 0px 1px 1px; border-color: #595959;">
    //                     <tbody>
    //                         <tr style="border-bottom: solid 1px #595959;">
    //                             <td rowspan="4"
    //                                 style="width: 10%; padding: 4px; border-spacing: 0px; border-style: solid; border-width: 0px 1px 0px 0px; border-color: #595959; text-align: center;">
    //                                 <img src="${logo}" width="92" height="96" /></td>
    //                             <td rowspan="2" 
    //                                 style="width: 50%; padding: 4px; border-spacing: 0px; border-style: solid; border-width: 0px 1px 0px 0px; border-color: #595959; text-align: center; vertical-align: bottom;">
    //                                 <div style="font-size: 14pt; font-weight: bold;">KEMENTERIAN PERHUBUNGAN</div>
    //                             </td>
    //                             <td style="width: 15%; padding: 4px; border-spacing: 0px; border-style: solid; border-width: 0px 1px 1px 0px; border-color: #595959; text-align: left;">
    //                                 Nomor Formulir
    //                             </td>
    //                             <td style="padding: 4px; border-spacing: 0px; border-style: solid; border-width: 0px 1px 1px 0px; border-color: #595959; text-align: center;">:</td>
    //                             <td style="width: 25%; padding: 4px; border-spacing: 0px; border-style: solid; border-width: 0px 1px 1px 0px; border-color: #595959; text-align: left;">
    //                                 &nbsp;
    //                             </td>
    //                         </tr>
    //                         <tr>
    //                             <td style="padding: 4px; border-spacing: 0px; border-style: solid; border-width: 0px 1px 1px 0px; border-color: #595959; text-align: left;">
    //                                 Tgl. Disahkan
    //                             </td>
    //                             <td style="padding: 4px; border-spacing: 0px; border-style: solid; border-width: 0px 1px 1px 0px; border-color: #595959; text-align: center;">:</td>
    //                             <td style="padding: 4px; border-spacing: 0px; border-style: solid; border-width: 0px 1px 1px 0px; border-color: #595959; text-align: left;">&nbsp;</td>
    //                         </tr>
    //                         <tr>
    //                             <td rowspan="2" 
    //                                 style="padding: 4px; border-spacing: 0px; border-style: solid; border-width: 0px 1px 0px 0px; border-color: #595959; text-align: center; vertical-align: top;">
    //                                 <div style="font-size: 14pt; font-weight: bold;">DIREKTORAT JENDERAL PERHUBUNGAN DARAT</div>
    //                             </td>
    //                             <td style="padding: 4px; border-spacing: 0px; border-style: solid; border-width: 0px 1px 1px 0px; border-color: #595959; text-align: left;">Tgl. Revisi</td>
    //                             <td style="padding: 4px; border-spacing: 0px; border-style: solid; border-width: 0px 1px 1px 0px; border-color: #595959; text-align: center;">:</td>
    //                             <td style="padding: 4px; border-spacing: 0px; border-style: solid; border-width: 0px 1px 1px 0px; border-color: #595959; text-align: left;">&nbsp;</td>
    //                         </tr>
    //                         <tr>
    //                             <td style="padding: 4px; border-spacing: 0px; border-style: solid; border-width: 0px 1px 0px 0px; border-color: #595959; text-align: left;">Tgl. Diberlakukan</td>
    //                             <td style="padding: 4px; border-spacing: 0px; border-style: solid; border-width: 0px 1px 0px 0px; border-color: #595959; text-align: center;">:</td>
    //                             <td style="padding: 4px; border-spacing: 0px; border-style: solid; border-width: 0px 1px 0px 0px; border-color: #595959; text-align: left;">&nbsp;</td>
    //                         </tr>
    //                     </tbody>
    //                 </table>`;

    //     return html;
    // }

    // const tableDataBulanan = () => {

    // }

    // const rekapLapBulanan = async (req, res, next) => {
    //     var html = headerHtml();
    //     html += `<section>`;
    //     html += headerReport();
    //     html += `</section>`;

    //     html += `<h3>TESTING</h3>`;
    //     html += footerHtml();


    //     res.set('Content-Type', 'text/html');
    //     res.send(Buffer.from(html));
    //     // return html;
    // }

    function daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    const setMonth = (month) => {
        let bulan = '';
        switch (month) {
            case 0:
                bulan = 'Januari';
                break;
            case 1:
                bulan = 'Februari';
                break;
            case 2:
                bulan = 'Maret';
                break;
            case 3:
                bulan = 'April';
                break;
            case 4:
                bulan = 'Mei';
                break;
            case 5:
                bulan = 'Juni';
                break;
            case 6:
                bulan = 'Juli';
                break;
            case 7:
                bulan = 'Agustus';
                break;
            case 8:
                bulan = 'September';
                break;
            case 9:
                bulan = 'Oktober';
                break;
            case 10:
                bulan = 'November';
                break;
            case 11:
                bulan = 'Desember';
                break;
            default:
                bulan = '';
                break;
        }
        return bulan;
    };

    const sqlPengawasan = async (req, kode_uppkb) => {
        // const kode_uppkb = req.query.kuppkb;
        const interval = req.query.interval;
        const bulan = req.query.bulan;
        const tahun = req.query.tahun;
        const bptd = req.query.bptd;
        const lokasi = req.query.lokasi;
        const dayfrom = '01';
        const dayto = daysInMonth(bulan, tahun);
        const datefrom = `${tahun}-${bulan}-${dayfrom}`;
        const dateto = `${tahun}-${bulan}-${dayto}`;

        const dateblnfrom = `${tahun}-01-01`;
        const dateblnto = `${tahun}-12-31`;
        var sql = ``;
        if (process.env.IS_KEMENHUB == 1) {
            if (interval === 'bulan' && bulan && tahun) {
                if (bptd) {
                    if (kode_uppkb) {
                        sql = `SELECT 
                            daytime::DATE AS waktu, 
                            v_lap_pengawasan.id_uppkb, 
                            v_lap_pengawasan.kode_uppkb, 
                            v_lap_pengawasan.nama_uppkb, 
                            v_lap_pengawasan.id_bptd, 
                            v_lap_pengawasan.kode_bptd, 
                            v_lap_pengawasan.nama_bptd, 
                            SUM(v_lap_pengawasan.jml_timbang) as jml_timbang,
                            SUM(v_lap_pengawasan.jml_melanggar) as jml_melanggar,
                            SUM(v_lap_pengawasan.jml_tidak_melanggar) as jml_tidak_melanggar,
                            SUM(v_lap_pengawasan.tilang_uppkb_lain) as tilang_uppkb_lain, 
                            SUM(v_lap_pengawasan.daya_angkut) as daya_angkut, 
                            SUM(v_lap_pengawasan.dimensi) as dimensi, 
                            SUM(v_lap_pengawasan.persyaratan_teknis) as persyaratan_teknis, 
                            SUM(v_lap_pengawasan.dokumen) as dokumen, 
                            SUM(v_lap_pengawasan.tata_cara_muat) as tata_cara_muat,
                            SUM(v_lap_pengawasan.peringatan) as peringatan,
                            SUM(v_lap_pengawasan.tilang) as tilang,
                            SUM(v_lap_pengawasan.kepolisian) as kepolisian,
                            SUM(v_lap_pengawasan.penandaan_kelebihan_dimensi) as penandaan_kelebihan_dimensi,
                            SUM(v_lap_pengawasan.transfer_muat) as transfer_muat,
                            SUM(v_lap_pengawasan.penyesuaian_tata_cara_muat) as penyesuaian_tata_cara_muat,
                            SUM(v_lap_pengawasan.penyesuaian_persyaratan_teknis) as penyesuaian_persyaratan_teknis,
                            SUM(v_lap_pengawasan.penundaan_perjalanan) as penundaan_perjalanan,
                            SUM(v_lap_pengawasan.putar_balik) as putar_balik
                        FROM generate_series ('${datefrom}'::DATE, '${dateto}'::DATE, '1 day' ) s ( daytime )
                        LEFT JOIN v_lap_pengawasan ON (v_lap_pengawasan.waktu = daytime) AND id_uppkb = ${lokasi}
                        GROUP BY daytime, id_uppkb, kode_uppkb, nama_uppkb, id_bptd, kode_bptd, nama_bptd
                        ORDER BY daytime ASC`;
                    } else {
                        sql = `SELECT 
                            jt_lokasi_uppkb.id AS id_uppkb, 
                            jt_lokasi_uppkb.kode AS kode_uppkb, 
                            jt_lokasi_uppkb.nama AS nama_uppkb,
                            SUM(v_lap_pengawasan.jml_timbang) as jml_timbang,
                            SUM(v_lap_pengawasan.jml_melanggar) as jml_melanggar,
                            SUM(v_lap_pengawasan.jml_tidak_melanggar) as jml_tidak_melanggar,
                            SUM(v_lap_pengawasan.tilang_uppkb_lain) as tilang_uppkb_lain, 
                            SUM(v_lap_pengawasan.daya_angkut) as daya_angkut, 
                            SUM(v_lap_pengawasan.dimensi) as dimensi, 
                            SUM(v_lap_pengawasan.persyaratan_teknis) as persyaratan_teknis, 
                            SUM(v_lap_pengawasan.dokumen) as dokumen, 
                            SUM(v_lap_pengawasan.tata_cara_muat) as tata_cara_muat,
                            SUM(v_lap_pengawasan.peringatan) as peringatan,
                            SUM(v_lap_pengawasan.tilang) as tilang,
                            SUM(v_lap_pengawasan.kepolisian) as kepolisian,
                            SUM(v_lap_pengawasan.penandaan_kelebihan_dimensi) as penandaan_kelebihan_dimensi,
                            SUM(v_lap_pengawasan.transfer_muat) as transfer_muat,
                            SUM(v_lap_pengawasan.penyesuaian_tata_cara_muat) as penyesuaian_tata_cara_muat,
                            SUM(v_lap_pengawasan.penyesuaian_persyaratan_teknis) as penyesuaian_persyaratan_teknis,
                            SUM(v_lap_pengawasan.penundaan_perjalanan) as penundaan_perjalanan,
                            SUM(v_lap_pengawasan.putar_balik) as putar_balik
                        FROM jt_lokasi_uppkb
                        INNER JOIN jt_bptd ON jt_bptd.id = jt_lokasi_uppkb.bptd_id AND
                            jt_bptd.id = ${bptd}
                        LEFT JOIN v_lap_pengawasan ON v_lap_pengawasan.id_uppkb = jt_lokasi_uppkb.id AND
                            EXTRACT(YEAR FROM v_lap_pengawasan.waktu) = ${tahun} AND
                            EXTRACT(MONTH FROM v_lap_pengawasan.waktu) = ${bulan}
                        WHERE 
                            jt_lokasi_uppkb.is_active = TRUE
                        GROUP BY jt_lokasi_uppkb.id, jt_lokasi_uppkb.kode, jt_lokasi_uppkb.nama
                        ORDER BY jt_lokasi_uppkb.nama ASC`;
                    }
                } else {
                    sql = `SELECT 
                        jt_lokasi_uppkb.id AS id_uppkb, 
                        jt_lokasi_uppkb.kode AS kode_uppkb, 
                        jt_lokasi_uppkb.nama AS nama_uppkb,
                        SUM(v_lap_pengawasan.jml_timbang) as jml_timbang,
                        SUM(v_lap_pengawasan.jml_melanggar) as jml_melanggar,
                        SUM(v_lap_pengawasan.jml_tidak_melanggar) as jml_tidak_melanggar,
                        SUM(v_lap_pengawasan.tilang_uppkb_lain) as tilang_uppkb_lain, 
                        SUM(v_lap_pengawasan.daya_angkut) as daya_angkut, 
                        SUM(v_lap_pengawasan.dimensi) as dimensi, 
                        SUM(v_lap_pengawasan.persyaratan_teknis) as persyaratan_teknis, 
                        SUM(v_lap_pengawasan.dokumen) as dokumen, 
                        SUM(v_lap_pengawasan.tata_cara_muat) as tata_cara_muat,
                        SUM(v_lap_pengawasan.peringatan) as peringatan,
                        SUM(v_lap_pengawasan.tilang) as tilang,
                        SUM(v_lap_pengawasan.kepolisian) as kepolisian,
                        SUM(v_lap_pengawasan.penandaan_kelebihan_dimensi) as penandaan_kelebihan_dimensi,
                        SUM(v_lap_pengawasan.transfer_muat) as transfer_muat,
                        SUM(v_lap_pengawasan.penyesuaian_tata_cara_muat) as penyesuaian_tata_cara_muat,
                        SUM(v_lap_pengawasan.penyesuaian_persyaratan_teknis) as penyesuaian_persyaratan_teknis,
                        SUM(v_lap_pengawasan.penundaan_perjalanan) as penundaan_perjalanan,
                        SUM(v_lap_pengawasan.putar_balik) as putar_balik
                    FROM jt_lokasi_uppkb
                    LEFT JOIN v_lap_pengawasan ON v_lap_pengawasan.id_uppkb = jt_lokasi_uppkb.id AND
                        EXTRACT(YEAR FROM v_lap_pengawasan.waktu) = ${tahun} AND
                        EXTRACT(MONTH FROM v_lap_pengawasan.waktu) = ${bulan}
                    WHERE 
                        jt_lokasi_uppkb.is_active = TRUE
                    GROUP BY jt_lokasi_uppkb.id, jt_lokasi_uppkb.kode, jt_lokasi_uppkb.nama
                    ORDER BY jt_lokasi_uppkb.nama ASC`;
                }
            } else if (interval === 'tahun' && tahun) {
                if (bptd) {
                    if (kode_uppkb) {
                        sql = `SELECT 
                            TO_CHAR(months, 'YYYY-MM') AS waktu, 
                            v_lap_pengawasan.id_uppkb, 
                            v_lap_pengawasan.kode_uppkb, 
                            v_lap_pengawasan.nama_uppkb, 
                            v_lap_pengawasan.id_bptd, 
                            v_lap_pengawasan.kode_bptd, 
                            v_lap_pengawasan.nama_bptd, 
                            SUM(v_lap_pengawasan.jml_timbang) as jml_timbang,
                            SUM(v_lap_pengawasan.jml_melanggar) as jml_melanggar,
                            SUM(v_lap_pengawasan.jml_tidak_melanggar) as jml_tidak_melanggar,
                            SUM(v_lap_pengawasan.tilang_uppkb_lain) as tilang_uppkb_lain, 
                            SUM(v_lap_pengawasan.daya_angkut) as daya_angkut, 
                            SUM(v_lap_pengawasan.dimensi) as dimensi, 
                            SUM(v_lap_pengawasan.persyaratan_teknis) as persyaratan_teknis, 
                            SUM(v_lap_pengawasan.dokumen) as dokumen, 
                            SUM(v_lap_pengawasan.tata_cara_muat) as tata_cara_muat,
                            SUM(v_lap_pengawasan.peringatan) as peringatan,
                            SUM(v_lap_pengawasan.tilang) as tilang,
                            SUM(v_lap_pengawasan.kepolisian) as kepolisian,
                            SUM(v_lap_pengawasan.penandaan_kelebihan_dimensi) as penandaan_kelebihan_dimensi,
                            SUM(v_lap_pengawasan.transfer_muat) as transfer_muat,
                            SUM(v_lap_pengawasan.penyesuaian_tata_cara_muat) as penyesuaian_tata_cara_muat,
                            SUM(v_lap_pengawasan.penyesuaian_persyaratan_teknis) as penyesuaian_persyaratan_teknis,
                            SUM(v_lap_pengawasan.penundaan_perjalanan) as penundaan_perjalanan,
                            SUM(v_lap_pengawasan.putar_balik) as putar_balik
                        FROM generate_series ('${dateblnfrom}'::DATE, '${dateblnto}'::DATE, '1 month' ) AS months
                        LEFT JOIN v_lap_pengawasan ON (to_char(v_lap_pengawasan.waktu, 'YYYY-MM') = TO_CHAR(months, 'YYYY-MM')) AND id_uppkb = ${lokasi}
                        GROUP BY months, id_uppkb, kode_uppkb, nama_uppkb, id_bptd, kode_bptd, nama_bptd
                        ORDER BY months ASC`;
                    } else {
                        sql = `SELECT 
                            jt_lokasi_uppkb.id AS id_uppkb, 
                            jt_lokasi_uppkb.kode AS kode_uppkb, 
                            jt_lokasi_uppkb.nama AS nama_uppkb,
                            SUM(v_lap_pengawasan.jml_timbang) as jml_timbang,
                            SUM(v_lap_pengawasan.jml_melanggar) as jml_melanggar,
                            SUM(v_lap_pengawasan.jml_tidak_melanggar) as jml_tidak_melanggar,
                            SUM(v_lap_pengawasan.tilang_uppkb_lain) as tilang_uppkb_lain, 
                            SUM(v_lap_pengawasan.daya_angkut) as daya_angkut, 
                            SUM(v_lap_pengawasan.dimensi) as dimensi, 
                            SUM(v_lap_pengawasan.persyaratan_teknis) as persyaratan_teknis, 
                            SUM(v_lap_pengawasan.dokumen) as dokumen, 
                            SUM(v_lap_pengawasan.tata_cara_muat) as tata_cara_muat,
                            SUM(v_lap_pengawasan.peringatan) as peringatan,
                            SUM(v_lap_pengawasan.tilang) as tilang,
                            SUM(v_lap_pengawasan.kepolisian) as kepolisian,
                            SUM(v_lap_pengawasan.penandaan_kelebihan_dimensi) as penandaan_kelebihan_dimensi,
                            SUM(v_lap_pengawasan.transfer_muat) as transfer_muat,
                            SUM(v_lap_pengawasan.penyesuaian_tata_cara_muat) as penyesuaian_tata_cara_muat,
                            SUM(v_lap_pengawasan.penyesuaian_persyaratan_teknis) as penyesuaian_persyaratan_teknis,
                            SUM(v_lap_pengawasan.penundaan_perjalanan) as penundaan_perjalanan,
                            SUM(v_lap_pengawasan.putar_balik) as putar_balik
                        FROM jt_lokasi_uppkb
                        INNER JOIN jt_bptd ON jt_bptd.id = jt_lokasi_uppkb.bptd_id AND
                            jt_bptd.id = ${bptd}
                        LEFT JOIN v_lap_pengawasan ON v_lap_pengawasan.id_uppkb = jt_lokasi_uppkb.id AND
                            EXTRACT(YEAR FROM v_lap_pengawasan.waktu) = ${tahun}
                        WHERE 
                            jt_lokasi_uppkb.is_active = TRUE
                        GROUP BY jt_lokasi_uppkb.id, jt_lokasi_uppkb.kode, jt_lokasi_uppkb.nama
                        ORDER BY jt_lokasi_uppkb.nama ASC`;
                    }
                } else {
                    sql = `SELECT 
                        jt_lokasi_uppkb.id AS id_uppkb, 
                        jt_lokasi_uppkb.kode AS kode_uppkb, 
                        jt_lokasi_uppkb.nama AS nama_uppkb,
                        SUM(v_lap_pengawasan.jml_timbang) as jml_timbang,
                        SUM(v_lap_pengawasan.jml_melanggar) as jml_melanggar,
                        SUM(v_lap_pengawasan.jml_tidak_melanggar) as jml_tidak_melanggar,
                        SUM(v_lap_pengawasan.tilang_uppkb_lain) as tilang_uppkb_lain, 
                        SUM(v_lap_pengawasan.daya_angkut) as daya_angkut, 
                        SUM(v_lap_pengawasan.dimensi) as dimensi, 
                        SUM(v_lap_pengawasan.persyaratan_teknis) as persyaratan_teknis, 
                        SUM(v_lap_pengawasan.dokumen) as dokumen, 
                        SUM(v_lap_pengawasan.tata_cara_muat) as tata_cara_muat,
                        SUM(v_lap_pengawasan.peringatan) as peringatan,
                        SUM(v_lap_pengawasan.tilang) as tilang,
                        SUM(v_lap_pengawasan.kepolisian) as kepolisian,
                        SUM(v_lap_pengawasan.penandaan_kelebihan_dimensi) as penandaan_kelebihan_dimensi,
                        SUM(v_lap_pengawasan.transfer_muat) as transfer_muat,
                        SUM(v_lap_pengawasan.penyesuaian_tata_cara_muat) as penyesuaian_tata_cara_muat,
                        SUM(v_lap_pengawasan.penyesuaian_persyaratan_teknis) as penyesuaian_persyaratan_teknis,
                        SUM(v_lap_pengawasan.penundaan_perjalanan) as penundaan_perjalanan,
                        SUM(v_lap_pengawasan.putar_balik) as putar_balik
                    FROM jt_lokasi_uppkb
                    LEFT JOIN v_lap_pengawasan ON v_lap_pengawasan.id_uppkb = jt_lokasi_uppkb.id AND
                        EXTRACT(YEAR FROM v_lap_pengawasan.waktu) = ${tahun}
                    WHERE 
                        jt_lokasi_uppkb.is_active = TRUE
                    GROUP BY jt_lokasi_uppkb.id, jt_lokasi_uppkb.kode, jt_lokasi_uppkb.nama
                    ORDER BY jt_lokasi_uppkb.nama ASC`;
                }
            }
        } else {
            if (interval === 'bulan' && kode_uppkb && bulan && tahun) {
                sql = `SELECT 
                            daytime::DATE AS waktu, 
                            v_lap_pengawasan.id_uppkb, 
                            v_lap_pengawasan.kode_uppkb, 
                            v_lap_pengawasan.nama_uppkb, 
                            v_lap_pengawasan.id_bptd, 
                            v_lap_pengawasan.kode_bptd, 
                            v_lap_pengawasan.nama_bptd, 
                            SUM(v_lap_pengawasan.jml_timbang) as jml_timbang,
                            SUM(v_lap_pengawasan.jml_melanggar) as jml_melanggar,
                            SUM(v_lap_pengawasan.jml_tidak_melanggar) as jml_tidak_melanggar,
                            SUM(v_lap_pengawasan.tilang_uppkb_lain) as tilang_uppkb_lain, 
                            SUM(v_lap_pengawasan.daya_angkut) as daya_angkut, 
                            SUM(v_lap_pengawasan.dimensi) as dimensi, 
                            SUM(v_lap_pengawasan.persyaratan_teknis) as persyaratan_teknis, 
                            SUM(v_lap_pengawasan.dokumen) as dokumen, 
                            SUM(v_lap_pengawasan.tata_cara_muat) as tata_cara_muat,
                            SUM(v_lap_pengawasan.peringatan) as peringatan,
                            SUM(v_lap_pengawasan.tilang) as tilang,
                            SUM(v_lap_pengawasan.kepolisian) as kepolisian,
                            SUM(v_lap_pengawasan.penandaan_kelebihan_dimensi) as penandaan_kelebihan_dimensi,
                            SUM(v_lap_pengawasan.transfer_muat) as transfer_muat,
                            SUM(v_lap_pengawasan.penyesuaian_tata_cara_muat) as penyesuaian_tata_cara_muat,
                            SUM(v_lap_pengawasan.penyesuaian_persyaratan_teknis) as penyesuaian_persyaratan_teknis,
                            SUM(v_lap_pengawasan.penundaan_perjalanan) as penundaan_perjalanan,
                            SUM(v_lap_pengawasan.putar_balik) as putar_balik
                        FROM generate_series ('${datefrom}'::DATE, '${dateto}'::DATE, '1 day' ) s ( daytime )
                        LEFT JOIN v_lap_pengawasan ON (v_lap_pengawasan.waktu = daytime)
                        GROUP BY daytime, id_uppkb, kode_uppkb, nama_uppkb, id_bptd, kode_bptd, nama_bptd
                        ORDER BY daytime ASC`;
            } else if (interval === 'tahun' && kode_uppkb && tahun) {
                sql = `SELECT 
                            TO_CHAR(months, 'YYYY-MM') AS waktu, 
                            v_lap_pengawasan.id_uppkb, 
                            v_lap_pengawasan.kode_uppkb, 
                            v_lap_pengawasan.nama_uppkb, 
                            v_lap_pengawasan.id_bptd, 
                            v_lap_pengawasan.kode_bptd, 
                            v_lap_pengawasan.nama_bptd, 
                            SUM(v_lap_pengawasan.jml_timbang) as jml_timbang,
                            SUM(v_lap_pengawasan.jml_melanggar) as jml_melanggar,
                            SUM(v_lap_pengawasan.jml_tidak_melanggar) as jml_tidak_melanggar,
                            SUM(v_lap_pengawasan.tilang_uppkb_lain) as tilang_uppkb_lain, 
                            SUM(v_lap_pengawasan.daya_angkut) as daya_angkut, 
                            SUM(v_lap_pengawasan.dimensi) as dimensi, 
                            SUM(v_lap_pengawasan.persyaratan_teknis) as persyaratan_teknis, 
                            SUM(v_lap_pengawasan.dokumen) as dokumen, 
                            SUM(v_lap_pengawasan.tata_cara_muat) as tata_cara_muat,
                            SUM(v_lap_pengawasan.peringatan) as peringatan,
                            SUM(v_lap_pengawasan.tilang) as tilang,
                            SUM(v_lap_pengawasan.kepolisian) as kepolisian,
                            SUM(v_lap_pengawasan.penandaan_kelebihan_dimensi) as penandaan_kelebihan_dimensi,
                            SUM(v_lap_pengawasan.transfer_muat) as transfer_muat,
                            SUM(v_lap_pengawasan.penyesuaian_tata_cara_muat) as penyesuaian_tata_cara_muat,
                            SUM(v_lap_pengawasan.penyesuaian_persyaratan_teknis) as penyesuaian_persyaratan_teknis,
                            SUM(v_lap_pengawasan.penundaan_perjalanan) as penundaan_perjalanan,
                            SUM(v_lap_pengawasan.putar_balik) as putar_balik
                        FROM generate_series ('${dateblnfrom}'::DATE, '${dateblnto}'::DATE, '1 month' ) AS months
                        LEFT JOIN v_lap_pengawasan ON (to_char(v_lap_pengawasan.waktu, 'YYYY-MM') = TO_CHAR(months, 'YYYY-MM'))
                        GROUP BY months, id_uppkb, kode_uppkb, nama_uppkb, id_bptd, kode_bptd, nama_bptd
                        ORDER BY months ASC`;
            }
        }
        // if (interval === 'bulan' && kode_uppkb && bulan && tahun) {
        //     sql = `SELECT 
        //                 daytime::DATE AS waktu, 
        //                 v_lap_pengawasan.id_uppkb, 
        //                 v_lap_pengawasan.kode_uppkb, 
        //                 v_lap_pengawasan.nama_uppkb, 
        //                 v_lap_pengawasan.id_bptd, 
        //                 v_lap_pengawasan.kode_bptd, 
        //                 v_lap_pengawasan.nama_bptd, 
        //                 SUM(v_lap_pengawasan.jml_timbang) as jml_timbang,
        //                 SUM(v_lap_pengawasan.jml_melanggar) as jml_melanggar,
        //                 SUM(v_lap_pengawasan.jml_tidak_melanggar) as jml_tidak_melanggar,
        //                 SUM(v_lap_pengawasan.tilang_uppkb_lain) as tilang_uppkb_lain, 
        //                 SUM(v_lap_pengawasan.daya_angkut) as daya_angkut, 
        //                 SUM(v_lap_pengawasan.dimensi) as dimensi, 
        //                 SUM(v_lap_pengawasan.persyaratan_teknis) as persyaratan_teknis, 
        //                 SUM(v_lap_pengawasan.dokumen) as dokumen, 
        //                 SUM(v_lap_pengawasan.tata_cara_muat) as tata_cara_muat,
        //                 SUM(v_lap_pengawasan.peringatan) as peringatan,
        //                 SUM(v_lap_pengawasan.tilang) as tilang,
        //                 SUM(v_lap_pengawasan.kepolisian) as kepolisian,
        //                 SUM(v_lap_pengawasan.penandaan_kelebihan_dimensi) as penandaan_kelebihan_dimensi,
        //                 SUM(v_lap_pengawasan.transfer_muat) as transfer_muat,
        //                 SUM(v_lap_pengawasan.penyesuaian_tata_cara_muat) as penyesuaian_tata_cara_muat,
        //                 SUM(v_lap_pengawasan.penyesuaian_persyaratan_teknis) as penyesuaian_persyaratan_teknis,
        //                 SUM(v_lap_pengawasan.penundaan_perjalanan) as penundaan_perjalanan,
        //                 SUM(v_lap_pengawasan.putar_balik) as putar_balik
        //             FROM generate_series ('${datefrom}'::DATE, '${dateto}'::DATE, '1 day' ) s ( daytime )
        //             LEFT JOIN v_lap_pengawasan ON (v_lap_pengawasan.waktu = daytime)
        //             GROUP BY daytime, id_uppkb, kode_uppkb, nama_uppkb, id_bptd, kode_bptd, nama_bptd
        //             ORDER BY daytime ASC`;
        // } else if (interval === 'tahun' && kode_uppkb && tahun) {
        //     sql = `SELECT 
        //                 TO_CHAR(months, 'YYYY-MM') AS waktu, 
        //                 v_lap_pengawasan.id_uppkb, 
        //                 v_lap_pengawasan.kode_uppkb, 
        //                 v_lap_pengawasan.nama_uppkb, 
        //                 v_lap_pengawasan.id_bptd, 
        //                 v_lap_pengawasan.kode_bptd, 
        //                 v_lap_pengawasan.nama_bptd, 
        //                 SUM(v_lap_pengawasan.jml_timbang) as jml_timbang,
        //                 SUM(v_lap_pengawasan.jml_melanggar) as jml_melanggar,
        //                 SUM(v_lap_pengawasan.jml_tidak_melanggar) as jml_tidak_melanggar,
        //                 SUM(v_lap_pengawasan.tilang_uppkb_lain) as tilang_uppkb_lain, 
        //                 SUM(v_lap_pengawasan.daya_angkut) as daya_angkut, 
        //                 SUM(v_lap_pengawasan.dimensi) as dimensi, 
        //                 SUM(v_lap_pengawasan.persyaratan_teknis) as persyaratan_teknis, 
        //                 SUM(v_lap_pengawasan.dokumen) as dokumen, 
        //                 SUM(v_lap_pengawasan.tata_cara_muat) as tata_cara_muat,
        //                 SUM(v_lap_pengawasan.peringatan) as peringatan,
        //                 SUM(v_lap_pengawasan.tilang) as tilang,
        //                 SUM(v_lap_pengawasan.kepolisian) as kepolisian,
        //                 SUM(v_lap_pengawasan.penandaan_kelebihan_dimensi) as penandaan_kelebihan_dimensi,
        //                 SUM(v_lap_pengawasan.transfer_muat) as transfer_muat,
        //                 SUM(v_lap_pengawasan.penyesuaian_tata_cara_muat) as penyesuaian_tata_cara_muat,
        //                 SUM(v_lap_pengawasan.penyesuaian_persyaratan_teknis) as penyesuaian_persyaratan_teknis,
        //                 SUM(v_lap_pengawasan.penundaan_perjalanan) as penundaan_perjalanan,
        //                 SUM(v_lap_pengawasan.putar_balik) as putar_balik
        //             FROM generate_series ('${dateblnfrom}'::DATE, '${dateblnto}'::DATE, '1 month' ) AS months
        //             LEFT JOIN v_lap_pengawasan ON (to_char(v_lap_pengawasan.waktu, 'YYYY-MM') = TO_CHAR(months, 'YYYY-MM'))
        //             GROUP BY months, id_uppkb, kode_uppkb, nama_uppkb, id_bptd, kode_bptd, nama_bptd
        //             ORDER BY months ASC`;
        // }
        // console.log(sql);
        return sql;
    }

    const resultquery = async (req, res) => {
        var interval = req.query.interval;
        var lokasi = req.query.lokasi;
        var kuppkb = req.query.kuppkb;
        var datauppkb = await getWilayahLokasiUppkbByKodeUppkb(kuppkb);
        var namauppkb = datauppkb.nama_uppkb;
        if (lokasi) {
            var uppkbbylokasi = await getWilayahLokasiUppkbById(lokasi);
            kuppkb = uppkbbylokasi.kode_uppkb.toUpperCase();
            namauppkb = uppkbbylokasi.nama_uppkb;
        }

        const sql = await sqlPengawasan(req, kuppkb);

        if (sql != '') {
            let result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            var arr = [];
            if (result) {
                // console.log(result);
                if (process.env.IS_KEMENHUB == 1) {
                    for (var row of result) {
                        if (lokasi) {
                            var formatwaktu = row.waktu;
                            if (interval == 'tahun') {
                                formatwaktu = setMonth(Number(moment(row.waktu, 'YYYY-MM').format('MM')) - 1);
                            }

                            arr.push({
                                waktu: formatwaktu,
                                kode_uppkb: row.kode_uppkb ? row.kode_uppkb : kuppkb,
                                nama_uppkb: row.kode_uppkb ? row.nama_uppkb : namauppkb,
                                jml_timbang: row.jml_timbang || 0,
                                jml_melanggar: row.jml_melanggar || 0, //(Number(row.daya_angkut) + Number(row.dimensi) + Number(row.persyaratan_teknis) + Number(row.dokumen) + Number(row.tata_cara_muat)) || 0,
                                jml_tidak_melanggar: row.jml_tidak_melanggar || 0, //(Number(row.jml_timbang) - (Number(row.daya_angkut) + Number(row.dimensi) + Number(row.persyaratan_teknis) + Number(row.dokumen) + Number(row.tata_cara_muat))) || 0,
                                tilang_uppkb_lain: row.tilang_uppkb_lain || 0,
                                daya_angkut: row.daya_angkut || 0,
                                dimensi: row.dimensi || 0,
                                persyaratan_teknis: row.persyaratan_teknis || 0,
                                dokumen: row.dokumen || 0,
                                tata_cara_muat: row.tata_cara_muat || 0,
                                kelas_jalan: row.kelas_jalan || 0,
                                peringatan: row.peringatan || 0,
                                tilang: row.tilang || 0,
                                kepolisian: row.kepolisian || 0,
                                penandaan_kelebihan_dimensi: row.penandaan_kelebihan_dimensi || 0,
                                transfer_muat: row.transfer_muat || 0,
                                penyesuaian_tata_cara_muat: row.penyesuaian_tata_cara_muat || 0,
                                penyesuaian_persyaratan_teknis: row.penyesuaian_persyaratan_teknis || 0,
                                penundaan_perjalanan: row.penundaan_perjalanan || 0,
                                putar_balik: row.putar_balik || 0
                            })
                        } else {
                            // var formatwaktu = setMonth(Number(moment().format('MM')) - 1);

                            arr.push({
                                waktu: '-',
                                kode_uppkb: row.kode_uppkb ? row.kode_uppkb : kuppkb,
                                nama_uppkb: row.kode_uppkb ? row.nama_uppkb : namauppkb,
                                jml_timbang: row.jml_timbang || 0,
                                jml_melanggar: row.jml_melanggar || 0, //(Number(row.daya_angkut) + Number(row.dimensi) + Number(row.persyaratan_teknis) + Number(row.dokumen) + Number(row.tata_cara_muat)) || 0,
                                jml_tidak_melanggar: row.jml_tidak_melanggar || 0, //(Number(row.jml_timbang) - (Number(row.daya_angkut) + Number(row.dimensi) + Number(row.persyaratan_teknis) + Number(row.dokumen) + Number(row.tata_cara_muat))) || 0,
                                tilang_uppkb_lain: row.tilang_uppkb_lain || 0,
                                daya_angkut: row.daya_angkut || 0,
                                dimensi: row.dimensi || 0,
                                persyaratan_teknis: row.persyaratan_teknis || 0,
                                dokumen: row.dokumen || 0,
                                tata_cara_muat: row.tata_cara_muat || 0,
                                kelas_jalan: row.kelas_jalan || 0,
                                peringatan: row.peringatan || 0,
                                tilang: row.tilang || 0,
                                kepolisian: row.kepolisian || 0,
                                penandaan_kelebihan_dimensi: row.penandaan_kelebihan_dimensi || 0,
                                transfer_muat: row.transfer_muat || 0,
                                penyesuaian_tata_cara_muat: row.penyesuaian_tata_cara_muat || 0,
                                penyesuaian_persyaratan_teknis: row.penyesuaian_persyaratan_teknis || 0,
                                penundaan_perjalanan: row.penundaan_perjalanan || 0,
                                putar_balik: row.putar_balik || 0
                            })
                        }
                    }
                } else {
                    for (var row of result) {
                        var formatwaktu = row.waktu;
                        if (interval == 'tahun') {
                            formatwaktu = setMonth(Number(moment(row.waktu, 'YYYY-MM').format('MM')) - 1);
                        }

                        arr.push({
                            waktu: formatwaktu,
                            kode_uppkb: row.kode_uppkb ? row.kode_uppkb : kuppkb,
                            nama_uppkb: row.kode_uppkb ? row.nama_uppkb : namauppkb,
                            jml_timbang: row.jml_timbang || 0,
                            jml_melanggar: row.jml_melanggar || 0, //(Number(row.daya_angkut) + Number(row.dimensi) + Number(row.persyaratan_teknis) + Number(row.dokumen) + Number(row.tata_cara_muat)) || 0,
                            jml_tidak_melanggar: row.jml_tidak_melanggar || 0, //(Number(row.jml_timbang) - (Number(row.daya_angkut) + Number(row.dimensi) + Number(row.persyaratan_teknis) + Number(row.dokumen) + Number(row.tata_cara_muat))) || 0,
                            tilang_uppkb_lain: row.tilang_uppkb_lain || 0,
                            daya_angkut: row.daya_angkut || 0,
                            dimensi: row.dimensi || 0,
                            persyaratan_teknis: row.persyaratan_teknis || 0,
                            dokumen: row.dokumen || 0,
                            tata_cara_muat: row.tata_cara_muat || 0,
                            kelas_jalan: row.kelas_jalan || 0,
                            peringatan: row.peringatan || 0,
                            tilang: row.tilang || 0,
                            kepolisian: row.kepolisian || 0,
                            penandaan_kelebihan_dimensi: row.penandaan_kelebihan_dimensi || 0,
                            transfer_muat: row.transfer_muat || 0,
                            penyesuaian_tata_cara_muat: row.penyesuaian_tata_cara_muat || 0,
                            penyesuaian_persyaratan_teknis: row.penyesuaian_persyaratan_teknis || 0,
                            penundaan_perjalanan: row.penundaan_perjalanan || 0,
                            putar_balik: row.putar_balik || 0
                        })
                    }
                }
            }

            // var arrdata = [];
            // if (arr.length > 0) {
            //     for (var i = 0; i < arr.length; i++) {
            //         if (lokasi) {
            //             if (arr[i].kode_uppkb == kuppkb) {
            //                 arrdata.push(arr[i]);
            //             }
            //         } else {
            //             arrdata.push(arr[i]);
            //         }
            //     }
            // }
            return arr;

        } else {
            return [];
        }
    }

    const laporanPengawasan = async (req, res, next) => {
        try {
            var data = await resultquery(req, res);

            if (data.length > 0) {
                res.send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: data
                });
            } else {
                res.send({
                    success: false,
                    message: 'Error QUERY. NO SQL EXECUTE',
                    data: []
                });
            }
        } catch (error) {
            next(error);
        }

    }

    const printLaporanPengawasan = async (req, res, next) => {
        var ispdf = req.query.ispdf;
        var bptd = req.query.bptd;
        var lokasi = req.query.lokasi;
        var kuppkb = req.query.kuppkb;
        var bulan = req.query.bulan;
        var tahun = req.query.tahun;
        var datauppkb = await getWilayahLokasiUppkbByKodeUppkb(kuppkb);
        var namauppkb = datauppkb.nama_uppkb;
        var korsatpel = await getKorsatpelByKode(kuppkb);
        var namabptd = '';
        if (bptd) {
            namabptd = await getNamaBptd(bptd);
        }
        if (lokasi) {
            var uppkbbylokasi = await getWilayahLokasiUppkbById(lokasi);
            kuppkb = uppkbbylokasi.id_uppkb;
            namauppkb = uppkbbylokasi.nama_uppkb;
        }

        var data = await resultquery(req, res);
        let intervalString = '';
        if (req.query.interval === 'bulan') intervalString = 'BULANAN';
        if (req.query.interval === 'tahun') intervalString = 'TAHUNAN';

        let namaHead = 'Semua UPPKB';
        if (bptd) {
            if (lokasi) {
                namaHead = namauppkb;
            } else {
                namaHead = namabptd;
            }
        }
        const resumedata = {
            jmlData: data.length,
            interval: req.query.interval,
            intervalString: intervalString,
        };

        const header = await reportTemplate();

        var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
        const fs = require('fs');
        const contents = fs.readFileSync(path_img, { encoding: 'base64' });
        var blnText = setMonth(Number(bulan) - 1);

        if (process.env.IS_KEMENHUB == 1) {
            if (ispdf == 0) {
                res.render("laporanPengawasanView.ejs", {
                    data: data,
                    moment: moment,
                    tahun: tahun,
                    blnText: blnText,
                    lokasi: lokasi,
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || namauppkb,
                    namauppkb: namauppkb,
                    namahead: namaHead,
                    korsatpel: korsatpel,
                    resumedata: resumedata,
                    logo: 'data:image/png;base64,' + contents
                });
            } else {
                ejs.renderFile(path.join(__dirname, '../views/', "laporanPengawasanView.ejs"), {
                    data: data,
                    lokasi: lokasi,
                    namauppkb: namauppkb,
                    namahead: namaHead,
                    korsatpel: korsatpel,
                    moment: moment,
                    tahun: tahun,
                    blnText: blnText,
                    resumedata: resumedata,
                    logo: 'data:image/png;base64,' + contents
                }, async (err, datapdf) => {
                    if (err) {
                        res.send(err);
                    } else {
                        const options = {
                            format: 'Legal',
                            landscape: true,
                            printBackground: true,
                            margin: { top: '5mm', bottom: '7mm' }
                        };

                        var nama_file_uppkb = 'all_uppkb';
                        if (kuppkb) {
                            nama_file_uppkb = kuppkb;
                        }
                        const filename = `laporan_pengawasan_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
                        const uploadPath = path.join(config.path_report) + '/pdf/' + filename;
                        const reportUrl = config.report_url + 'pdf/' + filename;

                        try {
                            await generatePdfFile(datapdf, options, uploadPath);
                            res.send({
                                success: true,
                                message: 'Create PDF Berhasil.',
                                download: reportUrl,
                            });
                        } catch (err) {
                            console.error('PDF error:', err);
                            res.send({
                                success: false,
                                message: 'Create PDF Gagal.',
                                download: ''
                            });
                        }
                    }
                });
            }
        } else {
            if (ispdf == 0) {
                res.render("laporanPengawasanLokalView.ejs", {
                    data: data,
                    moment: moment,
                    tahun: tahun,
                    blnText: blnText,
                    namauppkb: namauppkb,
                    korsatpel: korsatpel,
                    resumedata: resumedata,
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || namauppkb,
                    logo: 'data:image/png;base64,' + contents
                });
            } else {
                ejs.renderFile(path.join(__dirname, '../views/', "laporanPengawasanLokalView.ejs"), {
                    data: data,
                    namauppkb: namauppkb,
                    korsatpel: korsatpel,
                    moment: moment,
                    tahun: tahun,
                    blnText: blnText,
                    resumedata: resumedata,
                    headerJudul: header.judul || 'Laporan',
                    headerSubjudul: header.sub_judul || namauppkb,
                    logo: 'data:image/png;base64,' + contents
                }, async (err, datapdf) => {
                    if (err) {
                        res.send(err);
                    } else {
                        const options = {
                            format: 'Legal',
                            landscape: true,
                            printBackground: true,
                            margin: { top: '5mm', bottom: '7mm' }
                        };

                        var nama_file_uppkb = 'all_uppkb';
                        if (kuppkb) {
                            nama_file_uppkb = kuppkb;
                        }
                        const filename = `laporan_pengawasan_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
                        const uploadPath = path.join(config.path_report) + '/pdf/' + filename;
                        const reportUrl = config.report_url + 'pdf/' + filename;

                        try {
                            await generatePdfFile(datapdf, options, uploadPath);
                            res.send({
                                success: true,
                                message: 'Create PDF Berhasil.',
                                download: reportUrl,
                            });
                        } catch (err) {
                            console.error('PDF error:', err);
                            res.send({
                                success: false,
                                message: 'Create PDF Gagal.',
                                download: ''
                            });
                        }
                    }
                });
            }
        }
    }

    const xlsLaporanPengawasan = async (req, res, next) => {
        var lokasi = req.query.lokasi;
        var kuppkb = req.query.kuppkb;
        var interval = req.query.interval;
        var datauppkb = await getWilayahLokasiUppkbByKodeUppkb(kuppkb);
        var namauppkb = datauppkb.nama_uppkb;
        if (lokasi) {
            var uppkbbylokasi = await getWilayahLokasiUppkbById(lokasi);
            console.log(uppkbbylokasi);
            kuppkb = uppkbbylokasi.id_uppkb;
            namauppkb = uppkbbylokasi.nama_uppkb;
        }

        var data = await resultquery(req, res);

        let totalJmlTimbang = 0;
        let totalJmlMelanggar = 0;
        let totalJmlTidakMelanggar = 0;
        let totalTilangUppkbLain = 0;
        let totalDayaAngkut = 0;
        let totalDimensi = 0;
        let totalPersyaratanTeknis = 0;
        let totalDokumen = 0;
        let totalTataCaraMuat = 0;
        let totalKelasJalan = 0;
        let totalPeringatan = 0;
        let totalTilang = 0;
        let totalKepolisian = 0;
        let totalJmlPenandaanKelebihanDimensi = 0;
        let totalJmlTransferMuat = 0;
        let totalJmlPenyesuaianTataCaraMuat = 0;
        let totalJmlPenyesuaianPersyaratanTeknis = 0;
        let totalJmlPenundaanPerjalanan = 0;
        let totalJmlPutarBalik = 0;

        var obj = [];

        if (process.env.IS_KEMENHUB == 1) {
            for (var row of data) {
                totalJmlTimbang = Number(totalJmlTimbang) + Number(row.jml_timbang || 0);
                totalJmlMelanggar = Number(totalJmlMelanggar) + Number(row.jml_melanggar || 0);
                totalJmlTidakMelanggar = Number(totalJmlTidakMelanggar) + Number(row.jml_tidak_melanggar || 0);
                totalTilangUppkbLain = Number(totalTilangUppkbLain) + Number(row.tilang_uppkb_lain || 0);
                totalDayaAngkut = Number(totalDayaAngkut) + Number(row.daya_angkut || 0);
                totalDimensi = Number(totalDimensi) + Number(row.dimensi || 0);
                totalPersyaratanTeknis = Number(totalPersyaratanTeknis) + Number(row.persyaratan_teknis || 0);
                totalDokumen = Number(totalDokumen) + Number(row.dokumen || 0);
                totalTataCaraMuat = Number(totalTataCaraMuat) + Number(row.tata_cara_muat || 0);
                totalKelasJalan = Number(totalKelasJalan) + Number(row.kelas_jalan || 0);
                totalPeringatan = Number(totalPeringatan) + Number(row.peringatan || 0);
                totalTilang = Number(totalTilang) + Number(row.tilang || 0);
                totalKepolisian = Number(totalKepolisian) + Number(row.kepolisian || 0);
                totalJmlPenandaanKelebihanDimensi = Number(totalJmlPenandaanKelebihanDimensi) + Number(row.penandaan_kelebihan_dimensi || 0);
                totalJmlTransferMuat = Number(totalJmlTransferMuat) + Number(row.transfer_muat || 0);
                totalJmlPenyesuaianTataCaraMuat = Number(totalJmlPenyesuaianTataCaraMuat) + Number(row.penyesuaian_tata_cara_muat || 0);
                totalJmlPenyesuaianPersyaratanTeknis = Number(totalJmlPenyesuaianPersyaratanTeknis) + Number(row.penyesuaian_persyaratan_teknis || 0);
                totalJmlPenundaanPerjalanan = Number(totalJmlPenundaanPerjalanan) + Number(row.penundaan_perjalanan || 0);
                totalJmlPutarBalik = Number(totalJmlPutarBalik) + Number(row.putar_balik || 0);

                let waktu = '';
                if (lokasi) {
                    if (interval == 'bulan') {
                        waktu = moment(row.waktu).format('DD-MM-YYYY');
                    } else {
                        waktu = row.waktu;
                    }
                } else {
                    waktu = row.nama_uppkb;
                }

                obj.push({
                    tgl: waktu,
                    jml_timbang: row.jml_timbang || 0,
                    jml_melanggar: row.jml_melanggar || 0,
                    jml_tidak_melanggar: row.jml_tidak_melanggar || 0,
                    tilang_uppkb_lain: row.tilang_uppkb_lain || 0,
                    daya_angkut: row.daya_angkut || 0,
                    dimensi: row.dimensi || 0,
                    persyaratan_teknis: row.persyaratan_teknis || 0,
                    dokumen: row.dokumen || 0,
                    tata_cara_muat: row.tata_cara_muat || 0,
                    kelas_jalan: row.kelas_jalan || 0,
                    peringatan: row.peringatan || 0,
                    tilang: row.tilang || 0,
                    kepolisian: row.kepolisian || 0,
                    penandaan_kelebihan_dimensi: row.penandaan_kelebihan_dimensi || 0,
                    transfer_muat: row.transfer_muat || 0,
                    penyesuaian_tata_cara_muat: row.penyesuaian_tata_cara_muat || 0,
                    penyesuaian_persyaratan_teknis: row.penyesuaian_persyaratan_teknis || 0,
                    penundaan_perjalanan: row.penundaan_perjalanan || 0,
                    putar_balik: row.putar_balik || 0,
                });

            }
        } else {
            for (var row of data) {
                totalJmlTimbang = Number(totalJmlTimbang) + Number(row.jml_timbang || 0);
                totalJmlMelanggar = Number(totalJmlMelanggar) + Number(row.jml_melanggar || 0);
                totalJmlTidakMelanggar = Number(totalJmlTidakMelanggar) + Number(row.jml_tidak_melanggar || 0);
                totalTilangUppkbLain = Number(totalTilangUppkbLain) + Number(row.tilang_uppkb_lain || 0);
                totalDayaAngkut = Number(totalDayaAngkut) + Number(row.daya_angkut || 0);
                totalDimensi = Number(totalDimensi) + Number(row.dimensi || 0);
                totalPersyaratanTeknis = Number(totalPersyaratanTeknis) + Number(row.persyaratan_teknis || 0);
                totalDokumen = Number(totalDokumen) + Number(row.dokumen || 0);
                totalTataCaraMuat = Number(totalTataCaraMuat) + Number(row.tata_cara_muat || 0);
                totalKelasJalan = Number(totalKelasJalan) + Number(row.kelas_jalan || 0);
                totalPeringatan = Number(totalPeringatan) + Number(row.peringatan || 0);
                totalTilang = Number(totalTilang) + Number(row.tilang || 0);
                totalKepolisian = Number(totalKepolisian) + Number(row.kepolisian || 0);
                totalJmlPenandaanKelebihanDimensi = Number(totalJmlPenandaanKelebihanDimensi) + Number(row.penandaan_kelebihan_dimensi || 0);
                totalJmlTransferMuat = Number(totalJmlTransferMuat) + Number(row.transfer_muat || 0);
                totalJmlPenyesuaianTataCaraMuat = Number(totalJmlPenyesuaianTataCaraMuat) + Number(row.penyesuaian_tata_cara_muat || 0);
                totalJmlPenyesuaianPersyaratanTeknis = Number(totalJmlPenyesuaianPersyaratanTeknis) + Number(row.penyesuaian_persyaratan_teknis || 0);
                totalJmlPenundaanPerjalanan = Number(totalJmlPenundaanPerjalanan) + Number(row.penundaan_perjalanan || 0);
                totalJmlPutarBalik = Number(totalJmlPutarBalik) + Number(row.putar_balik || 0);

                let waktu = row.waktu;
                if (interval == 'bulan') waktu = moment(row.waktu).format('DD-MM-YYYY');

                obj.push({
                    tgl: waktu,
                    jml_timbang: row.jml_timbang || 0,
                    jml_melanggar: row.jml_melanggar || 0,
                    jml_tidak_melanggar: row.jml_tidak_melanggar || 0,
                    tilang_uppkb_lain: row.tilang_uppkb_lain || 0,
                    daya_angkut: row.daya_angkut || 0,
                    dimensi: row.dimensi || 0,
                    persyaratan_teknis: row.persyaratan_teknis || 0,
                    dokumen: row.dokumen || 0,
                    tata_cara_muat: row.tata_cara_muat || 0,
                    kelas_jalan: row.kelas_jalan || 0,
                    peringatan: row.peringatan || 0,
                    tilang: row.tilang || 0,
                    kepolisian: row.kepolisian || 0,
                    penandaan_kelebihan_dimensi: row.penandaan_kelebihan_dimensi || 0,
                    transfer_muat: row.transfer_muat || 0,
                    penyesuaian_tata_cara_muat: row.penyesuaian_tata_cara_muat || 0,
                    penyesuaian_persyaratan_teknis: row.penyesuaian_persyaratan_teknis || 0,
                    penundaan_perjalanan: row.penundaan_perjalanan || 0,
                    putar_balik: row.putar_balik || 0,
                });

            }
        }

        //creating workbook
        let workbook = new excel.Workbook();

        //creating worksheet
        let worksheet = workbook.addWorksheet('Laporan Pengawasan', {
            pageSetup: { paperSize: 9, orientation: 'landscape' },
        });

        // adjust pageSetup settings afterwards
        worksheet.pageSetup.margins = {
            left: 0.7, right: 0.7,
            top: 0.75, bottom: 0.75,
            header: 0.3, footer: 0.3
        };

        //  WorkSheet Header
        let intervalString = '';
        if (process.env.IS_KEMENHUB == 1) {
            if (lokasi) {
                if (req.query.interval === 'bulan') {
                    intervalString = 'Waktu (Tanggal)';
                } else {
                    intervalString = 'Waktu (Bulan)';
                }
            } else {
                intervalString = 'Lokasi UPPKB'
            }
        } else {
            if (req.query.interval === 'bulan') intervalString = 'Tanggal';
            if (req.query.interval === 'tahun') intervalString = 'Bulan';
        }

        worksheet.columns = [
            { header: `${intervalString}`, key: 'tgl', width: 20 },
            { header: 'Jumlah Kendaraan Yang Diperiksa', key: 'jml_timbang', width: 20 },
            { header: 'Jumlah Kendaraan Melanggar', key: 'jml_melanggar', width: 20 },
            { header: 'Jumlah Kendaraan Tidak Melanggar', key: 'jml_tidak_melanggar', width: 20 },
            { header: 'Daya Angkut', key: 'daya_angkut', width: 20 },
            { header: 'Dimensi', key: 'dimensi', width: 20 },
            { header: 'Persyaratan Teknis', key: 'persyaratan_teknis', width: 20 },
            { header: 'Dokumen', key: 'dokumen', width: 20 },
            { header: 'Tata Cara Muat', key: 'tata_cara_muat', width: 20 },
            { header: 'Kelas Jalan', key: 'kelas_jalan', width: 20 },
            { header: 'Peringatan', key: 'peringatan', width: 20 },
            { header: 'Tilang', key: 'tilang', width: 20 },
            { header: 'Kepolisian', key: 'kepolisian', width: 20 },
            { header: 'Tilang UPPKB Lain / Tilang Lainnya', key: 'tilang_uppkb_lain', width: 20 },
            { header: 'Penundaan Perjalanan', key: 'penundaan_perjalanan', width: 20 },
            { header: 'Penyesuaian Muatan / Transfer Muatan', key: 'transfer_muat', width: 20 },
            { header: 'Penandaan Kelebihan Dimensi', key: 'penandaan_kelebihan_dimensi', width: 20 },
            { header: 'Penyesuaian Persyaratan Teknis', key: 'penyesuaian_persyaratan_teknis', width: 20 },
            { header: 'Penyesuaian Tata Cara Muat', key: 'penyesuaian_tata_cara_muat', width: 20 },
            { header: 'Putar Balik', key: 'putar_balik', width: 20 },
        ];

        worksheet.addRows(obj);

        worksheet.eachRow(function (row, rowNumber) {

            row.eachCell((cell, colNumber) => {
                if (rowNumber == 1) {
                    // First set the background of header row
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'f5b914' }
                    };
                }
                // Set border of each cell 
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Set alignment of each cell 
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            //Commit the changed row to the stream
            row.commit();
        });

        worksheet.addRow({
            tgl: 'TOTAL', // TOTAL TITLE
            jml_timbang: totalJmlTimbang,
            jml_melanggar: totalJmlMelanggar,
            jml_tidak_melanggar: totalJmlTidakMelanggar,
            daya_angkut: totalDayaAngkut,
            dimensi: totalDimensi,
            persyaratan_teknis: totalPersyaratanTeknis,
            dokumen: totalDokumen,
            tata_cara_muat: totalTataCaraMuat,
            kelas_jalan: totalKelasJalan,
            peringatan: totalPeringatan,
            tilang: totalTilang,
            kepolisian: totalKepolisian,
            tilang_uppkb_lain: totalTilangUppkbLain,
            penandaan_kelebihan_dimensi: totalJmlPenandaanKelebihanDimensi,
            transfer_muat: totalJmlTransferMuat,
            penyesuaian_tata_cara_muat: totalJmlPenyesuaianTataCaraMuat,
            penyesuaian_persyaratan_teknis: totalJmlPenyesuaianPersyaratanTeknis,
            penundaan_perjalanan: totalJmlPenundaanPerjalanan,
            putar_balik: totalJmlPutarBalik,
        }, 'i');

        var m = moment();
        var ms = m.milliseconds() + 1000 * (m.seconds() + 60 * (m.minutes() + 60 * m.hours()));
        const filename = `laporan_pengawasan_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}_${req.query.kuppkb}.xlsx`;
        const uploadPath = path.join(config.path_report) + '/xls/' + filename;
        const reportUrl = config.report_url + 'xls/' + filename;

        workbook.xlsx.writeFile(uploadPath).then(function () {
            console.log("xlsx file is written.");
            res.send({
                success: true,
                message: 'Export Excel Berhasil.',
                filename: filename,
                download: reportUrl
            });
        });
    }

    const xlsLaporanPengawasanOLD = async (req, res, next) => {
        const lokasi_id = req.query.lokasi;
        const kode_uppkb = req.query.kuppkb;
        const interval = req.query.interval;

        const sql = await sqlPengawasan(req);
        const data = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        let totalJmlTimbang = 0;
        let totalDayaAngkut = 0;
        let totalDimensi = 0;
        let totalPersyaratanTeknis = 0;
        let totalDokumen = 0;
        let totalTataCaraMuat = 0;
        let totalPeringatan = 0;
        let totalTilang = 0;
        let totalKepolisian = 0;
        let totalJmlTransferMuat = 0;
        let totalJmlDimensi = 0;
        var obj = [];

        for (var row of data) {
            totalJmlTimbang = Number(totalJmlTimbang) + Number(row.jml_timbang || 0);
            totalDayaAngkut = Number(totalDayaAngkut) + Number(row.daya_angkut || 0);
            totalDimensi = Number(totalDimensi) + Number(row.dimensi || 0);
            totalPersyaratanTeknis = Number(totalPersyaratanTeknis) + Number(row.persyaratan_teknis || 0);
            totalDokumen = Number(totalDokumen) + Number(row.dokumen || 0);
            totalTataCaraMuat = Number(totalTataCaraMuat) + Number(row.tata_cara_muat || 0);
            totalPeringatan = Number(totalPeringatan) + Number(row.peringatan || 0);
            totalTilang = Number(totalTilang) + Number(row.tilang || 0);
            totalKepolisian = Number(totalKepolisian) + Number(row.kepolisian || 0);
            totalJmlTransferMuat = Number(totalJmlTransferMuat) + Number(row.jml_transfer_muat || 0);
            totalJmlDimensi = Number(totalJmlDimensi) + Number(row.jml_dimensi || 0);

            let tanggal = row.tgl;
            if (interval == 'hari') tanggal = moment(row.tgl, 'YYYY-MM-DD').format('DD-MM-YYYY');
            if (interval == 'bulan') tanggal = moment(row.tgl, 'MM-YYYY').format('MMMM-YYYY');

            obj.push({
                tgl: tanggal,
                jml_timbang: row.jml_timbang || 0,
                daya_angkut: row.daya_angkut || 0,
                dimensi: row.dimensi || 0,
                persyaratan_teknis: row.persyaratan_teknis || 0,
                dokumen: row.dokumen || 0,
                tata_cara_muat: row.tata_cara_muat || 0,
                peringatan: row.peringatan || 0,
                tilang: row.tilang || 0,
                kepolisian: row.kepolisian || 0,
                jml_transfer_muat: row.jml_transfer_muat || 0,
                jml_dimensi: row.jml_dimensi || 0,
            });
        }

        //creating workbook
        let workbook = new excel.Workbook();

        //creating worksheet
        let worksheet = workbook.addWorksheet('Laporan Pengawasan', {
            pageSetup: { paperSize: 9, orientation: 'landscape' },
        });

        // adjust pageSetup settings afterwards
        worksheet.pageSetup.margins = {
            left: 0.7, right: 0.7,
            top: 0.75, bottom: 0.75,
            header: 0.3, footer: 0.3
        };

        //  WorkSheet Header
        const intervalString = interval == 'hari' ? '(Hari)' : (interval == 'bulan' ? '(Bulan)' : '(Tahun)');
        worksheet.columns = [
            { header: `Waktu ${intervalString}`, key: 'tgl', width: 20 },
            { header: 'Jumlah Kendaraan Yang Diperiksa', key: 'jml_timbang', width: 20 },
            { header: 'Daya Angkut', key: 'daya_angkut', width: 20 },
            { header: 'Dimensi', key: 'dimensi', width: 20 },
            { header: 'Persyaratan Teknis', key: 'persyaratan_teknis', width: 20 },
            { header: 'Dokumen', key: 'dokumen', width: 20 },
            { header: 'Tata Cara Muat', key: 'tata_cara_muat', width: 20 },
            { header: 'Peringatan', key: 'peringatan', width: 20 },
            { header: 'Tilang', key: 'tilang', width: 20 },
            { header: 'Kepolisian', key: 'kepolisian', width: 20 },
            { header: 'Pemindahan Muatan', key: 'jml_transfer_muat', width: 20 },
            { header: 'Penandaan / Pelanggaran Dimensi', key: 'jml_dimensi', width: 20 },
        ];

        // Add Array Rows
        worksheet.addRows(obj);

        worksheet.eachRow(function (row, rowNumber) {

            row.eachCell((cell, colNumber) => {
                if (rowNumber == 1) {
                    // First set the background of header row
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'f5b914' }
                    };
                }
                // Set border of each cell 
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Set alignment of each cell 
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            //Commit the changed row to the stream
            row.commit();
        });

        worksheet.addRow({
            tgl: 'TOTAL', // TOTAL TITLE
            jml_timbang: totalJmlTimbang,
            daya_angkut: totalDayaAngkut,
            dimensi: totalDimensi,
            persyaratan_teknis: totalPersyaratanTeknis,
            dokumen: totalDokumen,
            tata_cara_muat: totalTataCaraMuat,
            peringatan: totalPeringatan,
            tilang: totalTilang,
            kepolisian: totalKepolisian,
            jml_transfer_muat: totalJmlTransferMuat,
            jml_dimensi: totalJmlDimensi,
        }, 'i');

        var m = moment();
        var ms = m.milliseconds() + 1000 * (m.seconds() + 60 * (m.minutes() + 60 * m.hours()));
        const filename = `laporan_pengawasan_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}_${req.query.kuppkb}.xlsx`;
        const uploadPath = path.join(config.path_report) + '/xls/' + filename;
        const reportUrl = config.report_url + 'xls/' + filename;

        workbook.xlsx.writeFile(uploadPath).then(function () {
            console.log("xlsx file is written.");
            res.send({
                success: true,
                message: 'Export Excel Berhasil.',
                filename: filename,
                download: reportUrl
            });
        });
    }


    const sqlkelebihanmuatan = async (req, kode_uppkb) => {
        const interval = req.query.interval;
        const bulan = req.query.bulan;
        const tahun = req.query.tahun;
        const dayfrom = '01';
        const dayto = daysInMonth(bulan, tahun);
        const datefrom = `${tahun}-${bulan}-${dayfrom}`;
        const dateto = `${tahun}-${bulan}-${dayto}`;

        const dateblnfrom = `${tahun}-01-01`;
        const dateblnto = `${tahun}-12-31`;
        var sql = ``;
        if (interval === 'bulan' && kode_uppkb && bulan && tahun) {
            sql = `SELECT 
                        daytime::DATE AS waktu,
                        v_lap_pelanggaran.kode,
                        v_lap_pelanggaran.nama,
                        v_lap_pelanggaran.kode_bptd,
                        v_lap_pelanggaran.nama_bptd,
                        SUM(v_lap_pelanggaran.range_5_20) as range_5_20,
                        SUM(v_lap_pelanggaran.range_21_40) as range_21_40,
                        SUM(v_lap_pelanggaran.range_41_60) as range_41_60,  
                        SUM(v_lap_pelanggaran.range_61_80) as range_61_80, 
                        SUM(v_lap_pelanggaran.range_81_100) as range_81_100, 
                        SUM(v_lap_pelanggaran.range_up_100) as range_up_100
                    FROM generate_series ('${datefrom}'::DATE, '${dateto}'::DATE, '1 day' ) s ( daytime )
                    LEFT JOIN v_lap_pelanggaran ON (v_lap_pelanggaran.waktu = daytime)
                    GROUP BY daytime, v_lap_pelanggaran.kode, v_lap_pelanggaran.nama, v_lap_pelanggaran.kode_bptd, v_lap_pelanggaran.nama_bptd
                    ORDER BY daytime ASC`;
        } else if (interval === 'tahun' && kode_uppkb && tahun) {
            sql = `SELECT 
                        TO_CHAR(months, 'YYYY-MM') AS waktu, 
                        v_lap_pelanggaran.kode,
                        v_lap_pelanggaran.nama,
                        v_lap_pelanggaran.kode_bptd,
                        v_lap_pelanggaran.nama_bptd,
                        SUM(v_lap_pelanggaran.range_5_20) as range_5_20,
                        SUM(v_lap_pelanggaran.range_21_40) as range_21_40,
                        SUM(v_lap_pelanggaran.range_41_60) as range_41_60,  
                        SUM(v_lap_pelanggaran.range_61_80) as range_61_80, 
                        SUM(v_lap_pelanggaran.range_81_100) as range_81_100, 
                        SUM(v_lap_pelanggaran.range_up_100) as range_up_100
                    FROM generate_series ('${dateblnfrom}'::DATE, '${dateblnto}'::DATE, '1 month' ) AS months
                    LEFT JOIN v_lap_pelanggaran ON (to_char(v_lap_pelanggaran.waktu, 'YYYY-MM') = TO_CHAR(months, 'YYYY-MM'))
                    GROUP BY months, v_lap_pelanggaran.kode, v_lap_pelanggaran.nama, v_lap_pelanggaran.kode_bptd, v_lap_pelanggaran.nama_bptd
                    ORDER BY months ASC`;
        }

        return sql;
    }

    const resquerylebihmuatan = async (req, res) => {
        var interval = req.query.interval;
        var lokasi = req.query.lokasi;
        var kuppkb = req.query.kuppkb;
        var datauppkb = await getWilayahLokasiUppkbByKodeUppkb(kuppkb);
        var namauppkb = datauppkb.nama_uppkb;
        if (lokasi) {
            var uppkbbylokasi = await getWilayahLokasiUppkbById(lokasi);
            kuppkb = uppkbbylokasi.kode_uppkb;
            namauppkb = uppkbbylokasi.nama_uppkb;
        }

        const sql = await sqlkelebihanmuatan(req, kuppkb);

        if (sql != '') {
            let result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            var arr = [];
            if (result) {
                for (var row of result) {
                    var formatwaktu = row.waktu;
                    if (interval == 'tahun') {
                        formatwaktu = setMonth(Number(moment(row.waktu, 'YYYY-MM').format('MM')) - 1);
                    }

                    arr.push({
                        waktu: formatwaktu,
                        kode_bptd: row.kode_bptd,
                        nama_bptd: row.nama_bptd,
                        kode_uppkb: row.kode ? row.kode : kuppkb,
                        nama_uppkb: row.nama ? row.nama : namauppkb,
                        range_5_20: row.range_5_20 || 0,
                        range_21_40: row.range_21_40 || 0,
                        range_41_60: row.range_41_60 || 0,
                        range_61_80: row.range_61_80 || 0,
                        range_81_100: row.range_81_100 || 0,
                        range_up_100: row.range_up_100 || 0
                    })
                }
            }

            var arrdata = [];
            if (arr.length > 0) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].kode_uppkb == kuppkb) {
                        arrdata.push(arr[i]);
                    }
                }
            }
            return arrdata;

        } else {
            return [];
        }
    }

    const laporanLebihMuatan = async (req, res, next) => {
        try {
            var data = await resquerylebihmuatan(req, res);

            if (data.length > 0) {
                res.send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: data
                });
            } else {
                res.send({
                    success: false,
                    message: 'Error QUERY. NO SQL EXECUTE TES',
                    data: []
                });
            }
        } catch (error) {
            next(error);
        }

    }

    const printLaporanLebihMuatan = async (req, res, next) => {
        var ispdf = req.query.ispdf;
        var lokasi = req.query.lokasi;
        var kuppkb = req.query.kuppkb;
        var bulan = req.query.bulan;
        var tahun = req.query.tahun;
        var datauppkb = await getWilayahLokasiUppkbByKodeUppkb(kuppkb);
        var namauppkb = datauppkb.nama_uppkb;
        var korsatpel = await getKorsatpelByKode(kuppkb);
        if (lokasi) {
            var uppkbbylokasi = await getWilayahLokasiUppkbById(lokasi);
            kuppkb = uppkbbylokasi.id_uppkb;
            namauppkb = uppkbbylokasi.nama_uppkb;
        }

        var data = await resquerylebihmuatan(req, res);
        let intervalString = '';
        if (req.query.interval === 'bulan') intervalString = 'BULANAN';
        if (req.query.interval === 'tahun') intervalString = 'TAHUNAN';

        const resumedata = {
            jmlData: data.length,
            interval: req.query.interval,
            intervalString: intervalString,
        };

        const header = await reportTemplate();

        var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
        // var path_img = path.join(__dirname, '../views/images/', "_dishub.png");
        const fs = require('fs');
        const contents = fs.readFileSync(path_img, { encoding: 'base64' });
        var blnText = setMonth(Number(bulan) - 1);
        if (ispdf == 0) {
            res.render("laporanLebihMuatanView.ejs", {
                data: data,
                moment: moment,
                tahun: tahun,
                blnText: blnText,
                namauppkb: namauppkb,
                korsatpel: korsatpel,
                resumedata: resumedata,
                logo: 'data:image/png;base64,' + contents
            });
        } else {
            ejs.renderFile(path.join(__dirname, '../views/', "laporanLebihMuatanView.ejs"), {
                data: data,
                namauppkb: namauppkb,
                korsatpel: korsatpel,
                moment: moment,
                tahun: tahun,
                blnText: blnText,
                resumedata: resumedata,
                logo: 'data:image/png;base64,' + contents
            }, async (err, datapdf) => {
                if (err) {
                    res.send(err);
                } else {
                    const options = {
                        format: 'A4',
                        landscape: false,
                        printBackground: true,
                        margin: { top: '4mm', bottom: '4mm' }
                    };

                    var nama_file_uppkb = 'all_uppkb';
                    if (kuppkb) {
                        nama_file_uppkb = kuppkb;
                    }
                    const filename = `laporan_kelebihan_muatan_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
                    const uploadPath = path.join(config.path_report) + '/pdf/' + filename;
                    const reportUrl = config.report_url + 'pdf/' + filename;

                    try {
                        await generatePdfFile(datapdf, options, uploadPath);
                        res.send({
                            success: true,
                            message: 'Create PDF Berhasil.',
                            download: reportUrl,
                        });
                    } catch (err) {
                        console.error('PDF error:', err);
                        res.send({
                            success: false,
                            message: 'Create PDF Gagal.',
                            download: ''
                        });
                    }
                }
            });
        }
    }

    const xlsLaporanLebihMuatan = async (req, res, next) => {
        var lokasi = req.query.lokasi;
        var kuppkb = req.query.kuppkb;
        var interval = req.query.interval;
        var datauppkb = await getWilayahLokasiUppkbByKodeUppkb(kuppkb);
        var namauppkb = datauppkb.nama_uppkb;
        if (lokasi) {
            var uppkbbylokasi = await getWilayahLokasiUppkbById(lokasi);
            console.log(uppkbbylokasi);
            kuppkb = uppkbbylokasi.id_uppkb;
            namauppkb = uppkbbylokasi.nama_uppkb;
        }

        var data = await resquerylebihmuatan(req, res);

        let total_range_5_20 = 0;
        let total_range_21_40 = 0;
        let total_range_41_60 = 0;
        let total_range_61_80 = 0;
        let total_range_81_100 = 0;
        let total_range_up_100 = 0;

        var obj = [];

        for (var row of data) {
            total_range_5_20 = Number(total_range_5_20) + Number(row.range_5_20 || 0);
            total_range_21_40 = Number(total_range_21_40) + Number(row.range_21_40 || 0);
            total_range_41_60 = Number(total_range_41_60) + Number(row.range_41_60 || 0);
            total_range_61_80 = Number(total_range_61_80) + Number(row.range_61_80 || 0);
            total_range_81_100 = Number(total_range_81_100) + Number(row.range_81_100 || 0);
            total_range_up_100 = Number(total_range_up_100) + Number(row.range_up_100 || 0);

            let waktu = row.waktu;
            if (interval == 'bulan') waktu = moment(row.waktu).format('DD-MM-YYYY');

            obj.push({
                tgl: waktu,
                range_5_20: row.range_5_20 || 0,
                range_21_40: row.range_21_40 || 0,
                range_41_60: row.range_41_60 || 0,
                range_61_80: row.range_61_80 || 0,
                range_81_100: row.range_81_100 || 0,
                range_up_100: row.range_up_100 || 0
            });

        }

        //creating workbook
        let workbook = new excel.Workbook();

        //creating worksheet
        let worksheet = workbook.addWorksheet('Laporan Lebih Muatan', {
            pageSetup: { paperSize: 9, orientation: 'portrait' },
        });

        // adjust pageSetup settings afterwards
        worksheet.pageSetup.margins = {
            left: 0.7, right: 0.7,
            top: 0.75, bottom: 0.75,
            header: 0.3, footer: 0.3
        };

        //  WorkSheet Header
        let intervalString = '';
        if (req.query.interval === 'bulan') intervalString = 'Tanggal';
        if (req.query.interval === 'tahun') intervalString = 'Bulan';

        worksheet.columns = [
            { header: `Waktu (${intervalString})`, key: 'tgl', width: 20 },
            { header: '5-20%', key: 'range_5_20', width: 20 },
            { header: '21-40%', key: 'range_21_40', width: 20 },
            { header: '41-60%', key: 'range_41_60', width: 20 },
            { header: '61-80%', key: 'range_61_80', width: 20 },
            { header: '81-100%', key: 'range_81_100', width: 20 },
            { header: '> 100%', key: 'range_up_100', width: 20 },
        ];

        worksheet.addRows(obj);

        worksheet.eachRow(function (row, rowNumber) {

            row.eachCell((cell, colNumber) => {
                if (rowNumber == 1) {
                    // First set the background of header row
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'f5b914' }
                    };
                }
                // Set border of each cell 
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Set alignment of each cell 
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            //Commit the changed row to the stream
            row.commit();
        });

        worksheet.addRow({
            tgl: 'TOTAL', // TOTAL TITLE
            range_5_20: total_range_5_20 || 0,
            range_21_40: total_range_21_40 || 0,
            range_41_60: total_range_41_60 || 0,
            range_61_80: total_range_61_80 || 0,
            range_81_100: total_range_81_100 || 0,
            range_up_100: total_range_up_100 || 0
        }, 'i');

        var m = moment();
        var ms = m.milliseconds() + 1000 * (m.seconds() + 60 * (m.minutes() + 60 * m.hours()));
        const filename = `laporan_kelebihan_muatan_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}_${req.query.kuppkb}.xlsx`;
        const uploadPath = path.join(config.path_report) + '/xls/' + filename;
        const reportUrl = config.report_url + 'xls/' + filename;

        workbook.xlsx.writeFile(uploadPath).then(function () {
            console.log("xlsx file is written.");
            res.send({
                success: true,
                message: 'Export Excel Berhasil.',
                filename: filename,
                download: reportUrl
            });
        });
    }

    const sqlWim = async (req, kode_uppkb) => {
        // const kode_uppkb = req.query.kuppkb;
        const interval = req.query.interval;
        const bulan = req.query.bulan;
        const tahun = req.query.tahun;
        const dayfrom = '01';
        const dayto = daysInMonth(bulan, tahun);
        const datefrom = `${tahun}-${bulan}-${dayfrom}`;
        const dateto = `${tahun}-${bulan}-${dayto}`;
        const tgl_awal = moment(req.query.tgl_awal).format('YYYY-MM-DD');
        const tgl_akhir = moment(req.query.tgl_akhir).format('YYYY-MM-DD');

        const dateblnfrom = `${tahun}-01-01`;
        const dateblnto = `${tahun}-12-31`;
        var sql = ``;
        if (interval === 'bulan' && kode_uppkb && bulan && tahun) {
            sql = `SELECT 
                        daytime::DATE AS waktu,
                        v_lap_datawim.kode_uppkb,
                        SUM(v_lap_datawim.jml_wim) as jml_wim,
                        SUM(v_lap_datawim.jml_blue_tersedia) as jml_blue_tersedia,
                        SUM(v_lap_datawim.jml_blue_tidak_tersedia) as jml_blue_tidak_tersedia,
                        SUM(v_lap_datawim.jml_masuk_uppkb) as jml_masuk_uppkb,
                        SUM(v_lap_datawim.jml_tidak_masuk_uppkb) as jml_tidak_masuk_uppkb
                    FROM generate_series ('${datefrom}'::DATE, '${dateto}'::DATE, '1 day' ) s ( daytime )
                    LEFT JOIN v_lap_datawim ON (v_lap_datawim.waktu = daytime)
	                GROUP BY daytime, kode_uppkb
                    ORDER BY daytime ASC`;
        } else if (interval === 'tahun' && kode_uppkb && tahun) {
            sql = `SELECT 
                        TO_CHAR(months, 'YYYY-MM') AS waktu, 
                        v_lap_datawim.kode_uppkb,
                        SUM(v_lap_datawim.jml_wim) as jml_wim,
                        SUM(v_lap_datawim.jml_blue_tersedia) as jml_blue_tersedia,
                        SUM(v_lap_datawim.jml_blue_tidak_tersedia) as jml_blue_tidak_tersedia,
                        SUM(v_lap_datawim.jml_masuk_uppkb) as jml_masuk_uppkb,
                        SUM(v_lap_datawim.jml_tidak_masuk_uppkb) as jml_tidak_masuk_uppkb
                    FROM generate_series ('${dateblnfrom}'::DATE, '${dateblnto}'::DATE, '1 month' ) AS months
                    LEFT JOIN v_lap_datawim ON (to_char(v_lap_datawim.waktu, 'YYYY-MM') = TO_CHAR(months, 'YYYY-MM'))
                    GROUP BY months, kode_uppkb
                    ORDER BY months ASC`;
        } else if (interval === 'tanggal' && kode_uppkb && tgl_awal && tgl_akhir) {
            sql = `SELECT 
                        daytime::DATE AS waktu,
                        v_lap_datawim.kode_uppkb,
                        SUM(v_lap_datawim.jml_wim) as jml_wim,
                        SUM(v_lap_datawim.jml_blue_tersedia) as jml_blue_tersedia,
                        SUM(v_lap_datawim.jml_blue_tidak_tersedia) as jml_blue_tidak_tersedia,
                        SUM(v_lap_datawim.jml_masuk_uppkb) as jml_masuk_uppkb,
                        SUM(v_lap_datawim.jml_tidak_masuk_uppkb) as jml_tidak_masuk_uppkb
                    FROM generate_series ('${tgl_awal}'::DATE, '${tgl_akhir}'::DATE, '1 day' ) s ( daytime )
                    LEFT JOIN v_lap_datawim ON (v_lap_datawim.waktu = daytime)
	                GROUP BY daytime, kode_uppkb
                    ORDER BY daytime ASC`;
        }
        // console.log(sql);
        return sql;
    }

    const resultquerywim = async (req, res) => {
        var interval = req.query.interval;
        var lokasi = req.query.lokasi;
        var kuppkb = req.query.kuppkb;
        var datauppkb = await getWilayahLokasiUppkbByKodeUppkb(kuppkb);
        var namauppkb = datauppkb.nama_uppkb;
        if (lokasi) {
            var uppkbbylokasi = await getWilayahLokasiUppkbById(lokasi);
            kuppkb = uppkbbylokasi.kode_uppkb;
            namauppkb = uppkbbylokasi.nama_uppkb;
        }

        const sql = await sqlWim(req, kuppkb);

        if (sql != '') {
            let result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            var arr = [];
            if (result) {
                // console.log(result);
                for (var row of result) {
                    var formatwaktu = row.waktu;
                    if (interval == 'tahun') {
                        formatwaktu = setMonth(Number(moment(row.waktu, 'YYYY-MM').format('MM')) - 1);
                    }

                    arr.push({
                        waktu: formatwaktu,
                        kode_uppkb: row.kode_uppkb ? row.kode_uppkb : kuppkb,
                        jml_wim: row.jml_wim || 0,
                        jml_blue_tersedia: row.jml_blue_tersedia || 0,
                        jml_blue_tidak_tersedia: row.jml_blue_tidak_tersedia || 0,
                        jml_masuk_uppkb: row.jml_masuk_uppkb || 0,
                        jml_tidak_masuk_uppkb: row.jml_tidak_masuk_uppkb || 0
                    })
                }
            }

            var arrdata = [];
            if (arr.length > 0) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].kode_uppkb == kuppkb) {
                        arrdata.push(arr[i]);
                    }
                }
            }
            return arrdata;

        } else {
            return [];
        }
    }

    const laporanWim = async (req, res, next) => {
        try {
            var data = await resultquerywim(req, res);

            if (data.length > 0) {
                res.send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: data
                });
            } else {
                res.send({
                    success: false,
                    message: 'Error QUERY. NO SQL EXECUTE',
                    data: []
                });
            }
        } catch (error) {
            next(error);
        }

    }

    const printLaporanWim = async (req, res, next) => {
        var ispdf = req.query.ispdf;
        var lokasi = req.query.lokasi;
        var kuppkb = req.query.kuppkb;
        var bulan = req.query.bulan;
        var tahun = req.query.tahun;
        var datauppkb = await getWilayahLokasiUppkbByKodeUppkb(kuppkb);
        var namauppkb = datauppkb.nama_uppkb;
        var korsatpel = await getKorsatpelByKode(kuppkb);
        var tgl_awal = moment(req.query.tgl_awal).format('YYYY-MM-DD');
        var tgl_akhir = moment(req.query.tgl_akhir).format('YYYY-MM-DD');
        if (lokasi) {
            var uppkbbylokasi = await getWilayahLokasiUppkbById(lokasi);
            kuppkb = uppkbbylokasi.id_uppkb;
            namauppkb = uppkbbylokasi.nama_uppkb;
        }

        var data = await resultquerywim(req, res);
        let intervalString = '';
        if (req.query.interval === 'bulan') intervalString = 'BULANAN';
        if (req.query.interval === 'tahun') intervalString = 'TAHUNAN';
        if (req.query.interval === 'tanggal') intervalString = '';

        let tglText = '';
        if (tgl_awal && tgl_akhir) {
            if (tgl_awal == tgl_akhir) {
                tglText = `TANGGAL ${moment(tgl_awal).format('DD-MM-YYYY')}`;
            } else {
                tglText = `TANGGAL ${moment(tgl_awal).format('DD-MM-YYYY')} S/D ${moment(tgl_akhir).format('DD-MM-YYYY')}`;
            }
        }

        const resumedata = {
            jmlData: data.length,
            interval: req.query.interval,
            intervalString: intervalString,
        };
        const header = await reportTemplate();

        var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
        // var path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
        const fs = require('fs');
        const contents = fs.readFileSync(path_img, { encoding: 'base64' });
        var blnText = setMonth(Number(bulan) - 1);
        if (ispdf == 0) {
            res.render("laporanDataWimView.ejs", {
                data: data,
                moment: moment,
                tahun: tahun,
                blnText: blnText,
                tglText: tglText,
                namauppkb: namauppkb,
                korsatpel: korsatpel,
                resumedata: resumedata,
                headerJudul: header.judul || 'Laporan',
                headerSubjudul: header.sub_judul || namauppkb,
                logo: 'data:image/png;base64,' + contents
            });
        } else {
            ejs.renderFile(path.join(__dirname, '../views/', "laporanDataWimView.ejs"), {
                data: data,
                namauppkb: namauppkb,
                korsatpel: korsatpel,
                moment: moment,
                tahun: tahun,
                blnText: blnText,
                tglText: tglText,
                resumedata: resumedata,
                headerJudul: header.judul || 'Laporan',
                headerSubjudul: header.sub_judul || namauppkb,
                logo: 'data:image/png;base64,' + contents
            }, async (err, datapdf) => {
                if (err) {
                    res.send(err);
                } else {
                    const options = {
                        format: 'A4',
                        landscape: false,
                        printBackground: true,
                        margin: { top: '4mm', bottom: '4mm' }
                    };

                    var nama_file_uppkb = 'all_uppkb';
                    if (kuppkb) {
                        nama_file_uppkb = kuppkb;
                    }
                    const filename = `laporan_data_wim_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
                    const uploadPath = path.join(config.path_report) + '/pdf/' + filename;
                    const reportUrl = config.report_url + 'pdf/' + filename;

                    try {
                        await generatePdfFile(datapdf, options, uploadPath);
                        res.send({
                            success: true,
                            message: 'Create PDF Berhasil.',
                            download: reportUrl,
                        });
                    } catch (err) {
                        console.error('PDF error:', err);
                        res.send({
                            success: false,
                            message: 'Create PDF Gagal.',
                            download: ''
                        });
                    }
                }
            });
        }
    }

    const xlsLaporanWim = async (req, res, next) => {
        var lokasi = req.query.lokasi;
        var kuppkb = req.query.kuppkb;
        var interval = req.query.interval;
        var datauppkb = await getWilayahLokasiUppkbByKodeUppkb(kuppkb);
        var namauppkb = datauppkb.nama_uppkb;
        if (lokasi) {
            var uppkbbylokasi = await getWilayahLokasiUppkbById(lokasi);
            console.log(uppkbbylokasi);
            kuppkb = uppkbbylokasi.id_uppkb;
            namauppkb = uppkbbylokasi.nama_uppkb;
        }

        var data = await resultquerywim(req, res);

        let total_wim = 0;
        let total_blue_tersedia = 0;
        let total_blue_tidak_tersedia = 0;
        let total_masuk_uppkb = 0;
        let total_tidak_masuk_uppkb = 0;

        var obj = [];

        for (var row of data) {
            total_wim = Number(total_wim) + Number(row.jml_wim || 0);
            total_blue_tersedia = Number(total_blue_tersedia) + Number(row.jml_blue_tersedia || 0);
            total_blue_tidak_tersedia = Number(total_blue_tidak_tersedia) + Number(row.jml_blue_tidak_tersedia || 0);
            total_masuk_uppkb = Number(total_masuk_uppkb) + Number(row.jml_masuk_uppkb || 0);
            total_tidak_masuk_uppkb = Number(total_tidak_masuk_uppkb) + Number(row.jml_tidak_masuk_uppkb || 0);

            let waktu = row.waktu;
            if (interval == 'bulan') waktu = moment(row.waktu).format('DD-MM-YYYY');
            if (interval == 'tanggal') waktu = moment(row.waktu).format('DD-MM-YYYY');

            obj.push({
                tgl: waktu,
                jml_wim: row.jml_wim || 0,
                jml_blue_tersedia: row.jml_blue_tersedia || 0,
                jml_blue_tidak_tersedia: row.jml_blue_tidak_tersedia || 0,
                jml_masuk_uppkb: row.jml_masuk_uppkb || 0,
                jml_tidak_masuk_uppkb: row.jml_tidak_masuk_uppkb || 0
            });

        }

        //creating workbook
        let workbook = new excel.Workbook();

        //creating worksheet
        let worksheet = workbook.addWorksheet('Laporan Data WIM', {
            pageSetup: { paperSize: 9, orientation: 'portrait' },
        });

        // adjust pageSetup settings afterwards
        worksheet.pageSetup.margins = {
            left: 0.7, right: 0.7,
            top: 0.75, bottom: 0.75,
            header: 0.3, footer: 0.3
        };

        //  WorkSheet Header
        let intervalString = '';
        if (req.query.interval === 'tanggal') intervalString = 'Tanggal';
        if (req.query.interval === 'bulan') intervalString = 'Tanggal';
        if (req.query.interval === 'tahun') intervalString = 'Bulan';

        worksheet.columns = [
            { header: `Waktu (${intervalString})`, key: 'tgl', width: 20 },
            { header: 'Jumlah Data WIM', key: 'jml_wim', width: 20 },
            { header: 'BLUE Tersedia', key: 'jml_blue_tersedia', width: 20 },
            { header: 'BLUE Tidak Tersedia', key: 'jml_blue_tidak_tersedia', width: 20 },
            { header: 'Masuk UPPKB', key: 'jml_masuk_uppkb', width: 20 },
            { header: 'Tidak Masuk UPPKB', key: 'jml_tidak_masuk_uppkb', width: 20 },
        ];

        worksheet.addRows(obj);

        worksheet.eachRow(function (row, rowNumber) {

            row.eachCell((cell, colNumber) => {
                if (rowNumber == 1) {
                    // First set the background of header row
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'f5b914' }
                    };
                }
                // Set border of each cell 
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Set alignment of each cell 
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            //Commit the changed row to the stream
            row.commit();
        });

        worksheet.addRow({
            tgl: 'TOTAL', // TOTAL TITLE
            jml_wim: total_wim || 0,
            jml_blue_tersedia: total_blue_tersedia || 0,
            jml_blue_tidak_tersedia: total_blue_tidak_tersedia || 0,
            jml_masuk_uppkb: total_masuk_uppkb || 0,
            jml_tidak_masuk_uppkb: total_tidak_masuk_uppkb || 0
        }, 'i');

        var m = moment();
        var ms = m.milliseconds() + 1000 * (m.seconds() + 60 * (m.minutes() + 60 * m.hours()));
        const filename = `laporan_data_wim_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}_${req.query.kuppkb}.xlsx`;
        const uploadPath = path.join(config.path_report) + '/xls/' + filename;
        const reportUrl = config.report_url + 'xls/' + filename;

        workbook.xlsx.writeFile(uploadPath).then(function () {
            console.log("xlsx file is written.");
            res.send({
                success: true,
                message: 'Export Excel Berhasil.',
                filename: filename,
                download: reportUrl
            });
        });
    }

    const sqlAset = async (bptd, lokasi, tahun) => {

        let where = '';
        if (tahun) {
            where = `WHERE tahun = ${tahun}`;
        }
        if (bptd) {
            where = `WHERE bptd_id = ${bptd}`;
        }
        if (lokasi) {
            where = `WHERE lokasi_id = ${lokasi}`;
        }
        if (bptd && lokasi) {
            where = `WHERE bptd_id = ${bptd} AND lokasi_id = ${lokasi}`;
        }
        if (bptd && tahun) {
            where = `WHERE bptd_id = ${bptd} AND tahun = ${tahun}`;
        }
        if (bptd && lokasi && tahun) {
            where = `WHERE bptd_id = ${bptd} AND lokasi_id = ${lokasi} AND tahun = ${tahun}`;
        }

        var sql = `SELECT * FROM v_lap_aset ${where}`;

        console.log(sql);
        return sql;
    }

    const resultqueryaset = async (req, res) => {
        var lokasi_uppkb_id = req.query.lokasi
        var bptd_id = req.query.bptd
        var tahun = req.query.tahun
        if (lokasi_uppkb_id) {
            var uppkbbylokasi = await getWilayahLokasiUppkbById(lokasi_uppkb_id);
            var kuppkb = uppkbbylokasi.kode_uppkb;
            var namauppkb = uppkbbylokasi.nama_uppkb;
        }

        const sql = await sqlAset(bptd_id, lokasi_uppkb_id, tahun);

        if (sql != '') {
            let result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            if (result) {
                return result;
            } else {
                return [];
            }

        } else {
            return [];
        }
    }

    const laporanAset = async (req, res, next) => {
        try {
            var data = await resultqueryaset(req, res);

            res.send({
                success: true,
                message: messageService().GET_SUCCESS,
                data: data
            });
        } catch (error) {
            next(error);
        }

    }

    const printLaporanAset = async (req, res, next) => {
        var ispdf = req.query.ispdf;
        var bptd = req.query.bptd
        var lokasi = req.query.lokasi;
        var tahun = req.query.tahun

        let namabptd = '';
        let filter = 'LOKASI';
        if (bptd) {
            namabptd = await getNamaBptd(bptd);
            if (lokasi) {
                filter = 'UPPKB'
            } else {
                filter = 'BPTD'
            }
        }

        let kuppkb = '';
        let namauppkb = '';
        if (lokasi) {
            var uppkbbylokasi = await getWilayahLokasiUppkbById(lokasi);
            kuppkb = uppkbbylokasi.kode_uppkb;
            namauppkb = uppkbbylokasi.nama_uppkb;
        }

        var data = await resultqueryaset(req, res);

        const resumedata = {
            jmlData: data.length,
            namabptd: namabptd,
            namauppkb: namauppkb,
            filter: filter,
            tahun: tahun,
        };
        const header = await reportTemplate();

        var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
        // var path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
        const fs = require('fs');
        const contents = fs.readFileSync(path_img, { encoding: 'base64' });
        if (ispdf == 0) {
            res.render("laporanAsetView.ejs", {
                data: data,
                moment: moment,
                resumedata: resumedata,
                logo: 'data:image/png;base64,' + contents
            });
        } else {
            ejs.renderFile(path.join(__dirname, '../views/', "laporanAsetView.ejs"), {
                data: data,
                moment: moment,
                resumedata: resumedata,
                logo: 'data:image/png;base64,' + contents
            }, async (err, datapdf) => {
                if (err) {
                    res.send(err);
                } else {
                    const options = {
                        format: 'Legal',
                        landscape: true,
                        printBackground: true,
                        margin: { top: '5mm', bottom: '7mm' }
                    };

                    var nama_file_uppkb = 'all_uppkb';
                    if (bptd) {
                        if (lokasi) {
                            nama_file_uppkb = kuppkb;
                        } else {
                            nama_file_uppkb = `bptd_${bptd}`;
                        }
                    }
                    const filename = `laporan_data_aset_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
                    const uploadPath = path.join(config.path_report) + '/pdf/' + filename;
                    const reportUrl = config.report_url + 'pdf/' + filename;

                    try {
                        await generatePdfFile(datapdf, options, uploadPath);
                        res.send({
                            success: true,
                            message: 'Create PDF Berhasil.',
                            download: reportUrl,
                        });
                    } catch (err) {
                        console.error('PDF error:', err);
                        res.send({
                            success: false,
                            message: 'Create PDF Gagal.',
                            download: ''
                        });
                    }
                }
            });
        }
    }

    const xlsLaporanAset = async (req, res, next) => {
        var bptd = req.query.bptd
        var lokasi = req.query.lokasi;
        var tahun = req.query.tahun
        var kategori_id = req.query.kategori_id

        let namabptd = '';
        let filter = 'LOKASI';
        if (bptd) {
            namabptd = await getNamaBptd(bptd);
            if (lokasi) {
                filter = 'UPPKB'
            } else {
                filter = 'BPTD'
            }
        }

        let kuppkb = '';
        let namauppkb = '';
        if (lokasi) {
            var uppkbbylokasi = await getWilayahLokasiUppkbById(lokasi);
            kuppkb = uppkbbylokasi.kode_uppkb;
            namauppkb = uppkbbylokasi.nama_uppkb;
        }

        var data = await resultqueryaset(req, res);

        // let totalAset = 0;
        // let totalBerfungsi = 0;
        // let totalTidakBerfungsi = 0;
        // let totalNormal = 0;
        // let totalUpNormal = 0;
        // let totalRusak = 0;
        // let totalHilang = 0;
        // let totalPengaduan = 0;
        // let totalPenanganan = 0;
        // let totalUsulan = 0;

        var obj = [];

        for (var row of data) {
            // totalAset = Number(totalAset) + Number(row.total || 0)
            // totalBerfungsi = Number(totalBerfungsi) + Number(row.jumlah_berfungsi || 0)
            // totalTidakBerfungsi = Number(totalTidakBerfungsi) + Number(row.jumlah_tidak_berfungsi || 0)
            // totalNormal = Number(totalNormal) + Number(row.jumlah_normal || 0)
            // totalUpNormal = Number(totalUpNormal) + Number(row.jumlah_upnormal || 0)
            // totalRusak = Number(totalUpNormal) + Number(row.jumlah_rusak || 0)
            // totalHilang = Number(totalUpNormal) + Number(row.jumlah_hilang || 0)
            // totalPengaduan = Number(totalUpNormal) + Number(row.jml_pengaduan || 0)
            // totalPenanganan = Number(totalUpNormal) + Number(row.jml_penanganan || 0)
            // totalUsulan = Number(totalUpNormal) + Number(row.jml_usulan || 0)

            obj.push({
                tahun: row.tahun,
                nama_bptd: row.nama_bptd,
                nama_uppkb: row.nama_uppkb,
                total: row.total || 0,
                jumlah_berfungsi: row.jumlah_berfungsi || 0,
                jumlah_tidak_berfungsi: row.jumlah_tidak_berfungsi || 0,
                jumlah_normal: row.jumlah_normal || 0,
                jumlah_upnormal: row.jumlah_upnormal || 0,
                jumlah_rusak: row.jumlah_rusak || 0,
                jumlah_hilang: row.jumlah_hilang || 0,
                jml_pengaduan: row.jml_pengaduan || 0,
                jml_penanganan: row.jml_penanganan || 0,
                jml_usulan: row.jml_usulan || 0,
            });

        }

        //creating workbook
        let workbook = new excel.Workbook();

        //creating worksheet
        let worksheet = workbook.addWorksheet('Laporan Data Manajemen Aset', {
            pageSetup: { paperSize: 9, orientation: 'landscape' },
        });

        // adjust pageSetup settings afterwards
        worksheet.pageSetup.margins = {
            left: 0.7, right: 0.7,
            top: 0.75, bottom: 0.75,
            header: 0.3, footer: 0.3
        };

        worksheet.columns = [
            { header: `Tahun`, key: 'tahun', width: 20 },
            { header: `BPTD`, key: 'nama_bptd', width: 30 },
            { header: `UPPKB`, key: 'nama_uppkb', width: 30 },
            { header: 'Jumlah Aset', key: 'total', width: 20 },
            { header: 'Kondisi Berfungsi', key: 'jumlah_berfungsi', width: 20 },
            { header: 'Kondisi Tidak Berfungsi', key: 'jumlah_tidak_berfungsi', width: 20 },
            { header: 'Normal', key: 'jumlah_normal', width: 20 },
            { header: 'Up Normalk', key: 'jumlah_upnormal', width: 20 },
            { header: 'Rusak', key: 'jumlah_rusak', width: 20 },
            { header: 'Hilang', key: 'jumlah_hilang', width: 20 },
            { header: 'Jumlah Aset Pengaduan', key: 'jml_pengaduan', width: 20 },
            { header: 'Jumlah Aset Penanganan', key: 'jml_penanganan', width: 20 },
            { header: 'Jumlah Aset Usulan', key: 'jml_usulan', width: 20 },
        ];

        worksheet.addRows(obj);

        worksheet.eachRow(function (row, rowNumber) {

            row.eachCell((cell, colNumber) => {
                if (rowNumber == 1) {
                    // First set the background of header row
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'f5b914' }
                    };
                }
                // Set border of each cell 
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Set alignment of each cell 
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            //Commit the changed row to the stream
            row.commit();
        });

        // worksheet.addRow({
        //     nama_uppkb: 'TOTAL',
        //     total: totalAset,
        //     jumlah_aset_tetap: totalAsetTetap,
        //     jumlah_aset_tidak_tetap: totalAsetTidakTetap,
        //     jumlah_baik: totalBaik,
        //     jumlah_rusak: totalRusak,
        // }, 'i');

        var nama_file_uppkb = 'all_uppkb';
        if (bptd) {
            if (lokasi) {
                nama_file_uppkb = kuppkb;
            } else {
                nama_file_uppkb = `bptd_${bptd}`;
            }
        }
        var m = moment();
        var ms = m.milliseconds() + 1000 * (m.seconds() + 60 * (m.minutes() + 60 * m.hours()));
        const filename = `laporan_data_aset_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}_${nama_file_uppkb}.xlsx`;
        const uploadPath = path.join(config.path_report) + '/xls/' + filename;
        const reportUrl = config.report_url + 'xls/' + filename;

        workbook.xlsx.writeFile(uploadPath).then(function () {
            console.log("xlsx file is written.");
            res.send({
                success: true,
                message: 'Export Excel Berhasil.',
                filename: filename,
                download: reportUrl
            });
        });
    }

    const sqlPengaduan = async (req, kode_uppkb) => {
        // const kode_uppkb = req.query.kuppkb;
        const interval = req.query.interval;
        const bulan = req.query.bulan;
        const tahun = req.query.tahun;
        const dayfrom = '01';
        const dayto = daysInMonth(bulan, tahun);
        const datefrom = `${tahun}-${bulan}-${dayfrom}`;
        const dateto = `${tahun}-${bulan}-${dayto}`;

        const dateblnfrom = `${tahun}-01-01`;
        const dateblnto = `${tahun}-12-31`;
        var sql = ``;
        if (interval === 'bulan' && kode_uppkb && bulan && tahun) {
            sql = `SELECT 
                        daytime::DATE AS waktu, 
                        v_lap_pengaduan.id_uppkb, 
                        v_lap_pengaduan.kode_uppkb, 
                        v_lap_pengaduan.nama_uppkb, 
                        v_lap_pengaduan.id_bptd, 
                        v_lap_pengaduan.kode_bptd, 
                        v_lap_pengaduan.nama_bptd, 
                        SUM(v_lap_pengaduan.jml_pengaduan) as jml_pengaduan,
                        SUM(v_lap_pengaduan.jml_sudah_ditangani) as jml_sudah_ditangani,
                        SUM(v_lap_pengaduan.jml_belum_ditangani) as jml_belum_ditangani,
                        SUM(v_lap_pengaduan.ditangani_nanti) as ditangani_nanti, 
                        SUM(v_lap_pengaduan.sudah_ditangani_dengan_catatan) as sudah_ditangani_dengan_catatan, 
                        SUM(v_lap_pengaduan.sudah_ditangani_tanpa_catatan) as sudah_ditangani_tanpa_catatan, 
                        SUM(v_lap_pengaduan.tidak_dapat_ditangani) as tidak_dapat_ditangani
                    FROM generate_series ('${datefrom}'::DATE, '${dateto}'::DATE, '1 day' ) s ( daytime )
                    LEFT JOIN v_lap_pengaduan ON (v_lap_pengaduan.waktu = daytime)
                    GROUP BY daytime, id_uppkb, kode_uppkb, nama_uppkb, id_bptd, kode_bptd, nama_bptd
                    ORDER BY daytime ASC`;
        } else if (interval === 'tahun' && kode_uppkb && tahun) {
            sql = `SELECT 
                        TO_CHAR(months, 'YYYY-MM') AS waktu, 
                        v_lap_pengaduan.id_uppkb, 
                        v_lap_pengaduan.kode_uppkb, 
                        v_lap_pengaduan.nama_uppkb, 
                        v_lap_pengaduan.id_bptd, 
                        v_lap_pengaduan.kode_bptd, 
                        v_lap_pengaduan.nama_bptd, 
                        SUM(v_lap_pengaduan.jml_pengaduan) as jml_pengaduan,
                        SUM(v_lap_pengaduan.jml_sudah_ditangani) as jml_sudah_ditangani,
                        SUM(v_lap_pengaduan.jml_belum_ditangani) as jml_belum_ditangani,
                        SUM(v_lap_pengaduan.ditangani_nanti) as ditangani_nanti, 
                        SUM(v_lap_pengaduan.sudah_ditangani_dengan_catatan) as sudah_ditangani_dengan_catatan, 
                        SUM(v_lap_pengaduan.sudah_ditangani_tanpa_catatan) as sudah_ditangani_tanpa_catatan, 
                        SUM(v_lap_pengaduan.tidak_dapat_ditangani) as tidak_dapat_ditangani
                    FROM generate_series ('${dateblnfrom}'::DATE, '${dateblnto}'::DATE, '1 month' ) AS months
                    LEFT JOIN v_lap_pengaduan ON (to_char(v_lap_pengaduan.waktu, 'YYYY-MM') = TO_CHAR(months, 'YYYY-MM'))
                    GROUP BY months, id_uppkb, kode_uppkb, nama_uppkb, id_bptd, kode_bptd, nama_bptd
                    ORDER BY months ASC`;
        }
        // console.log(sql);
        return sql;
    }

    const resultquerypengaduan = async (req, res) => {
        var interval = req.query.interval;
        var lokasi = req.query.lokasi;
        var kuppkb = req.query.kuppkb;
        var datauppkb = await getWilayahLokasiUppkbByKodeUppkb(kuppkb);
        var namauppkb = datauppkb.nama_uppkb;
        if (lokasi) {
            var uppkbbylokasi = await getWilayahLokasiUppkbById(lokasi);
            kuppkb = uppkbbylokasi.kode_uppkb;
            namauppkb = uppkbbylokasi.nama_uppkb;
        }

        const sql = await sqlPengaduan(req, kuppkb);

        if (sql != '') {
            let result = await sequelize.query(sql, {
                type: QueryTypes.SELECT,
                logging: false
            });

            var arr = [];
            if (result) {
                // console.log(result);
                for (var row of result) {
                    var formatwaktu = row.waktu;
                    if (interval == 'tahun') {
                        formatwaktu = setMonth(Number(moment(row.waktu, 'YYYY-MM').format('MM')) - 1);
                    }

                    arr.push({
                        waktu: formatwaktu,
                        kode_uppkb: row.kode_uppkb ? row.kode_uppkb : kuppkb,
                        nama_uppkb: row.kode_uppkb ? row.nama_uppkb : namauppkb,
                        jml_pengaduan: row.jml_pengaduan || 0,
                        jml_sudah_ditangani: row.jml_sudah_ditangani || 0, //(Number(row.daya_angkut) + Number(row.dimensi) + Number(row.persyaratan_teknis) + Number(row.dokumen) + Number(row.tata_cara_muat)) || 0,
                        jml_belum_ditangani: row.jml_belum_ditangani || 0, //(Number(row.jml_timbang) - (Number(row.daya_angkut) + Number(row.dimensi) + Number(row.persyaratan_teknis) + Number(row.dokumen) + Number(row.tata_cara_muat))) || 0,
                        ditangani_nanti: row.ditangani_nanti || 0,
                        sudah_ditangani_dengan_catatan: row.sudah_ditangani_dengan_catatan || 0,
                        sudah_ditangani_tanpa_catatan: row.sudah_ditangani_tanpa_catatan || 0,
                        tidak_dapat_ditangani: row.tidak_dapat_ditangani || 0
                    })
                }
            }

            var arrdata = [];
            if (arr.length > 0) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].kode_uppkb == kuppkb) {
                        arrdata.push(arr[i]);
                    }
                }
            }
            return arrdata;

        } else {
            return [];
        }
    }

    const laporanPengaduan = async (req, res, next) => {
        try {
            var data = await resultquerypengaduan(req, res);

            if (data.length > 0) {
                res.send({
                    success: true,
                    message: messageService().GET_SUCCESS,
                    data: data
                });
            } else {
                res.send({
                    success: false,
                    message: 'Error QUERY. NO SQL EXECUTE',
                    data: []
                });
            }
        } catch (error) {
            next(error);
        }

    }

    const printLaporanPengaduan = async (req, res, next) => {
        var ispdf = req.query.ispdf;
        var lokasi = req.query.lokasi;
        var kuppkb = req.query.kuppkb;
        var bulan = req.query.bulan;
        var tahun = req.query.tahun;
        var datauppkb = await getWilayahLokasiUppkbByKodeUppkb(kuppkb);
        var namauppkb = datauppkb.nama_uppkb;
        var korsatpel = await getKorsatpelByKode(kuppkb);
        if (lokasi) {
            var uppkbbylokasi = await getWilayahLokasiUppkbById(lokasi);
            kuppkb = uppkbbylokasi.id_uppkb;
            namauppkb = uppkbbylokasi.nama_uppkb;
        }

        var data = await resultquerypengaduan(req, res);
        let intervalString = '';
        if (req.query.interval === 'bulan') intervalString = 'BULANAN';
        if (req.query.interval === 'tahun') intervalString = 'TAHUNAN';

        const resumedata = {
            jmlData: data.length,
            interval: req.query.interval,
            intervalString: intervalString,
        };
        const header = await reportTemplate();

        var path_img = path.join(__dirname, '../views/images/', header.logo || "logo_dishub.png");
        // var path_img = path.join(__dirname, '../views/images/', "logo_dishub.png");
        const fs = require('fs');
        const contents = fs.readFileSync(path_img, { encoding: 'base64' });
        var blnText = setMonth(Number(bulan) - 1);
        if (ispdf == 0) {
            res.render("laporanPengaduanView.ejs", {
                data: data,
                moment: moment,
                tahun: tahun,
                blnText: blnText,
                namauppkb: namauppkb,
                korsatpel: korsatpel,
                resumedata: resumedata,
                logo: 'data:image/png;base64,' + contents
            });
        } else {
            ejs.renderFile(path.join(__dirname, '../views/', "laporanPengaduanView.ejs"), {
                data: data,
                namauppkb: namauppkb,
                korsatpel: korsatpel,
                moment: moment,
                tahun: tahun,
                blnText: blnText,
                resumedata: resumedata,
                logo: 'data:image/png;base64,' + contents
            }, async (err, datapdf) => {
                if (err) {
                    res.send(err);
                } else {
                    const options = {
                        format: 'Legal',
                        landscape: true,
                        printBackground: true,
                        margin: { top: '5mm', bottom: '7mm' }
                    };

                    var nama_file_uppkb = 'all_uppkb';
                    if (kuppkb) {
                        nama_file_uppkb = kuppkb;
                    }
                    const filename = `laporan_pengaduan_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${nama_file_uppkb}.pdf`;
                    const uploadPath = path.join(config.path_report) + '/pdf/' + filename;
                    const reportUrl = config.report_url + 'pdf/' + filename;

                    try {
                        await generatePdfFile(datapdf, options, uploadPath);
                        res.send({
                            success: true,
                            message: 'Create PDF Berhasil.',
                            download: reportUrl,
                        });
                    } catch (err) {
                        console.error('PDF error:', err);
                        res.send({
                            success: false,
                            message: 'Create PDF Gagal.',
                            download: ''
                        });
                    }
                }
            });
        }
    }

    const xlsLaporanPengaduan = async (req, res, next) => {
        var lokasi = req.query.lokasi;
        var kuppkb = req.query.kuppkb;
        var interval = req.query.interval;
        var datauppkb = await getWilayahLokasiUppkbByKodeUppkb(kuppkb);
        var namauppkb = datauppkb.nama_uppkb;
        if (lokasi) {
            var uppkbbylokasi = await getWilayahLokasiUppkbById(lokasi);
            console.log(uppkbbylokasi);
            kuppkb = uppkbbylokasi.id_uppkb;
            namauppkb = uppkbbylokasi.nama_uppkb;
        }

        var data = await resultquerypengaduan(req, res);

        let totalAduan = 0;
        let totalSudahDitangani = 0;
        let totalBelumDitangani = 0;
        let totalDitanganiNanti = 0;
        let totalDenganCatatan = 0;
        let totalTanpaCatatan = 0;
        let totalTidakDitangani = 0;

        var obj = [];

        for (var row of data) {
            totalAduan = Number(totalAduan) + Number(row.jml_pengaduan || 0);
            totalSudahDitangani = Number(totalSudahDitangani) + Number(row.jml_sudah_ditangani || 0);
            totalBelumDitangani = Number(totalBelumDitangani) + Number(row.jml_belum_ditangani || 0);
            totalDitanganiNanti = Number(totalDitanganiNanti) + Number(row.ditangani_nanti || 0);
            totalDenganCatatan = Number(totalDenganCatatan) + Number(row.sudah_ditangani_dengan_catatan || 0);
            totalTanpaCatatan = Number(totalTanpaCatatan) + Number(row.sudah_ditangani_tanpa_catatan || 0);
            totalTidakDitangani = Number(totalTidakDitangani) + Number(row.tidak_dapat_ditangani || 0);
            
            let waktu = row.waktu;
            if (interval == 'bulan') waktu = moment(row.waktu).format('DD-MM-YYYY');

            obj.push({
                tgl: waktu,
                jml_pengaduan: row.jml_pengaduan || 0,
                jml_sudah_ditangani: row.jml_sudah_ditangani || 0,
                jml_belum_ditangani: row.jml_belum_ditangani || 0,
                ditangani_nanti: row.ditangani_nanti || 0,
                sudah_ditangani_dengan_catatan: row.sudah_ditangani_dengan_catatan || 0,
                sudah_ditangani_tanpa_catatan: row.sudah_ditangani_tanpa_catatan || 0,
                tidak_dapat_ditangani: row.tidak_dapat_ditangani || 0,
            });

        }

        //creating workbook
        let workbook = new excel.Workbook();

        //creating worksheet
        let worksheet = workbook.addWorksheet('Laporan Pengaduan', {
            pageSetup: { paperSize: 9, orientation: 'landscape' },
        });

        // adjust pageSetup settings afterwards
        worksheet.pageSetup.margins = {
            left: 0.7, right: 0.7,
            top: 0.75, bottom: 0.75,
            header: 0.3, footer: 0.3
        };

        //  WorkSheet Header
        let intervalString = '';
        if (req.query.interval === 'bulan') intervalString = 'Tanggal';
        if (req.query.interval === 'tahun') intervalString = 'Bulan';

        worksheet.columns = [
            { header: `Waktu (${intervalString})`, key: 'tgl', width: 20 },
            { header: 'Jumlah Pengaduan', key: 'jml_pengaduan', width: 20 },
            { header: 'Jumlah Sudah Ditangani', key: 'jml_sudah_ditangani', width: 20 },
            { header: 'Jumlah Belum Ditangani', key: 'jml_belum_ditangani', width: 20 },
            { header: 'Ditangani Nanti', key: 'ditangani_nanti', width: 20 },
            { header: 'Sudah Ditangani Dengan Catatan', key: 'sudah_ditangani_dengan_catatan', width: 20 },
            { header: 'Sudah Ditangani Tanpa Catatan', key: 'sudah_ditangani_tanpa_catatan', width: 20 },
            { header: 'Tidak Dapat Ditangani', key: 'tidak_dapat_ditangani', width: 20 },
        ];

        worksheet.addRows(obj);

        worksheet.eachRow(function (row, rowNumber) {

            row.eachCell((cell, colNumber) => {
                if (rowNumber == 1) {
                    // First set the background of header row
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'f5b914' }
                    };
                }
                // Set border of each cell 
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Set alignment of each cell 
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            //Commit the changed row to the stream
            row.commit();
        });

        worksheet.addRow({
            tgl: 'TOTAL', // TOTAL TITLE
            jml_pengaduan: totalAduan,
            jml_sudah_ditangani: totalSudahDitangani,
            jml_belum_ditangani: totalBelumDitangani,
            ditangani_nanti: totalDitanganiNanti,
            sudah_ditangani_dengan_catatan: totalDenganCatatan,
            sudah_ditangani_tanpa_catatan: totalTanpaCatatan,
            tidak_dapat_ditangani: totalTidakDitangani,
        }, 'i');

        var m = moment();
        var ms = m.milliseconds() + 1000 * (m.seconds() + 60 * (m.minutes() + 60 * m.hours()));
        const filename = `laporan_pengaduan_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}_${kuppkb}.xlsx`;
        const uploadPath = path.join(config.path_report) + '/xls/' + filename;
        const reportUrl = config.report_url + 'xls/' + filename;

        workbook.xlsx.writeFile(uploadPath).then(function () {
            console.log("xlsx file is written.");
            res.send({
                success: true,
                message: 'Export Excel Berhasil.',
                filename: filename,
                download: reportUrl
            });
        });
    }

    return {
        //rekapLapBulanan,
        laporanPengawasan,
        printLaporanPengawasan,
        xlsLaporanPengawasan,
        laporanLebihMuatan,
        printLaporanLebihMuatan,
        xlsLaporanLebihMuatan,
        laporanWim,
        printLaporanWim,
        xlsLaporanWim,
        laporanAset,
        printLaporanAset,
        xlsLaporanAset,
        laporanPengaduan,
        printLaporanPengaduan,
        xlsLaporanPengaduan
    };
}
module.exports = LaporanController;