const { t_distribusi_aduan } = require('../models');
const { Op } = require('sequelize');
const messageService =  require('../services/message.service');
const {
    syncGet
} = require('./lib/sinkronisasi');
const { insert_distribusi_tembusan } = require('./lib/pengaduan');
const moment = require('moment');

const DistribusiAduanController = () => {

    const update = async (req, res, next) => {  
        console.log("--------------------::Processing Update::--------------------");
        
        try {
            const id = req.params.id;
    
            if (id) {
                var direktorat = req.body.tembusan;
                var arrdirektorat = direktorat ? direktorat.split(',') : '';
                
                t_distribusi_aduan.update(
                    {
                        kode: req.body.kode,
                        nama: req.body.nama,
                        deskripsi: req.body.deskripsi,
                        tgl_distribusi: moment(req.body.tgl_distribusi).format('YYYY-MM-DD HH:mm:ss') || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                        prioritas_aduan_id: req.body.prioritas_aduan_id,
                        direktorat_id: req.body.direktorat_id,
                        is_active: req.body.iact ? req.body.iact : true,
                        is_bptd: req.body.is_bptd ? req.body.is_bptd : false,
                        is_kemenhub: req.body.is_kemenhub ? req.body.is_kemenhub : true,
                        updated_by: req.token.id,
                        updated_at: moment().format('YYYY-MM-DD HH:mm:ss')  
                    },
                    {
                        where: { id: id }
                    }
                ).then(async (num) => {
                    if (num == 1) {
                        var insertdistribusitembusan = await insert_distribusi_tembusan(id, arrdirektorat, moment().format('YYYY-MM-DD HH:mm:ss'), req.token.id);
                        console.log('UPSERT DISTRIBUSI TEMBUSAN : ', insertdistribusitembusan);

                        res.send({
                            success: true,
                            message: messageService().UPDATE_SUCCESS
                        });
                    } else {
                        res.status(204).send({
                            success: false,
                            message: messageService().UPDATE_FAILED
                        });
                    }
                }).catch(err => {
                    res.send({
                        success: false,
                        message: `${messageService().UPDATE_FAILED}. ${err}`
                    });
                }); 
            } else {
                res.send({
                    success: false,
                    message: `${messageService().UPDATE_FAILED} | ID Kosong`
                });
            };
        } catch (error) {
            next(error)
        }
    }

    const updateStatusDistribusi = async (req, res, next) => {
        console.log("--------------------::Processing Update Status Pengaduan::--------------------");
    
        try {

            if (req.body.status) {
                var q = req.query.arrId;
                var resSplit = q.split(",").map(i=>Number(i));
                t_distribusi_aduan.update(
                    {
                        status_id: req.body.status,
                        updated_by: req.token.id,
                        updated_at: moment().format('YYYY-MM-DD HH:mm:ss') 
                    },
                    {
                        where: {id:{ [Op.any]: `{${resSplit}}` }},
                        logging: false
                    }
                ).then(num => {
                    if (num == resSplit.length) {
                        res.send({
                            success: true,
                            message: messageService().UPDATE_STATUS_SUCCESS
                        });
                    } else {
                        res.status(204).send({
                            success: false,
                            message: messageService().UPDATE_STATUS_FAILED
                        });
                    }
                }).catch(err => {
                    res.send({
                        success: false,
                        message: `${messageService().UPDATE_STATUS_FAILED}. ${err}`
                    });
                });  
            } else {
                res.send({
                    success: false,
                    message: 'Status Tidak Boleh Kosong',
                });
            }
        } catch (error) {
            next(error)
        }
    }
    
    
    return {
        update,
        updateStatusDistribusi,
    };
}
module.exports = DistribusiAduanController;