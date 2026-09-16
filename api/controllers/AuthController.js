const moment = require('moment');
const { Users } = require('../models/');
const authService = require('../services/auth.service');
const bcryptService = require('../services/bcrypt.service');
const config = require('../../config/config');
const redis = require('redis');
const path = require('path');
const svgCaptcha = require('svg-captcha');

const client = redis.createClient();


function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const AuthController = () => {
    
    const login = async (req, res) => {
        try {
            const sess = req.session;
            const { email, password, captcha, captchaId, is_web } = req.body;
            // console.log('AKUN: ', req.body);

            const apiKey = req.headers['x-api-key'];

            if (apiKey) {
                const user = await Users.findOne({
                    where: {
                        api_key: apiKey,
                        is_active: true,
                        is_deleted: false,
                    },
                    logging: false
                });

                if (!user) {
                    return res.status(401).json({ success: false, message: 'API Key tidak valid' });
                }

                if (user.api_key_expired_at !== null && new Date() > new Date(user.api_key_expired_at)) {
                    return res.status(403).json({ success: false, message: 'API Key telah kedaluwarsa' });
                }

                return completeLogin(user, req, res, false); // pakai false, bukan web
            }

            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email dan Password Tidak Sesuai' });
            }

            const is_mail = validateEmail(email);
            const condition = is_mail ? { email: email } : { username: email };

            const user = await Users.findOne({
                where: condition,
                logging: false
            });

            if (!user || !bcryptService().comparePassword(password, user.password)) {
                return res.status(401).json({ success: false, message: 'Pengguna Tidak Di Kenal (Un-Authorize)' });
            }

            if (process.env.IS_KEMENHUB == 1 && is_web) {
                if (user.role_id == 1 && user.lokasi_id != null) {
                    return res.status(402).json({ success: false, message: 'Admin UPPKB tidak dapat login' });
                }

                client.get(captchaId, (err, storedCaptcha) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
                    }

                    if (!storedCaptcha || storedCaptcha !== captcha) {
                        return res.status(400).json({ success: false, message: 'Kode captcha tidak valid' });
                    }

                    client.del(captchaId); // Hapus captcha setelah diverifikasi
                    completeLogin(user, req, res, true);
                });
                console.log('WEB');
            } else {
                console.log('NO WEB');
                const token = authService().issue({ id: user.id });
                const tokenRefresh = authService().issueRefresh({ id: user.id })
                sess.user = user;
                sess.token = token;
                sess.refreshToken = tokenRefresh;

                var ip;
                if (req.headers['x-forwarded-for']) {
                    ip = req.headers['x-forwarded-for'].split(",")[0];
                } else if (req.connection && req.connection.remoteAddress) {
                    ip = req.connection.remoteAddress;
                } else {
                    ip = req.ip;
                }

                const update_last_login = await Users.update({
                    token: token,
                    refresh_token: tokenRefresh,
                    ip_address: ip,
                    is_login: true,
                    last_login: moment().format('YYYY-MM-DD HH:mm:ss')
                }, {
                    where: { id: user.id },
                    logging: false
                });

                if (update_last_login[0] == 1) {
                    if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                        client.del(user.id);
                        client.hmset(user.id, {
                            'email': email,
                            'password': password,
                            'token_type': 'Bearer',
                            'expires_in': config.token_life,
                            'access_token': token,
                            'refresh_token': tokenRefresh,
                            'token': `Bearer ${token}`
                        });
                    }
                    return res.status(200).json({
                        success: true,
                        accessToken: token,
                        refreshToken: tokenRefresh,
                        expired: config.token_life
                    });
                } else {
                    return res.status(400).json({ success: false, message: 'Permintaan Data Gagal' });
                }
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: 'Terjadi Kegagalan Pada Server' });
        }
    };

    const loginWeb = async (req, res) => {
        try {
            const { email, password, captcha, captchaId, is_web } = req.body;
            console.log('AKUN: ', req.body);

            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email dan Password Tidak Sesuai' });
            }

            const is_mail = validateEmail(email);
            const condition = is_mail ? { email: email } : { username: email };

            const user = await Users.findOne({
                where: condition,
                logging: false
            });

            if (!user || !bcryptService().comparePassword(password, user.password)) {
                return res.status(401).json({ success: false, message: 'Pengguna Tidak Di Kenal (Un-Authorize)' });
            }

            if (user.role_id == 1 && user.lokasi_id != null) {
                return res.status(402).json({ success: false, message: 'Admin UPPKB tidak dapat login' });
            }

            if (captcha && captchaId) {
                client.get(captchaId, (err, storedCaptcha) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
                    }
    
                    if (!storedCaptcha || storedCaptcha !== captcha) {
                        return res.status(400).json({ success: false, message: 'Kode captcha tidak valid' });
                    }
    
                    client.del(captchaId); // Hapus captcha setelah diverifikasi
                    completeLogin(user, req, res, true);
                });
                console.log('WEB');
            } else {
                return res.status(400).json({ success: false, message: 'Kode captcha tidak boleh kosong' });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: 'Terjadi Kegagalan Pada Server' });
        }
    };

    const completeLogin = async (user, req, res, is_web) => {
        const token = authService(is_web).issue({ id: user.id });
        const tokenRefresh = authService(is_web).issueRefresh({ id: user.id });

        const ip = req.headers['x-forwarded-for']
            ? req.headers['x-forwarded-for'].split(",")[0]
            : req.connection?.remoteAddress || req.ip;

        const update_last_login = await Users.update({
            token: token,
            refresh_token: tokenRefresh,
            ip_address: ip,
            is_login: true,
            last_login: moment().format('YYYY-MM-DD HH:mm:ss')
        }, {
            where: { id: user.id },
            logging: false
        });

        if (update_last_login[0] === 1) {
            req.session.user = user;
            req.session.token = token;
            req.session.refreshToken = tokenRefresh;

            if (process.env.IS_KEMENHUB == 0 && process.env.APP_ONLINE == 1 && process.env.APP_SINKRONISASI == 1) {
                client.del(user.id);
                client.hmset(user.id, {
                    'email': user.email,
                    'password': user.password,
                    'token_type': 'Bearer',
                    'expires_in': is_web ? '1h' : config.token_life,
                    'access_token': token,
                    'refresh_token': tokenRefresh,
                    'token': `Bearer ${token}`
                });
            }

            return res.status(200).json({
                success: true,
                accessToken: token,
                refreshToken: tokenRefresh,
                expired: is_web ? '1h' : config.token_life
            });
        } else {
            return res.status(400).json({ success: false, message: 'Permintaan Data Gagal' });
        }
    };

    const getCaptcha = (req, res) => {
        svgCaptcha.loadFont(path.join(__dirname, '../../fonts/Verdana.ttf'));
        const captcha = svgCaptcha.create({
            background: '#FFFFFF',
            fontSize: 60,
            width: 260,
            height: 70,
            charPreset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
            size: 5,
        });

        const captchaId = Date.now(); // atau gunakan UUID untuk id unik
        client.setex(captchaId, 300, captcha.text); // Simpan captcha selama 5 menit

        res.status(200).json({
            captchaId,
            data: captcha.data,
        });
    }

    return {
        login,
        loginWeb,
        getCaptcha,
    };
};

module.exports = AuthController;
