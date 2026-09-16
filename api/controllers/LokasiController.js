const { t_lokasi, t_kota_kab, t_provinsi, t_bptd, t_toleransi_uppkb, t_toleransi, t_petugas, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const {
    getLokasiUppkbKode
} = require('./lib/dataid');
const messageService = require('../services/message.service');
const moment = require('moment');
const { uploadImage, removeImage } = require('./lib/uppkb');

const LokasiController = () => {
    const countAll = async () => {		
		var sql = `SELECT COUNT(*) jml_data
			FROM
			  jt_lokasi_uppkb
			  INNER JOIN public.jt_kota_kab ON (jt_lokasi_uppkb.kota_kab_id = jt_kota_kab.id)
			  INNER JOIN public.jt_provinsi ON (jt_kota_kab.provinsi_id = jt_provinsi.id)
			  INNER JOIN public.jt_bptd ON (public.jt_provinsi.bptd_id = jt_bptd.id)
			WHERE jt_lokasi_uppkb.is_deleted = false AND jt_kota_kab.is_deleted = false AND jt_provinsi.is_deleted = false AND jt_bptd.is_deleted = false`;
					
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {
            return result[0].jml_data;
        } else {
            return 0;
        }
    }
	
	const countAllActive = async () => {
        var sql = `SELECT COUNT(*) jml_data
					FROM
					  jt_lokasi_uppkb
					  INNER JOIN public.jt_kota_kab ON (jt_lokasi_uppkb.kota_kab_id = jt_kota_kab.id)
					  INNER JOIN public.jt_provinsi ON (jt_kota_kab.provinsi_id = jt_provinsi.id)
					  INNER JOIN public.jt_bptd ON (public.jt_provinsi.bptd_id = jt_bptd.id)
					WHERE 
					jt_lokasi_uppkb.is_active = true AND jt_lokasi_uppkb.is_deleted = false 
					AND jt_kota_kab.is_active = true AND jt_kota_kab.is_deleted = false
					AND jt_provinsi.is_active = true AND jt_provinsi.is_deleted = false
					AND jt_bptd.is_active = true AND jt_bptd.is_deleted = false`;
					
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {
            return result[0].jml_data;
        } else {
            return 0;
        }
    }

    const findResumeAll = async(req, res, next) => {
        var sql = `SELECT (SELECT count(*) FROM jt_lokasi_uppkb WHERE is_active = true AND is_deleted = false) as jml_uppkb, (SELECT count(*) FROM jt_lokasi_uppkb WHERE is_operasi = true AND is_active = true AND is_deleted = false) as jml_operasi, (SELECT count(*) FROM jt_lokasi_uppkb WHERE is_operasi = false AND is_active = true AND is_deleted = false) as jml_tidak_operasi`;
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {
            res.json({
                success: true,
                message: messageService().GET_SUCCESS,
                data: result
            });
        } else {
            res.json({
                success: false,
                message: 'Query Error'
            });
        }
    }

    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const id = req.query.id;
            const kode_uppkb = req.query.kuppkb;
            const bptd_id = req.query.bptd;

            let conditions = { is_deleted: false }
            const count = await countAll();
            if (id) {
                conditions = { id: id, is_deleted: false };
            }

            if (kode_uppkb) {
                conditions = { kode: kode_uppkb, is_deleted: false };
            }

            if (bptd_id) {
                conditions = { bptd_id: bptd_id, is_deleted: false };
            }

            if (bptd_id && kode_uppkb) {
                conditions = { kode: kode_uppkb, bptd_id: bptd_id, is_deleted: false };
            }

            const options = {
                include: [
                    {
                        model: t_kota_kab,
                        required: true,
                        as: 'lkotakab',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_provinsi,
                                required: true,
                                as: 'provinsi',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                include: [
                                    {
                                        model: t_bptd,
                                        required: true,
                                        as: 'provbptd',
                                        attributes: [
                                            'id', 'kode', 'nama'
                                        ],
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        }
                                    }
                                ],
                            }
                        ],
                    },
                    {
                        model: t_bptd,
                        required: false,
                        as: 'lbptd',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_toleransi_uppkb,
                        required: false,
                        as: 'tolkoduppkb',
                        attributes: [
                            'id', 'lokasi_id', 'kode_uppkb', 'toleransi_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include:[
                            {
                                model: t_toleransi,
                                required: false,
                                as: 'toluppkb',
                                attributes: [
                                    'id', 'kode', 'nama', 'prosen_toleransi'
                                ],
                                where:{
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ],
                    },
                    {
                        model: t_petugas,
                        required: false,
                        as: 'petugasuppkb',
                        where: {
                            is_deleted: false,
                            is_active: true,
                            is_korsatpel: true,
                        }
                    }
                ],                
                page: req.query.page || 1,
                paginate: Number(req.query.paginate) || count,
                order: [
                    [
                        req.query.orderBy || 'created_at',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: false
            }

            const { docs, pages, total } = await t_lokasi.paginate(options)

            res.json({
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

    const findPagination = async (req, res, next) => {
        console.log("--------------------::Processing Find All::--------------------");
        try {
            const name = req.query.search;
            const is_active = req.query.iact;
            const lokasi_id = req.query.lokasi;
            const bptd_id = req.query.bptd;
            const status_operasi = req.query.status_operasi;
            var kode_uppkb = req.query.kuppkb;
            if (lokasi_id) {
                kode_uppkb = await getLokasiUppkbKode(lokasi_id);
            }

            let conditions = { is_deleted: false }
            let order = [
                [
                    req.query.orderBy || 'created_at',
                    req.query.sortedBy || 'DESC'
                ]
            ];
            const count = await countAll();
            if (name) {
                const nameCondition = { [Op.iLike]: `%${name}%` };
                conditions[Op.or] = [
                    { nama: nameCondition },
                    { kode: nameCondition }
                ];
            }

            if (is_active) {
                conditions['is_active'] = true
            }

            if (bptd_id) {
                conditions['bptd_id'] = bptd_id
            }

            if (kode_uppkb) {
                conditions['kode'] = kode_uppkb
            }

            if (status_operasi) {
                conditions['status_operasi'] = status_operasi
            }

            const options = {
                include: [
                    {
                        model: t_kota_kab,
                        required: true,
                        as: 'lkotakab',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_provinsi,
                                required: true,
                                as: 'provinsi',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                include: [
                                    {
                                        model: t_bptd,
                                        required: true,
                                        as: 'provbptd',
                                        attributes: [
                                            'id', 'kode', 'nama'
                                        ],
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        }
                                    }
                                ],
                            }
                        ],
                    },
                    {
                        model: t_bptd,
                        required: false,
                        as: 'lbptd',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_petugas,
                        required: false,
                        as: 'petugasuppkb',
                        where: {
                            is_deleted: false,
                            is_active: true,
                            is_korsatpel: true,
                        }
                    }
                ],                
                page: req.query.page || 1,
                paginate: Number(req.query.paginate) || count,
                order: order,
                where: conditions,
                logging: false
            }

            const { docs, pages, total } = await t_lokasi.paginate(options)

            res.json({
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
        try {
            const id = req.params.id;
            t_lokasi.findByPk(id, {
                where: { is_deleted: false },
                include: [
                    {
                        model: t_kota_kab,
                        required: true,
                        as: 'lkotakab',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_provinsi,
                                required: true,
                                as: 'provinsi',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                include: [
                                    {
                                        model: t_bptd,
                                        required: true,
                                        as: 'provbptd',
                                        attributes: [
                                            'id', 'kode', 'nama'
                                        ],
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        }
                                    }
                                ],
                            }
                        ],
                    },
                    {
                        model: t_toleransi_uppkb,
                        required: false,
                        as: 'tolkoduppkb',
                        attributes: [
                            'id', 'lokasi_id', 'kode_uppkb', 'toleransi_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include:[
                            {
                                model: t_toleransi,
                                required: false,
                                as: 'toluppkb',
                                attributes: [
                                    'id', 'kode', 'nama', 'prosen_toleransi'
                                ],
                                where:{
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ],
                    },
                    {
                        model: t_petugas,
                        required: false,
                        as: 'petugasuppkb',
                        where: {
                            is_deleted: false,
                            is_active: true,
                            is_korsatpel: true,
                        }
                    }
                ],
                logging: false
            }).then(data => {
                res.json({
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
        } catch (error) {
            next(error)
        }
    }

    const findAllActive = async (req, res, next) => {
        console.log("--------------------::Processing Find All Is Active::--------------------");
        try {
            const id = req.query.id;
            const bptd_id = req.query.bptd;
            const lokasi_id = req.query.lokasi;
            const status_operasi = req.query.status_operasi;
            const is_wim = req.query.is_wim;
            let conditions = { is_deleted: false, is_active: true };
            var kode_uppkb = req.query.kuppkb;
            if (lokasi_id) {
                kode_uppkb = await getLokasiUppkbKode(lokasi_id);
            }

            const count = await countAllActive();

            if (id) {
                conditions = { id: id, is_deleted: false };
            }

            if (kode_uppkb) {
                conditions = { kode: kode_uppkb, is_deleted: false, is_active: true };
            }

            if (bptd_id) {
                conditions = { bptd_id: bptd_id, is_deleted: false, is_active: true };
            }

            if (status_operasi) {
                conditions = { status_operasi: status_operasi, is_deleted: false, is_active: true };
            }

            if (bptd_id && kode_uppkb) {
                conditions = { kode: kode_uppkb, bptd_id: bptd_id, is_deleted: false, is_active: true };
            }

            if (bptd_id && status_operasi) {
                conditions = { status_operasi: status_operasi, bptd_id: bptd_id, is_deleted: false, is_active: true };
            }

            if (kode_uppkb && status_operasi) {
                conditions = { status_operasi: status_operasi, kode: kode_uppkb, is_deleted: false, is_active: true };
            }

            if (bptd_id && kode_uppkb && status_operasi) {
                conditions = { kode: kode_uppkb, bptd_id: bptd_id, status_operasi: status_operasi, is_deleted: false, is_active: true };
            }

            if (bptd_id && is_wim) {
                conditions = { is_wim: is_wim, bptd_id: bptd_id, is_deleted: false, is_active: true };
            }

            if (kode_uppkb && is_wim) {
                conditions = { is_wim: is_wim, kode: kode_uppkb, is_deleted: false, is_active: true };
            }

            if (bptd_id && kode_uppkb && is_wim) {
                conditions = { kode: kode_uppkb, bptd_id: bptd_id, is_wim: is_wim, is_deleted: false, is_active: true };
            }

            const options = {
                include: [
                    {
                        model: t_kota_kab,
                        required: true,
                        as: 'lkotakab',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_provinsi,
                                required: true,
                                as: 'provinsi',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                include: [
                                    {
                                        model: t_bptd,
                                        required: true,
                                        as: 'provbptd',
                                        attributes: [
                                            'id', 'kode', 'nama'
                                        ],
                                        where: {
                                            is_deleted: false,
                                            is_active: true
                                        }
                                    }
                                ],
                            }
                        ],
                    },
                    {
                        model: t_toleransi_uppkb,
                        required: false,
                        as: 'tolkoduppkb',
                        attributes: [
                            'id', 'lokasi_id', 'kode_uppkb', 'toleransi_id'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include:[
                            {
                                model: t_toleransi,
                                required: false,
                                as: 'toluppkb',
                                attributes: [
                                    'id', 'kode', 'nama', 'prosen_toleransi'
                                ],
                                where:{
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ],
                    },
                    {
                        model: t_petugas,
                        required: false,
                        as: 'petugasuppkb',
                        where: {
                            is_deleted: false,
                            is_active: true,
                            is_korsatpel: true,
                        }
                    }
                ],
                page: req.query.page || 1,
                paginate: Number(req.query.paginate) || count,
                order: [
                    [
                        req.query.orderBy || 'created_at',
                        req.query.sortedBy || 'DESC'
                    ]
                ],
                where: conditions,
                logging: false,
            }

            const { docs, pages, total } = await t_lokasi.paginate(options)
            // const propinsi = await t_kegiatan.findAll({
            //     where: {
            //         is_active: true
            //     }
            // });

            res.json({
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

    const gencode = async (id, kota_id, kode) => {
        var sql = `SELECT 
                        jt_bptd.kode as kode_bptd,
                        jt_provinsi.kode as kode_provinsi,
                        jt_kota_kab.kode as kode_kota_kab
                    FROM jt_kota_kab
                        INNER JOIN jt_provinsi ON (jt_kota_kab.provinsi_id = jt_provinsi.id)
                        INNER JOIN jt_bptd ON (jt_provinsi.bptd_id = jt_bptd.id)
                    WHERE
                        jt_kota_kab.id = ${kota_id}`;

        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            logging: false
        });

        if (result.length > 0) {
            var kode_uppkb = `${result[0].kode_bptd}.${result[0].kode_provinsi}.${result[0].kode_kota_kab}.${kode}`;
            var gen_kode = await update_gen_code(id, kode_uppkb);

            return gen_kode;
        } else {
            return 0;
        }
    }

    const update_gen_code = async (id, kode) => {
        let update_sql = `UPDATE jt_lokasi_uppkb SET gen_kode = '${kode}' WHERE id = ${id}`

        const res_update = await sequelize.query(update_sql, {
            logging: false
        })
        console.log(res_update[1].command)
        return res_update[1].command;
    }

    const create = async (req, res, next) => {
        console.log("--------------------::Processing Create::--------------------");
        try {
            let foto = {
                imgName: '',
                imgUrl: ''
            }
            if (req.files) {
                if(req.files.foto) {
                    const namaImage = 'foto'
                    const dataImage = await uploadImage(req.body.kode, req.body.nama, namaImage, req.files.foto)
                    if(!dataImage.status) {
                        return res.status(422).send({
                            success: false,
                            message: 'Bad Request',
                            errors: {
                                foto: [dataImage.message]
                            }
                        });
                    } else {
                        foto = {
                            imgName: dataImage.imgName,
                            imgUrl: dataImage.imgUrl
                        }
                    }
                }
            }
            const field = {
                bptd_id: req.body.bptd_id,
                kota_kab_id: req.body.kota_kab_id,
                kode: req.body.kode,
                nama: req.body.nama,
                alamat_uppkb: req.body.alamat_uppkb,
                lat_pos: req.body.lat_pos,
                lon_pos: req.body.lon_pos,
                tahun_diresmikan: req.body.tahun_diresmikan,
                luas_lahan: req.body.luas_lahan,
                kapasitas_timbangan: req.body.kapasitas_timbangan,
                jml_sdm: req.body.jml_sdm,
                jml_pns: req.body.jml_pns,
                jml_ppns: req.body.jml_ppns,
                jml_ppnpn: req.body.jml_ppnpn,
                tahun_jto: req.body.tahun_jto,
                status_operasi: req.body.status_operasi || 2,
                versi_lhr: req.body.versi_lhr,
                is_lhr: req.body.is_lhr,
                is_wim: req.body.is_wim,
                is_integrasi_etilang: req.body.is_integrasi_etilang,
                sk_tipe_lhr: req.body.sk_tipe_lhr,
                sk_jml_lhr: req.body.sk_jml_lhr,
                is_active: req.body.iact ? req.body.iact : false,
                sk_tipe_lhr: req.body.sk_tipe_lhr,
                sk_jml_lhr: req.body.sk_jml_lhr,
                versi_lhr: req.body.versi_lhr || '2',
                is_lhr: req.body.is_lhr ? req.body.is_lhr : false,
                is_wim: req.body.is_wim ? req.body.is_wim : false,
                is_integrasi_etilang: req.body.is_integrasi_etilang ? req.body.is_integrasi_etilang : false,
                created_by: req.token.id,
                created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                foto_name: foto.imgName,
                foto_url: foto.imgUrl,
                masa_berlaku_tera: req.body.masa_berlaku_tera ? moment(req.body.masa_berlaku_tera).format('YYYY-MM-DD') : null,
                no_cs: req.body.no_cs,
            }

            return sequelize.transaction().then(function (t) {
                return t_lokasi.create(field, { transaction: t }).then(async(data) => {
                    t.commit();
                    console.log(data);
                    
                    const update_gen_code = await gencode(data.id, req.body.kota_kab_id, req.body.kode);
                    if(update_gen_code == 'UPDATE'){
                        
                        res.send({
                            success: true,
                            message: messageService().CREATE_SUCCESS,
                            data: [{
                                last_insert_id : data.id,
                                fields: field
                            }]
                        });
                    }else{
                        t.rollback().catch(() => { });
                        res.send({
                            success: false,
                            message: messageService().CREATE_FAILED
                        });
                        
                    }
                    
                }).catch(function (err) {
                    t.rollback().catch(() => { });
                    next(err)
                });
            });
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    const update = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");

        try {
            const id = req.params.id;
            const editDataLokasi = await t_lokasi.findOne({
                where: {
                    id: id,
                    is_deleted: false
                },
                logging: false
            })
    
            let foto = {
                imgName: editDataLokasi.foto_name,
                imgUrl: editDataLokasi.foto_url
            }
    
            if (req.files) {
                if(req.files.foto) {
                    const namaImage = 'foto'
                    const dataImage = await uploadImage(req.body.kode, req.body.nama, namaImage, req.files.foto)
                    
                    if(!dataImage.status) {
                        return res.status(422).send({
                            success: false,
                            message: 'Bad Request',
                            errors: {
                                foto: [dataImage.message]
                            }
                        });
                    } else {
                        foto = {
                            imgName: dataImage.imgName,
                            imgUrl: dataImage.imgUrl
                        }
                        await removeImage(editDataLokasi.foto_name);
                    }
                }
            }
            console.log('finish')

            return sequelize.transaction().then(function (t) {
                return t_lokasi.update({
                    bptd_id: req.body.bptd_id,
                    kota_kab_id: req.body.kota_kab_id,
                    kode: req.body.kode,
                    nama: req.body.nama,
                    alamat_uppkb: req.body.alamat_uppkb,
                    lat_pos: req.body.lat_pos,
                    lon_pos: req.body.lon_pos,
                    tahun_diresmikan: req.body.tahun_diresmikan,
                    luas_lahan: req.body.luas_lahan,
                    kapasitas_timbangan: req.body.kapasitas_timbangan,
                    jml_sdm: req.body.jml_sdm,
                    jml_pns: req.body.jml_pns,
                    jml_ppns: req.body.jml_ppns,
                    jml_ppnpn: req.body.jml_ppnpn,
                    tahun_jto: req.body.tahun_jto,
                    status_operasi: req.body.status_operasi || 2,
                    versi_lhr: req.body.versi_lhr,
                    is_lhr: req.body.is_lhr,
                    is_wim: req.body.is_wim,
                    is_integrasi_etilang: req.body.is_integrasi_etilang,
                    sk_tipe_lhr: req.body.sk_tipe_lhr,
                    sk_jml_lhr: req.body.sk_jml_lhr,
                    is_active: req.body.iact ? req.body.iact : false,
                    sk_tipe_lhr: req.body.sk_tipe_lhr,
                    sk_jml_lhr: req.body.sk_jml_lhr,
                    versi_lhr: req.body.versi_lhr || '2',
                    is_lhr: req.body.is_lhr ? req.body.is_lhr : false,
                    is_wim: req.body.is_wim ? req.body.is_wim : false,
                    is_integrasi_etilang: req.body.is_integrasi_etilang ? req.body.is_integrasi_etilang : false,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                    foto_name: foto.imgName,
                    foto_url: foto.imgUrl,
                    masa_berlaku_tera: req.body.masa_berlaku_tera ? moment(req.body.masa_berlaku_tera).format('YYYY-MM-DD') : null,
                    no_cs: req.body.no_cs,
                }, { where: { id: id }, transaction: t }).then(async(num) => {
                    t.commit();
                    if (num == 1) {
                        const update_gen_code = await gencode(id, req.body.kota_kab_id, req.body.kode);
                        if(update_gen_code == 'UPDATE'){
                            res.send({
                                success: true,
                                message: messageService().UPDATE_SUCCESS
                            });
                        }else{
                            t.rollback().catch(() => { });
                            res.send({
                                success: false,
                                message: messageService().CREATE_FAILED
                            });
                        }
                    }
                }).catch(function (err) {
                    t.rollback().catch(() => { });
                    next(err)
                });
            });
        } catch (error) {
            next(error)
        }
    }

    const updatesync = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");
        const t = await sequelize.transaction();

        try {
            var sql = `UPDATE jt_lokasi_uppkb SET
                        id = ${req.body.id},
                        bptd_id = ${req.body.bptd_id},
                        kota_kab_id = ${req.body.kota_kab_id},
                        kode = '${req.body.kode}',
                        nama = '${req.body.nama}',
                        alamat_uppkb = '${req.body.alamat_uppkb}',
                        lat_pos = '${req.body.lat_pos}',
                        lon_pos = '${req.body.lon_pos}',
                        is_active = ${req.body.iact ? req.body.iact : false},
                        updated_at = '${moment().format('YYYY-MM-DD HH:mm:ss')}',
                        updated_by = ${req.token.id}
                      WHERE
                        id = ${req.params.id} AND kode = '${req.params.kode}'`;
            // console.log(sql);
            const res_update = await sequelize.query(sql, {
                logging: false
            }, { transaction: t })
    
            await t.commit();
            if (res_update[1].command == 'UPDATE') {
                //console.log('UPDATE : ',res_update[1].command);
                res.send({
                    success: true,
                    message: messageService().UPDATE_SUCCESS
                });
            } else {
                t.rollback().catch(() => { });
                res.send({
                    success: false,
                    message: messageService().UPDATE_FAILED
                });
            }
        } catch (error) {
            console.log(error);
            t.rollback().catch(() => { });
            next(err)
        }
    }

    const updateStatus = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");

        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i => Number(i));

            t_lokasi.update(
                {
                    is_active: req.body.iact ? req.body.iact : false,
                    updated_by: req.token.id,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: { id: { [Op.any]: `{${resSplit}}` } },
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
                res.status(500).send({
                    success: false,
                    message: `${messageService().UPDATE_STATUS_FAILED}. ${err}`
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
            t_lokasi.destroy({
                where: { id: id }
            }).then(num => {
                if (num == 1) {
                    res.json({
                        success: true,
                        message: messageService().REMOVE_SUCCESS
                    });
                } else {
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
    const removeArr = async (req, res, next) => {
        console.log("--------------------::Processing Delete All::--------------------");
        var q = req.query.arrId;
        var resSplit = q.split(",").map(i => Number(i));
        try {
            t_lokasi.destroy({
                where: { id: { [Op.in]: resSplit } }
            }).then(num => {
                if (num == resSplit.length) {
                    //if(i == resSplit.length){

                    res.json({
                        success: true,
                        message: messageService().REMOVE_SUCCESS
                    });

                    //}   
                } else {
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

    const removeSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete Soft::--------------------");

        const id = req.params.id;
        try {
            t_lokasi.update(
                {
                    is_deleted: true,
                    deleted_by: req.token.id,
                    deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: { id: id },
                    logging: false
                }
            ).then(num => {
                if (num == 1) {
                    res.send({
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

    const removeArrSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete All Soft::--------------------");
        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i => Number(i));

            t_lokasi.update(
                {
                    is_deleted: true,
                    deleted_by: req.token.id,
                    deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: { id: { [Op.any]: `{${resSplit}}` } },
                    logging: false
                }
            ).then(num => {
                if (num == resSplit.length) {
                    res.send({
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

    const truncate = async (req, res, next) => {
        console.log("--------------------::Processing Truncate Reset Identity::--------------------");
        try {
            t_lokasi.destroy(
                { truncate: true, restartIdentity: true, cascade: true }
            );

            res.json({
                success: true,
                message: messageService().TRUNCATE_SUCCESS
            });
            // .then(num => {
            //     res.json({ 
            //         success: true,
            //         message: messageService().REMOVE_SUCCESS
            //     });

            // }).catch(err => {
            //     console.log(err);
            //     res.status(500).json({
            //         success: false,
            //         message: `${messageService().REMOVE_FAILED}. ${err}`
            //     });
            // }); 

        } catch (error) {
            next(error)
        }

    }


    return {
        findResumeAll,
        findAll,
        findPagination,
        findOne,
        findAllActive,
        create,
        update,
        updatesync,
        updateStatus,
        remove,
        removeArr,
        truncate,
        removeSoft,
        removeArrSoft,
    };
}
module.exports = LokasiController;