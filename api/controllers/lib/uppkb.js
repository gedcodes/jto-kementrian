const config = require('../../../config/config');
const fs = require('fs');
const path = require("path");
const moment = require('moment');

const uploadPathImageUppkb = (file_name) => {
    const uploadPath = path.join(config.path_upload) + '/galeri/' + file_name;
    return uploadPath;
}

const imageUrlUppkb = (file_name) => {
    const imageUrl = `${config.image_url}galeri/${file_name}`;
    return imageUrl;
}

exports.uploadImage = async (kode, nama, namaImage, req, res) => {
    if (req) {
        console.log('FILE IMAGE : ', req.name);
        console.log('SIZE IMAGE : ', req.size);
        const nama_uppkb = nama.replace(/\s/g, '')
        if (req.size > 2 * 1024 * 1024) {
            console.log(`Size File Max. 2 Mb. File ${req.name} Melebihi Ukuran`);
            return {
                success: false,
                message: `Size File Max. 2 Mb. File ${req.name} Melebihi Ukuran`
            }
        }

        const extensionName = path.extname(req.name); // fetch the file extension
        const allowedExtension = ['.png', '.jpg', '.jpeg'];

        console.log('FORMAT IMAGE : ', extensionName);

        if (!allowedExtension.includes(extensionName)) {
            
            return {
                success: false,
                message: "Format File Yang Di Izinkan [*.png, *.jpg, *.jpeg]"
            }
        }


        var filename = kode + '_'+ nama_uppkb + '_' + namaImage + '_' + moment().format('YYYY_MM_DD_HH_mm_ss') + '_' + moment().valueOf() + extensionName;

        const uploadPath = uploadPathImageUppkb(filename); ////config.path_upload+'/'+file_name;
        const imageUrl = imageUrlUppkb(filename); //`${config.image_url}penimbangan/${file_name}`;
        // fileImg.mv(uploadPath);
        var dataUpload = {
            status: true,
            imgPath: uploadPath || '',
            imgName: filename || '',
            imgUrl: imageUrl || ''
        }

        req.mv(uploadPath, function (err) {
            if (err)
                console.log(err);
            return err;

        });
        // console.log(dataUpload)
        return dataUpload;
    } else {
        var dataUpload = {
            imgPath: '',
            imgName: '',
            imgUrl: ''
        }
        console.log('DATA UPLOAD : ', dataUpload);
        return dataUpload;
    }

}

exports.removeImage = async (file_name) => {
    const pathImage = path.join(config.path_upload) + '/galeri/' + file_name;
    console.log(`REMOVE IMAGE: ${pathImage}` )
    try {
        fs.unlinkSync(pathImage)
    } catch (error) {
        console.error(error)
    }
}
