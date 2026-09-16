const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

console.log(moment('2021-11-11').subtract(6, 'months').format('YYYY-MM-DD'));
/*
const url = 'https://ujiberkala.dephub.go.id/qr/vi/79C1B9D15090507861EC9A4CDF85358C';

axios(url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);

    const no_uji = $('#container > div > div.row > div > div > div.widget-content > div:nth-child(1) > div:nth-child(2) > div > table > tbody > tr:nth-child(1) > td:nth-child(3)');
    const no_reg_kend = $('#container > div > div.row > div > div > div.widget-content > div:nth-child(1) > div:nth-child(2) > div > table > tbody > tr:nth-child(4) > td:nth-child(3)');
    const masa_berlaku = $('#container > div > div.row > div > div > div.widget-content > div:nth-child(7) > div:nth-child(2) > div:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(3)');
    const foto_depan = $("#container > div > div.row > div > div > div.widget-content > div:nth-child(2) > div > table > tbody > tr > td:nth-child(1) > a > img");
    const foto_belakang = $("#container > div > div.row > div > div > div.widget-content > div:nth-child(2) > div > table > tbody > tr > td:nth-child(2) > a > img");
    const foto_kanan = $("#container > div > div.row > div > div > div.widget-content > div:nth-child(2) > div > table > tbody > tr > td:nth-child(3) > a > img");
    const foto_kiri = $("#container > div > div.row > div > div > div.widget-content > div:nth-child(2) > div > table > tbody > tr > td:nth-child(4) > a > img");
    console.log(no_uji.text().replace(': ',''), ' | ', no_reg_kend.text().replace(': ',''), ' | ', masa_berlaku.text().replace(': ',''), ' | ', '\n');
    console.log(foto_depan.attr('src').replace('data:image/jpeg;base64,',''), '\n');
    console.log(foto_belakang.attr('src').replace('data:image/jpeg;base64,',''), '\n');
    console.log(foto_kanan.attr('src').replace('data:image/jpeg;base64,',''), '\n');
    console.log(foto_kiri.attr('src').replace('data:image/jpeg;base64,',''), '\n');
    
    // console.log(html);
  })
  .catch(console.error);
  */