const { sequelize } = require('../api/models');
const { QueryTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const mqtt = require("mqtt");
const config = require("../config/config");
const client = mqtt.connect(`mqtt://${process.env.MQTT_BROKER_URL}:${process.env.MQTT_BROKER_PORT}`);
const moment = require('moment');

const topic = 'uppkb/#';
console.log(`Listening MQTT Client: ${config.mqtt_broker_url}:${config.mqtt_broker_port}`)
client.on('connect', () => {
    console.log('Connected')
    client.subscribe('uppkb/#', () => {
        console.log(`Subscribe to topic '${topic}'`)
    })
});

client.on('message', async (topic, payload) => {
    if (topic == 'uppkb/perangkat/dimensi/status') {
        // console.log('Received Message:', topic, payload.toString());
        const data = JSON.parse(payload.toString());
        // console.log(data.waktu);
        const insert = await insert_status_device_dimensi(data.waktu, data.sensor_depan, data.sensor_belakang, data.sensor_roda);
        if (insert == 1) {
            console.log('INSERT BERHASIL');
        } else {
            console.log('INSERT GAGAL');
        }
    } else if (topic == 'uppkb/perangkat/lhr/status') {
        console.log('Received Message:', topic, payload.toString());
    } else {
        console.log('Topic Undefined');
    }
})

const insert_status_device_dimensi = async (waktu, sensor_depan, sensor_belakang, sensor_roda) => {
    const t = await sequelize.transaction();

    try {
        // if (sensor_depan && sensor_belakang && sensor_roda) {
        var uppkb = await getUppkb();
        var uppkb_id = uppkb.id;
        var kode_uppkb = uppkb.kode;
        var kode = `${kode_uppkb}_${Math.random().toString(16).slice(3)}`;
        var created_at = moment().format('YYYY-MM-DD HH:mm:ss');

        var sql = `INSERT INTO jt_status_dimensi
                        (id, uppkb_id, kode_uppkb, kode, waktu, sensor_depan, sensor_belakang, sensor_roda, created_at)
                    VALUES
                        ('${uuidv4()}', ${uppkb_id}, '${kode_uppkb}', '${kode}', '${waktu}', ${sensor_depan}, ${sensor_belakang}, ${sensor_roda}, '${created_at}')`;
        // console.log(sql);
        const res_insert = await sequelize.query(sql, {
            logging: false
        }, { transaction: t })

        await t.commit();
        if (Object.keys(res_insert).length > 0) {
            return 1;
        } else {
            return 0;
        }
        // return res_insert;
        // } else {
        //     return 0;
        // }

    } catch (error) {
        console.log(error);
        await t.rollback();
    }
}

const getUppkb = async () => {
    try {
        var quppkb = `SELECT * FROM jt_lokasi_uppkb WHERE is_active = true AND is_deleted = false`;
        const result = await sequelize.query(quppkb, {
            type: QueryTypes.SELECT,
            logging: false
        });

        var length = result.length
        console.log('Length: ', length);

        if (result.length > 0) {
            return result[0];
        }
    } catch (error) {
        console.log(`ERROR : `, error);
    }

}