const moment = require('moment');
const bcrypt = require('bcrypt');
const { Users, t_petugas, t_regu, t_shift, t_lokasi, t_kota_kab, t_provinsi, t_bptd, roles } = require('../models');
const {
    getLokasiUppkbKode
} = require('./lib/dataid');
const { getPrivilege } = require('./lib/role')
const { Op } = require('sequelize');
var nodemailer = require('nodemailer');
const authService = require('../services/auth.service');
const bcryptService = require('../services/bcrypt.service');
const { requiredFieldMessage } = require('graphql/validation/rules/ValuesOfCorrectType');
const jwt = require('jsonwebtoken');
const redis = require('redis');
const config = require('../../config/config');
const path = require("path");
const excel = require('exceljs');
const {
    syncToPostServer,
    updateIdStatusSyncToPusat,
} = require('./lib/sinkronisasi');
const messageService = require('../services/message.service');
const crypto = require('crypto');
const client = redis.createClient();

const UsersController = () => {
    const countAll = async () => {
        return Users.count();
    }
    const findAll = async (req, res) => {
        console.log("--------------------------- Processing Get All ---------------------------");
        try {
            const id = req.query.lid;
            const bptd_id = req.query.bptd;
            const role_id = req.query.role;
            let conditions = { is_deleted: false }

            const count = await countAll();

            if (id) {
                conditions = { lokasi_id: id, is_deleted: false, hidden_akun: false };
            }

            if (bptd_id) {
                conditions = {
                    bptd_id: bptd_id,
                    is_deleted: false,
                    hidden_akun: false
                }
            }

            if (role_id) {
                conditions = {
                    role_id: role_id,
                    is_deleted: false,
                    hidden_akun: false
                }
            }

            if (bptd_id && role_id) {
                conditions = {
                    bptd_id: bptd_id,
                    role_id: role_id,
                    is_deleted: false,
                    hidden_akun: false
                }
            }

            // console.log(conditions);

            const options = {
                attributes: ['id', 'nama_lengkap', 'kontak_person', 'username', 'email', 'petugas_id', 'lokasi_id', 'role_id', 'last_login', 'register_date', 'created_at', 'updated_at', 'deleted_at', 'is_deleted', 'is_active'],
                include: [
                    {
                        model: t_petugas,
                        required: false,
                        as: 'userpetugas',
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_regu,
                                required: false,
                                as: 'petugasregu',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                // include: [
                                //     {
                                //         model: t_shift,
                                //         required: true,
                                //         as: 'regushift',
                                //         attributes: [
                                //             'id', 'kode', 'nama'
                                //         ],
                                //         where: {
                                //             is_deleted: false,
                                //             is_active: true
                                //         }
                                //     }
                                // ]
                            },
                            {
                                model: t_lokasi,
                                required: false,
                                as: 'petugasuppkb',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ],
                    },
                    {
                        model: roles,
                        required: false,
                        as: 'userroles',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_bptd,
                        required: false,
                        as: 'userbptd',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'userlokasi',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_kota_kab,
                                required: false,
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
                                        required: false,
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
                                                required: false,
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
                        ]
                    }
                ],
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

            const { docs, pages, total } = await Users.paginate(options)

            return res.status(200).json({
                success: true,
                message: "Req. Success",
                data: docs,
                meta: {
                    pages: pages,
                    paginate: options.paginate,
                    total: total
                }
            });
        } catch (error) {
            //next(error)
            console.log(error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };

    const findOne = async (req, res, next) => {
        console.log("--------------------------- Processing Get By ---------------------------");
        try {
            const id = req.params.id;
            Users.findByPk(id, {
                attributes: ['id', 'nama_lengkap', 'kontak_person', 'username', 'email', 'petugas_id', 'lokasi_id', 'role_id', 'last_login', 'register_date', 'created_at', 'updated_at', 'deleted_at', 'is_deleted', 'is_active'],
                include: [
                    {
                        model: t_petugas,
                        required: false,
                        as: 'userpetugas',
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_regu,
                                required: false,
                                as: 'petugasregu',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                                // include: [
                                //     {
                                //         model: t_shift,
                                //         required: true,
                                //         as: 'regushift',
                                //         attributes: [
                                //             'id', 'kode', 'nama'
                                //         ],
                                //         where: {
                                //             is_deleted: false,
                                //             is_active: true
                                //         }
                                //     }
                                // ]
                            },
                            {
                                model: t_lokasi,
                                required: false,
                                as: 'petugasuppkb',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ],
                    },
                    {
                        model: roles,
                        required: false,
                        as: 'userroles',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_bptd,
                        required: false,
                        as: 'userbptd',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'userlokasi',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
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
                        ]
                    }
                ],
                logging: false
            }).then(data => {
                res.send({
                    success: true,
                    message: "Request By Id " + id + " Success",
                    data: data
                });
            }).catch(err => {
                res.status(500).send({
                    success: false,
                    message: "Error retrieving ID = " + id
                });
            });
        } catch (error) {
            next(error);
        }
    }

    const profile = async (req, res, next) => {
        console.log("--------------------------- Processing Get By ---------------------------");
        try {
            if (req.token.id) {
                const id = req.token.id;
                Users.findByPk(id, {
                    attributes: ['id', 'nama_lengkap', 'kontak_person', 'username', 'email', 'petugas_id', 'lokasi_id', 'role_id', 'bptd_id', 'last_login', 'register_date', 'created_at', 'updated_at', 'deleted_at', 'is_deleted', 'is_active'],
                    include: [
                        {
                            model: t_petugas,
                            required: false,
                            as: 'userpetugas',
                            where: {
                                is_deleted: false,
                                is_active: true
                            },
                            include: [
                                {
                                    model: t_regu,
                                    required: false,
                                    as: 'petugasregu',
                                    attributes: [
                                        'id', 'kode', 'nama'
                                    ],
                                    where: {
                                        is_deleted: false,
                                        is_active: true
                                    },
                                },
                            ],
                        },
                        {
                            model: roles,
                            required: false,
                            as: 'userroles',
                            attributes: [
                                'id', 'kode', 'nama'
                            ],
                            where: {
                                is_deleted: false,
                                is_active: true
                            }
                        },
                        {
                            model: t_bptd,
                            required: false,
                            as: 'userbptd',
                            attributes: [
                                'id', 'kode', 'nama'
                            ],
                            where: {
                                is_deleted: false,
                                is_active: true
                            }
                        },
                        {
                            model: t_lokasi,
                            required: false,
                            as: 'userlokasi',
                            attributes: [
                                'id', 'kode', 'nama'
                            ],
                            where: {
                                is_deleted: false,
                                is_active: true
                            },
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
                            ]
                        }
                    ],
                    logging: false
                }).then(async (data) => {
                    const menus = await getPrivilege(data.role_id)
                    var resp = {
                        ...data.get({ plain: true }),
                        menus
                    }
                    res.send({
                        success: true,
                        message: "Permintaan Data Berhasil",
                        data: resp
                    });
                }).catch(err => {
                    res.status(500).send({
                        success: false,
                        message: "Permintaan Data Gagal"
                    });
                });
            } else {
                res.status(500).send({
                    success: false,
                    message: "Permintaan Data Gagal. Silahkan Login Kembali"
                });
            }
        } catch (error) {
            next(error);
        }
    }

    const checkPasswordValidity = (value) => {
        // const isNonWhiteSpace = /^\S*$/;
        // if (!isNonWhiteSpace.test(value)) {
        //     return "Password must not contain Whitespaces.";
        // }

        const isContainsUppercase = /^(?=.*[A-Z]).*$/;
        if (!isContainsUppercase.test(value)) {
            return false; // "Password must have at least one Uppercase Character.";
        }

        const isContainsLowercase = /^(?=.*[a-z]).*$/;
        if (!isContainsLowercase.test(value)) {
            return false; // "Password must have at least one Lowercase Character.";
        }

        const isContainsNumber = /^(?=.*[0-9]).*$/;
        if (!isContainsNumber.test(value)) {
            return false; // "Password must contain at least one Digit.";
        }

        const isContainsSymbol =
            /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/;
        if (!isContainsSymbol.test(value)) {
            return false; // "Password must contain at least one Special Symbol.";
        }

        const isValidLength = /^.{8,16}$/;
        if (!isValidLength.test(value)) {
            return false; // "Password must be 10-16 Characters Long.";
        }

        return true;
    }

    function generateApiKey() {
        return 'ak_' + crypto.randomBytes(32).toString('hex');
    }

    const register = async (req, res) => {
        // const {
        //     username,
        //     nama_lengkap,
        //     kontak_person,
        //     email,
        //     password1,
        //     password2,
        //     role_id,
        //     lokasi_id,
        //     bptd_id,
        //     petugas_id,
        // } = req.body;
        //console.log('SESSSION : ',req.token.id);
        var username = req.body.username;
        var nama_lengkap = req.body.nama_lengkap;
        var kontak_person = req.body.kontak_person;
        var email = req.body.email;
        var password1 = req.body.password1;
        var password2 = req.body.password2;
        var role_id = req.body.role_id;
        var lokasi_id = req.body.lokasi_id == 0 ? null : req.body.lokasi_id;
        var bptd_id = req.body.bptd_id;
        var petugas_id = req.body.petugas_id;
        const register_date = moment().format('YYYY-MM-DD');
        const created_at = moment().toDate();
        //req.token.id;
        var format = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/; // /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        try {
            if (checkPasswordValidity(password1)) {
                if (password1 === password2) {
                    //if (req.token.id) {
                    const check_user = await Users.findOne({
                        //attributes:['id', 'username', 'kontak_person', 'email', 'last_login', 'register_date', 'created_at', 'updated_at', 'is_active'],
                        where: {
                            [Op.or]: [
                                { username: req.body.username },
                                { email: req.body.email },
                            ]
                        },
                    });

                    if (!check_user) {
                        const password = bcrypt.hashSync(password1, 10);
                        var created_by = 1; // req.token.id;
                        const user = await Users.create({
                            username,
                            kontak_person,
                            nama_lengkap,
                            email,
                            password,
                            role_id,
                            lokasi_id,
                            bptd_id,
                            petugas_id,
                            register_date,
                            created_at,
                            created_by
                        });
                        const apiKey = generateApiKey();
                        const apiKeyCreatedAt = new Date();
                        const apiKeyExpiredAt = null; // <- unlimited

                        await user.update({
                            api_key: apiKey,
                            api_key_created_at: apiKeyCreatedAt,
                            api_key_expired_at: apiKeyExpiredAt
                        });

                        if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                            var data_req = req.body;
                            await syncToPostServer(req.token.id, 'post', 'v2pv/user/register', data_req).then(async (resp) => {
                                if (resp.data.success) {
                                    console.log(resp.data.data[0].last_insert_id, resp.data.data[0].fields.kode);
                                    console.log('SINKRONISASI DATA BERHASIL');
                                } else {
                                    console.log('SINKRONISASI DATA GAGAL');
                                }
                            }).catch((error) => {
                                // console.log(error);
                                console.log('SINKRONISASI DATA GAGAL');
                            });
                        }
                        return res.status(200).json({ success: true, message: 'Pendaftaran Pengguna Berhasil', api_key: apiKey });
                    } else {
                        return res.status(400).json({ success: false, message: 'Username atau Email Sudah Tersedia' });
                    }
                    // } else {
                    //     return res.status(400).json({ success: false, message: 'Session Expired' });
                    // }
                }

                return res.status(400).json({ success: false, message: 'Ulangi Password Harus Sama Dengan Password' });
            } else {
                return res.status(400).json({ success: false, message: 'Password Harus Kombinasi Simbol, Angka, dan Karakter Dengan Kombinasi Huruf Besar dan Kecil' });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };

    const edit = async (req, res) => {
        const id = req.params.id;
        console.log('EDIT USER')
        const {
            //idx,
            petugas_id,
            role_id,
            lokasi_id,
            bptd_id,
            nama_lengkap,
            kontak_person
        } = req.body;

        try {
            //console.log('SES ', req.session.user)
            if (id) {

                const user = await Users.update({
                    petugas_id: petugas_id,
                    role_id: role_id,
                    lokasi_id: lokasi_id,
                    bptd_id: bptd_id,
                    kode_uppkb: await getLokasiUppkbKode(lokasi_id),
                    nama_lengkap: nama_lengkap,
                    kontak_person: kontak_person,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                    updated_by: req.token.id
                }, {
                    where: { id: id }
                });

                if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                    var data_req = req.body;
                    await syncToPostServer(req.token.id, 'put', `v2pv/user/edit/${id}`, data_req).then(async (resp) => {
                        if (resp.data.success) {
                            console.log('SINKRONISASI DATA BERHASIL');
                        } else {
                            console.log('SINKRONISASI DATA GAGAL');
                        }
                    }).catch((error) => {
                        // console.log(error);
                        console.log('SINKRONISASI DATA GAGAL');
                    });
                }

                return res.status(200).json({ success: true, message: 'Ubah Data Pengguna Berhasil' });
                // }else{
                //     return res.status(400).json({ success: false, message: 'ID Tidak Tersedia' });    
                // }
            } else {
                return res.status(400).json({ success: false, message: 'ID Tidak Tersedia' });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };

    const change_password = async (req, res) => {
        var id = req.params.id;

        const { password_lama, npassword, cpassword } = req.body;

        const is_user = await Users.findByPk(id);

        if (is_user) {
            if (checkPasswordValidity(npassword)) {
                if (bcryptService().comparePassword(password_lama, is_user.password)) {
                    if (npassword === cpassword) {
                        const update_pass = await Users.update({
                            password: bcrypt.hashSync(cpassword, 10)
                        }, {
                            where: { id: id }
                        });
                        if (update_pass[0]) {
                            return res.status(200).json({ success: true, message: 'Ganti Password Berhasil' });
                        } else {
                            return res.status(400).json({ success: false, message: 'Ganti Password Gagal. Hubungi Administrator' });
                        }

                    } else {
                        return res.status(400).json({ success: false, message: 'Ulangi Password Harus Sama Dengan Password' });
                    }
                } else {
                    return res.status(400).json({ success: false, message: 'Password Lama Tidak Sesuai' });
                }
            } else {
                return res.status(400).json({ success: false, message: 'Password Harus Kombinasi Simbol, Angka, dan Karakter Dengan Kombinasi Huruf Besar dan Kecil' });
            }
        } else {
            return res.status(400).json({ success: false, message: 'Pengguna Tidak Tersedia' });
        }
    }

    const reset_password = async (req, res) => {
        var id = req.params.id;

        const { npassword, cpassword } = req.body;

        const is_user = await Users.findByPk(id);

        if (is_user) {
            if (npassword === cpassword) {
                const update_pass = await Users.update({
                    password: bcrypt.hashSync(cpassword, 10)
                }, {
                    where: { id: id }
                });
                if (update_pass[0]) {
                    return res.status(200).json({ success: true, message: 'Ganti Password Berhasil' });
                } else {
                    return res.status(400).json({ success: false, message: 'Ganti Password Gagal.' });
                }

            } else {
                return res.status(400).json({ success: false, message: 'Ulangi Password Harus Sama Dengan Password' });
            }
        } else {
            return res.status(400).json({ success: false, message: 'Pengguna Tidak Tersedia' });
        }
    }

    // const signout = async (req, res) => {
    //     const update_last_login = await Users.update({
    //         token: '',
    //         refresh_token: '',
    //         // is_login: false,
    //         last_logout: moment().format('YYYY-MM-DD HH:mm:ss')
    //     }, {
    //         where: { id: req.token.id }
    //     });
    //     if (update_last_login[0] == 1) {
    //         if (req.token.id) {
    //             req.token = {};
    //         }
    //         return res.status(200).json({ success: true, message: 'Logout Berhasil' });
    //     } else {
    //         return res.status(500).json({ success: false, message: 'Terjadi Kegagalan Pada Server' });
    //     }

    // }

    const signout = async (req, res) => {
        console.log('test')
        try {
            const sess = req.session;
            const userId = req.token.id;
            // const token = sess.token;
            // console.log(' : ', userId);

            sess.destroy(async (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Logout gagal' });
                }

                client.del(userId, async (err, response) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menghapus token' });
                    }

                    const update_last_login = await Users.update({
                        token: '',
                        refresh_token: '',
                        is_login: false,
                        last_logout: moment().format('YYYY-MM-DD HH:mm:ss')
                    }, {
                        where: { id: userId }
                    });

                    if (update_last_login[0] == 1) {
                        return res.status(200).json({ success: true, message: 'Logout Berhasil' });
                    } else {
                        return res.status(500).json({ success: false, message: 'Terjadi Kegagalan Pada Server' });
                    }
                });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
        }
    };

    const validate = async (req, res, next) => {
        let tokenToVerify;
        if (req.header('Authorization')) {
            const parts = req.header('Authorization').split(' ');
            //console.log(parts)
            if (parts.length === 2) {
                const scheme = parts[0];
                const credentials = parts[1];

                if (/^Bearer$/.test(scheme)) {
                    tokenToVerify = credentials;
                } else {
                    return res.status(401).json({ success: false, message: 'Format for Authorization: Bearer [token]' });
                }
            } else {
                return res.status(401).json({ success: false, message: 'Format for Authorization: Bearer [token]' });
            }
        } else if (req.body.token) {
            tokenToVerify = req.body.token;
            delete req.query.token;
        } else {
            return res.status(401).json({ success: false, message: 'No Authorization was found' });
        }

        return res.status(200).json({ success: true, message: 'Token Benar', token: tokenToVerify, expired: config.token_life });
    };

    const tokenRefresh = async (req, res, next) => {
        try {
            const update_last_login = await Users.update({
                // is_login: false,
                last_logout: moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
                where: { refresh_token: req.body.refreshToken },
                logging: true
            });
            if (update_last_login[0] == 1) {
                const users = await Users.findAll({ where: { refresh_token: req.body.refreshToken }, logging: true });

                if (Object.keys(users).length > 0) {
                    const token = authService().issue({ id: users[0].id });
                    const tokenRefresh = authService().issueRefresh({ id: users[0].id })

                    const update_last_login = await Users.update({
                        token: token,
                        refresh_token: tokenRefresh,
                        is_login: true,
                    }, {
                        where: { id: users[0].id },
                        logging: true
                    });

                    var data = {
                        success: true,
                        accessToken: token,
                        refreshToken: tokenRefresh,
                        expired: config.token_life
                    }
                    //console.log(update_last_login, data);

                    if (update_last_login[0] == 1) {
                        return res.status(200).json(data);
                    } else {
                        return res.json({ success: false, message: 'Update Data Gagal' });
                    }

                } else {
                    return res.status(400).json({ succes: false, message: 'Pengguna Tidak Tersedia' });
                }
            } else {
                return res.status(400).json({ succes: false, message: 'Update Gagal' });
            }
        } catch (error) {
            console.log(error);
            next(error);
        }


    }

    const updateStatus = async (req, res, next) => {
        console.log("--------------------::Processing Update::--------------------");

        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i => Number(i));

            Users.update(
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

    const remove = async (req, res, next) => {
        console.log("--------------------::Processing Delete::--------------------");

        const id = req.params.id;
        try {
            Users.destroy({
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
            Users.destroy({
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
        console.log("--------------------::Processing Delete Soft Provinsi::--------------------");

        const id = req.params.id;
        try {
            Users.update(
                {
                    is_deleted: true,
                    deleted_by: req.token.id,
                    deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    where: { id: id },
                    logging: true
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
                console.log(err)
                res.status(500).send({
                    success: false,
                    message: `${messageService().REMOVE_FAILED}. ${err}`
                });
            });
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    const removeArrSoft = async (req, res, next) => {
        console.log("--------------------::Processing Delete All Soft::--------------------");
        try {
            var q = req.query.arrId;
            var resSplit = q.split(",").map(i => Number(i));

            Users.update(
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

    const truncate = async (req, res, next) => {
        console.log("--------------------::Processing Truncate Reset Identity::--------------------");
        try {
            Users.destroy(
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

    //send email
    const sendEmail = (email, token) => {

        var email = email;
        var token = token;

        var mail = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'marktel.rnd@gmail.com', // Your email id
                pass: 'marktel123456' // Your password
            }
        });

        var mailOptions = {
            from: 'marktel.rnd@gmail.com',
            to: email,
            subject: 'Reset Password - JTO',
            html: '<p>Anda melakukan permintaan reset password, silahkan klik <a href="https://jto.marktelrnd.online/change-password/' + token + '">link</a> untuk mereset password anda</p>'

        };

        mail.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(1)
            } else {
                console.log(0)
            }
        });
    }

    const forgotPassword = async (req, res, next) => {
        var email = req.body.email;

        if (email) {
            const users = await Users.findAll({
                //attributes:['id', 'username', 'kontak_person', 'email', 'last_login', 'register_date', 'created_at', 'updated_at', 'is_active'],
                where: { email: email }
            });

            if (Object.keys(users).length > 0) {
                const token = authService().issue({ id: users[0].id });
                var sent = sendEmail(email, token);

                if (sent != '0') {

                    var data = {
                        token: token
                    }

                    Users.update(data, {
                        where: { email: users[0].email },
                        logging: false
                    }).then(num => {
                        if (num == 1) {
                            res.status(200).send({
                                success: true,
                                message: 'Update token dan Kirim link reset password ke email berhasil'
                            });
                        } else {
                            res.status(204).send({
                                success: false,
                                message: 'Update token berhasil dan Kirim link reset password ke email gagal'
                            });
                        }
                    }).catch(err => {
                        res.status(400).send({
                            success: false,
                            message: `${messageService().UPDATE_FAILED}`
                        });
                    });

                } else {
                    res.status(400).send({
                        success: false,
                        message: 'Kirim link reset password ke email gagal'
                    });
                }
            } else {
                res.status(400).send({
                    success: false,
                    message: `Pengguna ${email} tidak di temukan`
                });
            }
        } else {
            res.status(400).send({
                success: false,
                message: `Email Tidak Boleh Kosong`
            });
        }
    }

    const forgotResetPassword = async (req, res) => {
        var token = req.body.token;

        const { new_password, new_password_confirm } = req.body;

        const users = await Users.findAll({
            //attributes:['id', 'username', 'kontak_person', 'email', 'last_login', 'register_date', 'created_at', 'updated_at', 'is_active'],
            where: { token: token }
        });

        if (Object.keys(users).length > 0) {
            if (new_password === new_password_confirm) {
                const update_pass = await Users.update({
                    password: bcrypt.hashSync(new_password_confirm, 10)
                }, {
                    where: { token: token }
                });
                if (update_pass[0]) {
                    return res.status(200).json({ success: true, message: 'Ganti Password Berhasil' });
                } else {
                    return res.status(400).json({ success: false, message: 'Ganti Password Gagal.' });
                }

            } else {
                return res.status(400).json({ success: false, message: 'Ulangi Password Harus Sama Dengan Password' });
            }
        } else {
            return res.status(400).json({ success: false, message: 'Pengguna Tidak Tersedia' });
        }
    }

    const dataUser = async (req, next) => {
        console.log("--------------------------- Processing Get All ---------------------------");
        try {
            const id = req.query.lid;
            const bptd_id = req.query.bptd;
            const role_id = req.query.role;
            let conditions = { is_deleted: false }

            const count = await countAll();

            if (id) {
                conditions = { lokasi_id: id, is_deleted: false, hidden_akun: false };
            }

            if (bptd_id) {
                conditions = {
                    bptd_id: bptd_id,
                    is_deleted: false,
                    hidden_akun: false
                }
            }

            if (role_id) {
                conditions = {
                    role_id: role_id,
                    is_deleted: false,
                    hidden_akun: false
                }
            }

            if (bptd_id && role_id) {
                conditions = {
                    bptd_id: bptd_id,
                    role_id: role_id,
                    is_deleted: false,
                    hidden_akun: false
                }
            }

            const options = {
                attributes: ['id', 'nama_lengkap', 'kontak_person', 'username', 'email', 'petugas_id', 'lokasi_id', 'role_id', 'last_login', 'register_date', 'created_at', 'updated_at', 'deleted_at', 'is_deleted', 'is_active'],
                include: [
                    {
                        model: t_petugas,
                        required: false,
                        as: 'userpetugas',
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_regu,
                                required: false,
                                as: 'petugasregu',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                },
                            },
                            {
                                model: t_lokasi,
                                required: false,
                                as: 'petugasuppkb',
                                attributes: [
                                    'id', 'kode', 'nama'
                                ],
                                where: {
                                    is_deleted: false,
                                    is_active: true
                                }
                            }
                        ],
                    },
                    {
                        model: roles,
                        required: false,
                        as: 'userroles',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_bptd,
                        required: false,
                        as: 'userbptd',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        }
                    },
                    {
                        model: t_lokasi,
                        required: false,
                        as: 'userlokasi',
                        attributes: [
                            'id', 'kode', 'nama'
                        ],
                        where: {
                            is_deleted: false,
                            is_active: true
                        },
                        include: [
                            {
                                model: t_kota_kab,
                                required: false,
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
                                        required: false,
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
                                                required: false,
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
                        ]
                    }
                ],
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

            const { docs, pages, total } = await Users.paginate(options)

            const result = {
                data: docs,
                meta: {
                    pages: pages,
                    paginate: options.paginate,
                    total: total
                }
            }
            return result

        } catch (error) {
            next(error)
        }
    };

    const xlsUser = async (req, res, next) => {
        const result = await dataUser(req, next)
        
        if (result) {
            let obj = [];

            for (let row of result.data) {

                obj.push({
                    grup: row.userroles ? row.userroles.nama : '-',
                    nama_lengkap: row.nama_lengkap,
                    email: row.email,
                    kontak_person: row.kontak_person || '-',
                    bptd: row.userbptd ? row.userbptd.nama : '-',
                    uppkb: row.userlokasi ? row.userlokasi.nama : '-',
                    regu: row.userpetugas ? row.userpetugas.petugasregu ? row.userpetugas.petugasregu.nama : '-' : '-',
                    nip: row.userpetugas ? row.userpetugas.nip : '-',
                    jabatan: row.userpetugas ? row.userpetugas.jabatan : '-',
                    no_skep: row.userpetugas ? row.userpetugas.no_skep : '-',
                    no_reg_penguji: row.userpetugas ? row.userpetugas.no_reg_penguji : '-'
                })
            }
            
            let workbook = new excel.Workbook();
            let worksheet = workbook.addWorksheet('Data Verifikasi', {
                pageSetup: {
                    paperSize: 9,
                    orientation: 'landscape'
                }
            });
    
            worksheet.pageSetup.margins = {
                left: 0.7, right: 0.7,
                top: 0.75, bottom: 0.75,
                header: 0.3, footer: 0.3
            }
            
            worksheet.columns = [
                { header: 'Grup', key: 'grup', width: 20},
                { header: 'Nama Lengkap', key: 'nama_lengkap', width: 30},
                { header: 'Email', key: 'email', width: 30},
                { header: 'Kontak', key: 'kontak_person', width: 20},
                { header: 'BPTD', key: 'bptd', width: 30},
                { header: 'UPPKB', key: 'uppkb', width: 30},
                { header: 'Regu', key: 'regu', width: 20},
                { header: 'NIP', key: 'nip', width: 20},
                { header: 'Jabatan', key: 'jabatan', width: 40},
                { header: 'No Skep', key: 'no_skep', width: 30},
                { header: 'No Reg Penguji', key: 'no_reg_penguji', width: 30}
            ]
            
            worksheet.addRows(obj);
            worksheet.eachRow(function (row, rowNumber) {
                row.eachCell((cell, colNumber) => {
                    if (rowNumber == 1) {
                        // First set the background of header row
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'f5b914' }
                        }
                    }
                    // Set border of each cell 
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                })
                //Commit the changed row to the stream
                row.commit();
            });

            let m = moment();
            let ms = m.millisecond() + 1000 * (m.second() + 60 * (m.minutes() + 60 * m.hours()));
            const filename = `users_${moment().format('YYYY_MM_DD_HH_mm_ss_SSSSSSSSS')}_${ms}.xlsx`;
            const uploadPath = path.join(config.path_report) + '/xls/' + filename;
            const reportUrl = config.report_url + 'xls/' + filename;
    
            workbook.xlsx.writeFile(uploadPath).then(() => {
                console.log('xlsx fiel is written.')
                res.send({
                    success: true,
                    message: 'Export Excel Berhasil',
                    filename: filename,
                    download: reportUrl
                })
            })
        }
    }

    return {
        findAll,
        findOne,
        profile,
        edit,
        register,
        signout,
        forgotPassword,
        forgotResetPassword,
        change_password,
        reset_password,
        validate,
        tokenRefresh,
        updateStatus,
        remove,
        removeArr,
        removeSoft,
        removeArrSoft,
        truncate,
        xlsUser
    };
}

module.exports = UsersController;

/*
exports.findAll = async (req, res, next) => {
    console.log("--------------------------- Processing Get All ---------------------------");
    try {
        const name = req.query.search;
        var conditions = name ? { name: { [Op.iLike]: `%${name}%` } } : null;

        const options = {
            page: req.query.page || 1,
            paginate: req.query.paginate || 25,
            order: [
                [
                    req.query.orderBy || 'created_at',
                    req.query.sortedBy || 'DESC'
                ]
            ],
            where: conditions
        }

        const { docs, pages, total } = await Users.paginate(options)

        res.status(200).json({
            success: true,
            message: "Req. Success",
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
};

exports.findOne = async (req, res, next) => {
    console.log("--------------------------- Processing Get By ---------------------------");
    try {
        const id = req.params.id;
        Users.findByPk(id).then(data => {
            res.send({
                success: true,
                message: "Request By Id " + id + " Success",
                data: data
            });
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: "Error retrieving ID = " + id
            });
        });
    } catch (error) {
        next(error);
    }
};
*/