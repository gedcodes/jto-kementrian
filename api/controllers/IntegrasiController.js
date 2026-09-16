const { sequelize } = require('../models');
const { ujiberkala, qrcodescan, upsert } = require('./lib/integrasiblue');
const { getJenisKendaraanId, getSumbuId, getKepemilikanId, getKepemilikanVal, checkMasaBerlaku } = require('./lib/dataid');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const messageService = require('../services/message.service');
const moment = require('moment');

const IntegrasiController = () => {

    const findUjiberkala = async (req, res, next) => {
        console.log("--------------------::Processing Find Uji Berkala::--------------------");
        try {
            const nokend = req.query.nokend;
            const nouji = req.query.nouji;
            if (nokend || nouji) {
                var data = await ujiberkala(nokend, nouji);
                //console.log(data)
                if (data) { //data.no_uji
                    var masa_berlaku = data.masa_berlaku;
                    var is_masa_berlaku = await checkMasaBerlaku(moment(masa_berlaku).format('YYYY-MM-DD'));
                    console.log(is_masa_berlaku);
                    var jenis_kendaraan_id = await getJenisKendaraanId(data.jenis_kendaraan);
                    var sumbu_id = await getSumbuId(data.sumbu);
                    let kepemilikan_id = await getKepemilikanId(data.nama_pemilik);
                    let kepemilikan_val = await getKepemilikanVal(data.nama_pemilik);
                    var mst = 0;
                    var upsert_data = await upsert(data.rfid || '', data.vcode || '', data.no_registrasi_kendaraan, data.no_uji_kendaraan, data.nama_pemilik, data.alamat_pemilik, data.unit_pelaksana_teknis, moment(data.date).format('YYYY-MM-DD'), moment(data.masa_berlaku).format('YYYY-MM-DD'), data.jenis_kendaraan, data.sumbu, data.berat_kosong, data.jbb, data.jbkb, data.jbi, data.jbki, data.panjang_kendaraan, data.lebar_kendaraan, data.tinggi_kendaraan, data.julur_depan, data.julur_belakang, '', '', '', data.no_rangka, data.merk, data.bahan_bakar, data.daya_angkut_orang, data.daya_angkut_kg, data.kelas_jalan, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id, is_masa_berlaku, true, '', '', '', '', '', req.token.id, jenis_kendaraan_id, sumbu_id, data.id, data.no_srut, moment(data.tgl_srut).format('YYYY-MM-DD HH:mm:ss'), data.no_mesin, data.tipe, Number(data.tahun_rakit), data.isi_silinder, Number(data.daya_motor), data.ukuran_ban, data.keterangan_hasil_uji, data.petugas_penguji, data.nrp_petugas_penguji, data.kepala_dinas, data.pangkat_kepala_dinas, data.nip_kepala_dinas, data.unit_pelaksana_teknis, data.direktur, data.pangkat_direktur, data.nip_direktur, moment(data.etl_date).format('YYYY-MM-DD HH:mm:ss'), data.jarak_sumbu_1_2, data.jarak_sumbu_2_3, data.jarak_sumbu_3_4, data.dimensi_bak_tangki, mst, kepemilikan_id, kepemilikan_val);
                    console.log(upsert_data.length, is_masa_berlaku);
                    res.send({
                        success: true,
                        message: 'Req. Data Uji Berkala Berhasil',
                        data: data
                    })
                } else {
                    res.send({
                        success: false,
                        message: 'Req. Data Not Found'
                    })
                }
            } else {
                res.send({
                    success: false,
                    message: 'No. Kendaraan Tidak Boleh Kosong'
                })
            }

        } catch (err) {
            console.log(err)
        }
    }

    const findQrScan = async (req, res, next) => {
        console.log("--------------------::Processing Find QR::--------------------");
        try {
            const key = req.query.key;
            if (key) {
                var response = await qrcodescan(key);

                if (typeof response == 'object') {
                    res.send({
                        success: true,
                        message: 'Req. Data Uji Berkala Berhasil',
                        data: response
                    })
                } else {
                    var data = await ujiberkala(response);
                    //console.log(data)
                    if (data) { //data.no_uji
                        var masa_berlaku = data.masa_berlaku;
                        var is_masa_berlaku = await checkMasaBerlaku(moment(masa_berlaku).format('YYYY-MM-DD'));
                        console.log(is_masa_berlaku);
                        var jenis_kendaraan_id = await getJenisKendaraanId(data.jenis_kendaraan);
                        var sumbu_id = await getSumbuId(data.sumbu);
                        let kepemilikan_id = await getKepemilikanId(data.nama_pemilik);
                        let kepemilikan_val = await getKepemilikanVal(data.nama_pemilik);
                        var mst = 0;
                        var upsert_data = await upsert(data.rfid || '', data.vcode || '', data.no_registrasi_kendaraan, data.no_uji_kendaraan, data.nama_pemilik, data.alamat_pemilik, data.unit_pelaksana_teknis, moment(data.date).format('YYYY-MM-DD'), moment(data.masa_berlaku).format('YYYY-MM-DD'), data.jenis_kendaraan, data.sumbu, data.berat_kosong, data.jbb, data.jbkb, data.jbi, data.jbki, data.panjang_kendaraan, data.lebar_kendaraan, data.tinggi_kendaraan, data.julur_depan, data.julur_belakang, '', '', '', data.no_rangka, data.merk, data.bahan_bakar, data.daya_angkut_orang, data.daya_angkut_kg, data.kelas_jalan, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id, is_masa_berlaku, true, '', '', '', '', '', req.token.id, jenis_kendaraan_id, sumbu_id, data.id, data.no_srut, moment(data.tgl_srut).format('YYYY-MM-DD HH:mm:ss'), data.no_mesin, data.tipe, Number(data.tahun_rakit), data.isi_silinder, Number(data.daya_motor), data.ukuran_ban, data.keterangan_hasil_uji, data.petugas_penguji, data.nrp_petugas_penguji, data.kepala_dinas, data.pangkat_kepala_dinas, data.nip_kepala_dinas, data.unit_pelaksana_teknis, data.direktur, data.pangkat_direktur, data.nip_direktur, moment(data.etl_date).format('YYYY-MM-DD HH:mm:ss'), data.jarak_sumbu_1_2, data.jarak_sumbu_2_3, data.jarak_sumbu_3_4, data.dimensi_bak_tangki, mst, kepemilikan_id, kepemilikan_val);
                        res.send({
                            success: true,
                            message: 'Req. Data Uji Berkala Berhasil',
                            data: response
                        })
                    } else {
                        res.send({
                            success: false,
                            message: 'Req. Data Not Found'
                        })
                    }
                }
            } else {
                res.send({
                    success: false,
                    message: 'KEY Tidak Boleh Kosong'
                })
            }

        } catch (err) {
            console.log(err)
        }
    }


    return {
        findUjiberkala,
        findQrScan
    };
}
module.exports = IntegrasiController;