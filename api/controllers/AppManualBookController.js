const { t_app_manual_book, sequelize } = require('../models');
const { Op, QueryTypes } = require('sequelize');
const config = require('../../config/config');
const fs = require('fs');
const path = require("path");
const messageService =  require('../services/message.service');
const moment = require('moment');

const AppVersiController = () => {

    const countAll = async () => {
        return t_app_manual_book.count({
            where:{
                is_deleted: false
            }
        });
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const name = req.query.search;
            const conditions = {is_deleted: false}
            const count = await countAll();

            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
                //conditions = {is_deleted: false, nama : {[Op.iLike]: `%${name}%`}}
            }

            const options = {
                page: req.query.page || 1,
                paginate: req.query.paginate || count,
                order: [
                    [ 
                        req.query.orderBy || 'created_at', 
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: false
            }
    
            const {docs, pages, total} = await t_app_manual_book.paginate(options)
    
            res.status(200).json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: docs,
                meta: {
                    pages: pages,
                    paginate: options.paginate,
                    total: total
                }        
            });
    
        } catch (error) {
            next(error)
        }
    }

    const findOne = async (req, res, next) => {
        console.log("--------------------::Processing Find One::--------------------");
        try{
            const id = req.params.id;
            t_app_manual_book.findByPk(id, {
                where: {
                    is_deleted: false
                },
                logging: false
            }).then(data => {
                res.status(200).json({
                    success: true,
                    message: `${messageService().GET_SUCCESS}`,
                    data: data
                });
            }).catch(err => {
                res.status(500).send({
                    success: false,
                    message: `${messageService().GET_FAILED}`
                });
            });
        }catch (error){
            next(error)
        }
    }

    const findAllActive = async (req, res, next) => {
        console.log("--------------------::Processing Find All Is Active::--------------------");
        try{
            const name = req.query.search;
            const conditions = {is_active: true, is_deleted: false}
            const count = await countAll();
            if (name) {
                conditions['nama'] = { [Op.iLike]: `%${name}%` }
            }
            
            const options = {
                page: req.query.page || 1,
                paginate: req.query.paginate || count,
                order: [
                    [ 
                        req.query.orderBy || 'created_at', 
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: false,
            }
    
            const {docs, pages, total} = await t_app_manual_book.paginate(options)
            // const propinsi = await t_app_manual_book.findAll({
            //     where: {
            //         is_active: true
            //     }
            // });
    
            res.status(200).json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: docs,
                meta: {
                    pages: pages,
                    paginate: options.paginate,
                    total: total
                }        
            });
        }catch (error){
            next(error)
        }
    }

    const uploadPathManual = (file_name) => {
        const uploadPath = path.join(config.path_manual) + '/' + file_name;
    
        return uploadPath;
    }

    const pdfUrlPanduan = (file_name) => {
        const imageUrl = `${config.panduan_url}${file_name}`;
    
        return imageUrl;
    }

    const uploadFile = async(nama, versi, req) => {
        if (req) {
            console.log('FILE IMAGE : ',req.name);
            let fileImg = req.name;
            if (req.size > 20 * 1024 * 1024) {
                console.log(`Size File Max. 20 Mb. File ${req.name} Melebihi Ukuran`);
                return {
                    success: false,
                    message: `Ukuran file melebihi 20MB.`,
                };
            }
    
            const extensionName = path.extname(req.name); // fetch the file extension
            const allowedExtension = ['.pdf'];
    
            if (!allowedExtension.includes(extensionName)) {
                return res.status(422).send({
                    success: false,
                    message: "Format File Yang Di Izinkan [*.pdf]",
                });
            } 
    
            
            var filename = nama + '_' + moment().format('YYYY_MM_DD_HH_mm_ss') + '_' + moment().valueOf() + '_' + versi + '.pdf';
    
            const uploadPath = uploadPathManual(filename); ////config.path_upload+'/'+file_name;
            const fileUrl = pdfUrlPanduan(filename); //`${config.image_url}penimbangan/${file_name}`;
            // fileImg.mv(uploadPath);
            var dataUpload = {
                pdfPath: uploadPath || '',
                pdfName: filename || '',
                pdfUrl: fileUrl || ''
            }
    
            req.mv(uploadPath, function(err) {
                if (err)
                    console.log(err);
                    return err;
    
            });
            return dataUpload;
        } else {
            var dataUpload = {
                pdfPath: '',
                pdfName: '',
                pdfUrl: ''
            }
            // console.log('DATA UPLOAD : ', dataUpload);
            return dataUpload;
        }
    }

    async function getFileManual(id) {
        var sql = `SELECT * FROM app_manual_book WHERE id = '${id}'`;
        console.log(sql);
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {
            const manual = uploadPathManual(result[0].filename_manual);// config.path_upload + '/penimbangan/' + result[0].foto_depan;
            
            return `${manual}`;
        } else {
            return 0;
        }
    }
    async function removeFileExist(id) {
        //if (img_path != null) {
        var rowPdf = await getFileManual(id);

        if (rowPdf != 0) {
            console.log('ROW PDF : ', rowPdf);
            if (fs.existsSync(`${rowPdf}`)) {
                fs.unlink(`${rowPdf}`, function (err) {
                    if (err) return console.log(err);
                    console.log('file deleted ' + rowPdf + ' successfully');
                });
            }
        }

    }

    const create = async (req, res, next) => {  
        console.log("--------------------::Processing Create::--------------------");
        
        try {
            let uploads = [];
            var dataFile = {
                filename_manual: '',
                path_manual: '',
                url_manual: ''
            }

            if (req.files) {
                // console.log('FOTO DEPAN : ', req.files.fotoDepan);
                var uploadFilePdf = await uploadFile(req.body.kode, req.body.versi_manual, req.files.fileManual);

                dataFile = {
                    filename_manual: uploadFilePdf.pdfName || '',
                    path_manual: uploadFilePdf.pdfPath || '',
                    url_manual: uploadFilePdf.pdfUrl || '',
                }

                console.log('DATA FOTO : ', dataFile);
            }

            const field = {
                kode: req.body.kode,
                nama: req.body.nama,
                versi_manual: req.body.versi_manual,
                ...dataFile,          
                is_active: req.body.iact ? req.body.iact : false,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss') 
            };
            
            t_app_manual_book.create(field,{
                logging: false
            }).then(data => {
                res.status(200).send({
                    success: true,
                    message: messageService().CREATE_SUCCESS,
                    data: [{
                        last_insert_id : data.id,
                        fields: field
                    }]
                });
            }).catch(err => {
                console.log(err)
                res.status(500).send({
                    success: false,
                    message: messageService().CREATE_FAILED
                });
            });

        } catch (error) {
            next(error)
        }
    }    

    const update = async (req, res, next) => {      
        console.log("--------------------::Processing Update::--------------------");
    
        try {
            const id = req.params.id;
    
            var dataFile = {
                filename_manual: '',
                path_manual: '',
                url_manual: ''
            }

            if (req.files) {
                // console.log('FOTO DEPAN : ', req.files.fotoDepan);
                var uploadFilePdf = await uploadFile(req.body.kode, req.body.versi_manual, req.files.fileManual);

                dataFile = {
                    filename_manual: uploadFilePdf.pdfName || '',
                    path_manual: uploadFilePdf.pdfPath || '',
                    url_manual: uploadFilePdf.pdfUrl || '',
                }
                await removeFileExist(id);
                console.log('DATA FOTO : ', dataFile);
            }
        
            t_app_manual_book.update(
                {
                    kode: req.body.kode,
                    nama: req.body.nama,
                    versi_manual: req.body.versi_manual,
                    ...dataFile,
                    is_active: req.body.iact ? req.body.iact : false,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss') 
                },
                {
                    where: { id: id }
                }
            ).then(num => {
                if (num == 1) {
                    res.status(200).send({
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
                res.status(500).send({
                    success: false,
                    message: `${messageService().UPDATE_FAILED}. ${err}`
                });
            });         
        } catch (error) {
            next(error)
        }
    }

    const updateStatus = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");
    
        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i=>Number(i));

            t_app_manual_book.update(
                {
                    is_active: req.body.iact ? req.body.iact : false,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss')  
                },
                {
                    where: {id:{ [Op.any]: `{${resSplit}}` }},
                    logging: false
                }
            ).then(num => {
                if (num == resSplit.length) {
                    res.status(200).send({
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
                res.status(500).send({
                    success: false,
                    message: `${messageService().UPDATE_STATUS_FAILED}. ${err}`
                });
            });         
        } catch (error) {
            next(error)
        }
    }

    const removeSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete Soft::--------------------");
        //console.log(req.token.id);
        
        const id = req.params.id;
        try {
            t_app_manual_book.update(
                {
                    is_deleted: true,
                    deleted_by: req.token.id,
                    deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: {id: id},
                    logging: false
                }
            ).then(num => {
                if (num == 1) {
                    res.status(200).send({
                        success: true,
                        message: messageService().REMOVE_SUCCESS
                    });
                } else {
                    res.status(204).send({
                        success: false,
                        message: messageService().REMOVE_FAILED
                    });
                }
            }).catch(err => {
                res.status(500).send({
                    success: false,
                    message: `${messageService().REMOVE_FAILED}. ${err}`
                });
            });         
        } catch (error) {
            next(error)
        }
    
    }  

    const remove = async (req, res, next) => {
        console.log("--------------------::Processing Delete::--------------------");
    
        const id = req.params.id;
        try {
            t_app_manual_book.destroy({
                where: { id: id }
            }).then(num => {
                if(num == 1){
                    res.json({ 
                        success: true,
                        message: messageService().REMOVE_SUCCESS
                    });
                }else{
                    res.json({ 
                        success: false,
                        message: messageService().REMOVE_FAILED
                    });          
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: `${messageService().REMOVE_FAILED}. ${err}`
                });
            });        
        } catch (error) {
            next(error)
        }
    }  

    const removeArrSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete All Soft::--------------------");
        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i=>Number(i));

            t_app_manual_book.update(
                {
                    is_deleted: true,
                    deleted_by: req.token.id,
                    deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: {id:{ [Op.any]: `{${resSplit}}` }},
                    logging: false
                }
            ).then(num => {
                if (num == resSplit.length) {
                    res.status(200).send({
                        success: true,
                        message: messageService().REMOVE_SUCCESS
                    });
                } else {
                    res.status(204).send({
                        success: false,
                        message: messageService().REMOVE_FAILED
                    });
                }
            }).catch(err => {
                res.status(500).send({
                    success: false,
                    message: `${messageService().REMOVE_FAILED}. ${err}`
                });
            });         
        } catch (error) {
            next(error)
        }
        
    }

    const removeArr = async (req, res, next) => {
        console.log("--------------------::Processing Delete All::--------------------");
        var q = req.query.arrId;
        var resSplit = q.split(",").map(i=>Number(i));
        try {
            t_app_manual_book.destroy({
                where: {id:{ [Op.in]: resSplit }}
            }).then(num => {
                if(num == resSplit.length){
                    //if(i == resSplit.length){
                    
                        res.json({ 
                            success: true,
                            message: messageService().REMOVE_SUCCESS
                        });
                    
                        //}   
                }else{
                    res.json({ 
                        success: false,
                        message: messageService().REMOVE_FAILED
                    });          
                }
            }).catch(err => {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: `${messageService().REMOVE_FAILED}. ${err}`
                });
            }); 
                   
        } catch (error) {
            next(error)
        }
        
    } 

    const truncate = async (req, res, next) => {
        console.log("--------------------::Processing Truncate Reset Identity::--------------------");
        try {
            t_app_manual_book.destroy(
                { truncate: true, restartIdentity: true, cascade: true }
            );

            res.json({ 
                success: true,
                message: messageService().TRUNCATE_SUCCESS
            });            
        } catch (error) {
            next(error)
        }
        
    }    
    
    
    return {
        findAll,
        findOne,
        findAllActive,
        create,
        update,
        updateStatus,
        removeSoft,
        remove,
        removeArrSoft,
        removeArr,
        truncate,
    };
}
module.exports = AppVersiController;