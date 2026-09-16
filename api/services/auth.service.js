const config = require('../../config/config');
const jwt = require('jsonwebtoken');

//const secret = process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET : 'secret';

const authService = (is_web = false) => {
    // if (config.expired != 0) {
    //     var issue = (payload) => jwt.sign(payload, config.secret, { expiresIn: config.expired });
    // } else {
    //     var issue = (payload) => jwt.sign(payload, config.secret);
    // }
    if (is_web) {
        console.log('IS WEB : ', is_web)
        var issue = (payload) => jwt.sign(payload, config.secret, { expiresIn: "1h" })
    } else {
        var issue = (payload) => jwt.sign(payload, config.secret, { expiresIn: config.token_life })
    }

    // if (is_web) {
    //     console.log('IS WEB : ', is_web)
    //     var issueRefresh = (payload) => jwt.sign(payload, config.secret_refresh, { expiresIn: "1h" })
    // } else {
    var issueRefresh = (payload) => jwt.sign(payload, config.secret_refresh, { expiresIn: config.refresh_token })
    // }

    //var issueToken = (payload) => jwt.sign(user, config.secret, { expiresIn: config.tokenLife})
    //req.session.user = issue;
    const verify = (token, cb) => jwt.verify(token, config.secret, cb);
    
    const logout = (token) => jwt.destroy(token);
    return {
        issue,
        issueRefresh,
        verify,
        logout,
    };
};

module.exports = authService;
