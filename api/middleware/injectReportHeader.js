// middlewares/injectReportHeader.js
const { reportTemplate } = require('../controllers/lib/report_template');

const injectReportHeader = async (req, res, next) => {
  try {
    const header = await reportTemplate();

    // Inject ke semua render EJS
    res.locals.logo = path.join(__dirname, '../views/images/', `${header.logo}`); // `${process.env.PATH_LOGO}/${header.logo}`;
    res.locals.judul = header.judul;
    res.locals.sub_judul = header.sub_judul;
    // res.locals.subjudul = header.subjudul;
  } catch (err) {
    console.error('Gagal inject report header:', err);

    // Default jika gagal
    res.locals.logo = path.join(__dirname, '../views/images/', 'default-logo.png'); // '/img/default-logo.png';
    res.locals.judul = '';
    res.locals.sub_judul = '';
    // res.locals.subjudul = '';
  }

  next();
};

module.exports = injectReportHeader;
