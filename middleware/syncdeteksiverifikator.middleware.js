const { sequelize } = require('../api/models');
const { Op } = require('sequelize');
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const axios = require('axios');
const { ConfigObject } = require('svg-captcha-express');
var client = require('redis').createClient();
const { urlSinkronisasiJto } = require('../api/controllers/lib/urlsinkron');
const { syncMidlewareToPostServer } = require('../api/controllers/lib/sinkronisasi');
const { padLeft, kelebihanBerat, prosenKelebihanBerat } = require('../api/lib/utilities');

const syncloginPusat = async () => {
  var data = JSON.stringify({
    "email": "akmal@dephub.go.id",
    "password": "hubdat1234"
  });
  var URL_SINK = await urlSinkronisasiJto();
  console.log('URL_SINK : ', URL_SINK);

  var config = {
    method: 'post',
    url: URL_SINK != 0 ? `${URL_SINK}/v2pb/login/` : `${process.env.APP_API_JTO_KEMENHUB}/v2pb/login/`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: data
  };

  try {
    const result = await axios(config);
    console.log(JSON.stringify(result.data));
    client.del("session");
    client.hmset("session", {
      'token_type': 'Bearer',
      'expires_in': result.data.expired,
      'access_token': result.data.accessToken,
      'refresh_token': result.data.refreshToken,
      'token': `Bearer ${result.data.accessToken}`
    });
  } catch (error) {
    console.log(error);
  }
};

const getDeteksi = async () => {
  console.log('---------------------------------SINK DETEKSI VERIFIKATOR----------------------------------');
  try {
    var bulan = moment().format('MM');
    var tahun = moment().format('YYYY');
    var tgl = moment().format('YYYY-MM-DD');
    var sql = `SELECT COUNT(*) as jml_deteksi FROM jt_vr_data WHERE is_active = true AND is_verifikasi = false AND is_plat = false AND DATE(tgl_capture) = '${tgl}'`;

    console.log(sql);
    const result = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
      logging: false
    });

    const field = {
      tgl_deteksi: tgl,
      lokasi_id: 137,
      jml_deteksi: Number(result[0].jml_deteksi),
    };
    console.log('Data Deteksi : ', field);

    try {
      const resp = await syncMidlewareToPostServer('post', 'v2pv/vrpelanggaran/deteksi', field);
      console.log(resp.data);
      if (resp.data.success) {
        console.log('SINKRONISASI DATA BERHASIL');
      } else {
        console.log('SINKRONISASI DATA GAGAL. ' + resp.data.message);
      }
    } catch (error) {
      console.log(error);
      console.log('SINKRONISASI DATA GAGAL. ' + error);
    }
  } catch (error) {
    console.log(error);
  }
};

const interval = setInterval(() => {
  getDeteksi();
}, 600000); // Menjalankan fungsi getDeteksi() setiap 10 menit

switch (Number(process.argv.slice(2)[0])) {
  case 1: //npm run syncetilang 1 49 BLG
    syncloginPusat();
    break;
  default:
    getDeteksi();
    break;
}

console.log('process.argv', Number(process.argv.slice(2)[0]), Number(process.argv.slice(2)[1]));