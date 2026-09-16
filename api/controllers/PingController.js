const messageService =  require('../services/message.service');
const moment = require('moment');

const PingController = () => {
    const findAll = async (req, res, next) => {
        console.log("--------------------::Processing PING::--------------------");
        try {
            const command = req.body.command;
            if (command == 'ping') {
                res.status(200).send({
                    success: true,
                    message: 'pong',
                    tgl_jam_server: moment().format('YYYY-MM-DD HH:mm:ss'),      
                });
            } else {
                res.status(400).send({
                    success: false,
                    message: messageService().GET_FAILED,    
                });
            }

    
        } catch (error) {
            next(error)
        }
    }
    
    return {
        findAll,
    };
}
module.exports = PingController;