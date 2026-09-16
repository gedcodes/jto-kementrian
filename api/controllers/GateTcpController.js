const { t_timbangan } = require('../models');
const { Op } = require('sequelize');
const messageService = require('../services/message.service');
var tcp = require('../tcpclient');
const moment = require('moment');
const Net = require('net');
const timer = ms => new Promise(res => setTimeout(res, ms));

const GateTcpController = () => {

    function stringToHex(str) {

        //converting string into buffer
        let bufStr = Buffer.from(str, 'utf8');

        //with buffer, you can convert it into hex with following code
        return bufStr.toString('hex');

    }

    function ascii_to_hexa(str) {
        var arr1 = [];
        for (var n = 0, l = str.length; n < l; n++) {
            var hex = Number(str.charCodeAt(n)).toString(16);
            arr1.push(hex);
        }
        return arr1.join('');
    }

    function hexToSignedInt(hex) {
        if (hex.length % 2 != 0) {
            hex = "0" + hex;
        }
        var num = parseInt(hex, 16);
        var maxVal = Math.pow(2, hex.length / 2 * 8);
        if (num > maxVal / 2 - 1) {
            num = num - maxVal
        }
        return num;
    }

    function hexToUnsignedInt(hex) {
        return parseInt(hex, 16);
    }

    // Convert a hex string to a byte array
    function hexToBytes(hex) {
        for (var bytes = [], c = 0; c < hex.length; c += 2)
            bytes.push(parseInt(hex.substr(c, 2), 16));
        return bytes;
    }

    function toHexString(byteArray) {
        var s = '0x';
        byteArray.forEach(function (byte) {
            s += ('0' + (byte & 0xFF).toString(16)).slice(-2);
        });
        return s;
    }

    // Convert a byte array to a hex string
    function bytesToHex(bytes) {
        for (var hex = [], i = 0; i < bytes.length; i++) {
            var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
            hex.push((current >>> 4).toString(16));
            hex.push((current & 0xF).toString(16));
        }
        return hex.join("");
    }

    function ltrim(char, str) {
        if (str.slice(0, char.length) === char) {
            return ltrim(char, str.slice(char.length));
        } else {
            return str;
        }
    }

    function rtrim(char, str) {
        if (str.slice(str.length - char.length) === char) {
            return rtrim(char, str.slice(0, 0 - char.length));
        } else {
            return str;
        }
    }

    const openCloseGate = async (req, res, next) => {
        console.log('**********************************Gate Control******************************');
        // try {
        //01 05 00 00 FF 00 8C 3A = Open Gate Address 1 Via Terminal Server
        //01 05 00 01 FF 00 DD FA = Close Gate Address 1 Via Terminal Server
        var is_gate = req.body.is_gate;
        var gate = req.body.gate;
        var kode_uppkb = req.body.kode_uppkb;
        var timbangan_id = req.body.timbangan_id;

        const data_timbangan = await t_timbangan.findOne({
            where: {
                kode_uppkb: kode_uppkb,
                id: timbangan_id
            },
            logging: false
        });

        if (data_timbangan != null) {

            if (gate == 0) {
                console.log('pintu antrian');
                var gate_name = 'Pintu Antrian';
                var ip_address = data_timbangan.ip_pintu_antrian ? data_timbangan.ip_pintu_antrian : '';
                var port = data_timbangan.port_pintu_antrian;
                var addr = data_timbangan.addr_ibg_antrian;
            }

            if (gate == 1) {
                console.log('pintu penimbangan');
                var gate_name = 'Pintu Penimbangan';
                var ip_address = data_timbangan.ip_pintu_antrian ? data_timbangan.ip_pintu_penimbangan : '';
                var port = data_timbangan.port_pintu_penimbangan;
                var addr = data_timbangan.addr_ibg_penimbangan;
            }

            if (ip_address != '') {
                var msg = `*${addr},001,${is_gate}#`;
                console.log(msg);
                if (msg != '') {
                    const data = msg.toString();// Buffer.from(msg.split(' ').map(x => parseInt(x, 16))); // via ibg (interface barrier gate)
                    // const data = Buffer.from(msg.split(' ').map(x => parseInt(x, 16))); // via terminal server
                    // console.log(Buffer.from(data).toString('hex'));
                    if (!!ip_address || !!port || !!addr) {
                        await tcp.tcpClient(Number(port), ip_address.toString(), data).then((row) => {
                            console.log('RESPONSE : ', row);
                            var data_resp = row.replace(/\s/g, '');
                            var resp_length = data_resp.length;
                            var firstChar = row.charAt(0);
                            var lastChar = row.charAt(resp_length - 1);//, resp_length);

                            console.log('LENGTH : ', resp_length, ' FIRST CHAR : ', firstChar, ' LAST CHAR : ', lastChar);
                            if (firstChar == "*" && lastChar == "#") {
                                var removeFirstChar = ltrim("*", data_resp);
                                var result = row.substring(1, data_resp.length - 1);
                                var data_fs = rtrim("#", removeFirstChar);
                                console.log(result);
                                var data_rsp = result.split(",");

                                var message = "";
                                if (is_gate == 0) {
                                    message = 'Tutup Pintu Berhasil';
                                } else if (is_gate == 1) {
                                    message = 'Buka Pintu Berhasil';
                                } else if (is_gate == 2) {
                                    message = 'Baca Status Pintu Berhasil';
                                } else {
                                    message = 'No Response';
                                }
                                //00202,001,89
                                const status_open = parseInt(process.env.STATUS_GATE_OPEN_SW); // nilai untuk status OPEN
                                const status_close = parseInt(process.env.STATUS_GATE_CLOSE_SW); // nilai untuk status CLOSE

                                // Tentukan pola berdasarkan env
                                // Jika STATUS_GATE_OPEN_SW < STATUS_GATE_CLOSE_SW, berarti: 
                                // - OPEN = nilai rendah
                                // - CLOSE = nilai tinggi
                                // Jika STATUS_GATE_OPEN_SW > STATUS_GATE_CLOSE_SW, berarti:
                                // - OPEN = nilai tinggi  
                                // - CLOSE = nilai rendah

                                const threshold = (status_open + status_close) / 2;

                                if (status_open < status_close) {
                                    // POLA 1: OPEN = rendah, CLOSE = tinggi (contoh: OPEN=0, CLOSE=45)
                                    if (data_rsp[2] <= threshold) {
                                        console.log('OPEN (nilai rendah)');
                                        res.send({
                                            "success": true,
                                            "data": 1,
                                            "message": message
                                        });
                                    } else {
                                        console.log('CLOSE (nilai tinggi)');
                                        res.send({
                                            "success": true,
                                            "data": 89,
                                            "message": message
                                        });
                                    }
                                } else {
                                    // POLA 2: OPEN = tinggi, CLOSE = rendah (contoh: OPEN=87, CLOSE=1)
                                    if (data_rsp[2] >= threshold) {
                                        console.log('OPEN (nilai tinggi)');
                                        res.send({
                                            "success": true,
                                            "data": 1,
                                            "message": message
                                        });
                                    } else {
                                        console.log('CLOSE (nilai rendah)');
                                        res.send({
                                            "success": true,
                                            "data": 89,
                                            "message": message
                                        });
                                    }
                                }

                            } else {
                                res.send({
                                    "success": false,
                                    "data": null,
                                    "message": `Error Respon Data`
                                });
                            }
                        }).catch(err => {
                            console.log(err);
                            res.send({
                                "success": false,
                                "data": null,
                                "message": `Koneksi Gagal`
                            });
                        });
                    }
                    // console.log('TCP : ',tcp);
                } else {
                    res.send({
                        "success": false,
                        "message": `Perintah Tidak Tersedia`
                    });
                }
            } else {
                res.send({
                    "success": false,
                    "message": `IP Palang Pintu Tidak Tersedia`
                });
            }
        } else {
            res.send({
                "success": false,
                "message": `Palang Pintu Tidak Tersedia`
            });
        }

    }

    return {
        openCloseGate,
    };
}
module.exports = GateTcpController;