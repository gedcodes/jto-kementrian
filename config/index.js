const publicRoutes = require('./routes/publicRoutes');
const privateRoutes = require('./routes/privateRoutes');

module.exports = {
  migrate: false,
  publicRoutes,
  privateRoutes,
  port: process.env.APP_PORT || '2017',
  session_name: process.env.SESSION_NAME,
  secret_sess: process.env.SECRET || 'marktel123456',
  expired_sess: process.env.EXPIRED,
  private_key: process.env.PRIVATE_KEY || "app.marktel.jto.key",
  session_expires: process.env.SESSION_EXPIRES || "app.marktel.jto.session.expired",
};
