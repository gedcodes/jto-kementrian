require('dotenv').config()

module.exports = {
    "dialect": process.env.DB_DRIVER || "postgres",
    "host": process.env.DB_HOST || "127.0.0.1",
    "port": process.env.DB_PORT || 5432,
    "database": process.env.DB_NAME || "db_jto",
    "username": process.env.DB_USER || "postgres",
    "password": process.env.DB_PASS || "Marktel123456",
    "secret": process.env.SECRET || "marktel123456_life",
    "secret_refresh": process.env.SECRET_REFRESH || "marktel123456_refresh",
    "timezone": process.env.TIMEZONE || "+07:00",
    "expired": process.env.EXPIRED || 0,
    "token_life": process.env.TOKEN_LIFE || "2h",
    "refresh_token": process.env.REFRESH_TOKEN || "5h",
    "path_upload": process.env.PATH_UPLOAD || "D:/MarktelRND/Development/Hybrid/jto/images",
    "path_manual": process.env.PATH_MANUAL || "D:/MarktelRND/Development/Hybrid/jto/manual",
    "path_report": process.env.PATH_REPORT || "D:/MarktelRND/Development/Hybrid/jto/laporan",
    "domain_url": process.env.DOMAIN_URL || "http://localhost:5001/",
    "image_url": process.env.IMAGE_URL || "http://localhost/img/jto/",
    "panduan_url": process.env.PANDUAN_URL || "http://localhost/pnd/jto/",
    "report_url": process.env.REPORT_URL || "http://localhost/lap/jto/",
    "private_key": process.env.PRIVATE_KEY || "app.marktel.jto.key",
    "session_expires": process.env.SESSION_EXPIRES || "app.marktel.jto.session.expired",
    "domain_streaming": process.env.DOMAIN_STREAMING || "http://jto-dev.marktel.co/streaming/",
    "mqtt_broker_url": process.env.MQTT_BROKER_URL || "mqtt://127.0.0.1",
    "mqtt_broker_port": process.env.MQTT_BROKER_PORT || 1883
}