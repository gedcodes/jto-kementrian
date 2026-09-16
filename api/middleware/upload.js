const util = require("util");
const multer = require("multer");
const maxSize = 2 * 1024 * 1024;
const crypto = require('crypto');
var path = require('path');
var currentDate = new Date();
var config = require('../../config/config');

var date = currentDate.getDate();
var month = currentDate.getMonth(); //Be careful! January is 0 not 1
var year = currentDate.getFullYear();
var hours = currentDate.getHours();         // 0
var minutes = currentDate.getMinutes();       // 0
var seconds = currentDate.getSeconds();
var t = Date.now();//currentDate.getTime();
var dateTimeString = year + "-" + pad(month + 1) + "-" + pad(date) + " " + pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
var dateTimeUploadName = year + "_" + pad(month + 1) + "_" + pad(date) + "__" + pad(hours) + "_" + pad(minutes) + "_" + pad(seconds);//+"_"+t;

function pad(n) {
	return n < 10 ? '0' + n : n;
}

let storage = multer.diskStorage({
	destination: (req, file, cb) => {
		//console.log(req.body)
		//cb(null, __basedir + "/resources/static/assets/uploads/");
		//console.log('REQ : ',req.body.fd)
		cb(null, `${config.path_upload}\\${req.body.fd}`);
	},
	filename: (req, file, cb) => {
		//console.log(file);
		var fileObj = {
			"image/png": ".png",
			"image/PNG": ".PNG",
			"image/jpeg": ".jpeg",
			"image/jpg": ".jpg"
		};
		if (fileObj[file.mimetype] == undefined) {
			cb(new Error("file format not valid"));
		} else {
			cb(null, dateTimeUploadName + '_' + crypto.randomBytes(6).toString('hex') + '_' + file.originalname.replace(/\s/g, ''))
		}
	},
});

let uploadFile = multer({
	storage: storage,
	limits: { fileSize: maxSize },
	fileFilter: function (req, file, callback) {
		var ext = path.extname(file.originalname)
		if (ext !== '.PNG' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.png') {
			return callback(null, false)
		}
		callback(null, true)
	}
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;