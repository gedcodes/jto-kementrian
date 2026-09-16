const BptdRule = require('../../api/services/rules/bptd.rule');
const ProvinsiRule = require('../../api/services/rules/provinsi.rule');
const KotaRule = require('../../api/services/rules/kota.rule');
const LokasiRule = require('../../api/services/rules/lokasi.rule');
const kategorikomoditiRule = require('../../api/services/rules/kategorikomoditi.rule');
const komoditiRule = require('../../api/services/rules/komoditi.rule');
const ToleransiKomoditiRule = require('../../api/services/rules/toleransikomoditi.rule');
const ToleransiRule = require('../../api/services/rules/toleransi.rule');
const ToleransiUppkbRule = require('../../api/services/rules/toleransiuppkb.rule');
const JenisKendaraanRule = require('../../api/services/rules/jeniskendaraan.rule');
const SumbuRule = require('../../api/services/rules/sumbu.rule');
const GolonganKendaraanRule = require('../../api/services/rules/golongankendaraan.rule');
const GolSimRule = require('../../api/services/rules/golsim.rule');
const ShiftRule = require('../../api/services/rules/shift.rule');
const ReguRule = require('../../api/services/rules/regu.rule');
const PetugasRule = require('../../api/services/rules/petugas.rule');
const TimbanganRule = require('../../api/services/rules/timbangan.rule');
const DokumenRule = require('../../api/services/rules/dokumen.rule');
const JenisPelanggaranRule = require('../../api/services/rules/jenispelanggaran.rule');
const KendaraanRule = require('../../api/services/rules/kendaraan.rule');
const SanksiRule = require('../../api/services/rules/sanksi.rule');
const SubSanksiRule = require('../../api/services/rules/subsanksi.rule');
const SitaanRule = require('../../api/services/rules/sitaan.rule');
const SanksiPelanggaranRule = require('../../api/services/rules/sanksipelanggaran.rule');
const KategoriKepemilikanRule = require('../../api/services/rules/kategorikepemilikan.rule');
const RoleRule = require('../../api/services/rules/role.rule');
const PasalRule = require('../../api/services/rules/pasal.rule');
const PengadilanRule = require('../../api/services/rules/pengadilan.rule');
const KejaksaanRule = require('../../api/services/rules/kejaksaan.rule');
const VersiRule = require('../../api/services/rules/appversi.rule');
const ManualBookRule = require('../../api/services/rules/manualbook.rule');
const SinkronRule = require('../../api/services/rules/sinkron.rule');
const kategoristatusRule = require('../../api/services/rules/kategoristatus.rule');
const StatusRule = require('../../api/services/rules/status.rule');
const prioritasaduanRule = require('../../api/services/rules/prioritasaduan.rule');
const pengaduanRule = require('../../api/services/rules/pengaduan.rule');
const penangananRule = require('../../api/services/rules/penanganan.rule');
const distribusiaduanRule = require('../../api/services/rules/distribusi_aduan.rule');
const KategoriAsetRule = require('../../api/services/rules/kategoriaset.rule');
const JenisAsetRule = require('../../api/services/rules/jenisaset.rule');
const KondisiAsetRule = require('../../api/services/rules/kondisiaset.rule');
const KegiatanRule = require('../../api/services/rules/kegiatan.rule');
const AsetRule = require('../../api/services/rules/aset.rule');
const VrDeviceRule = require('../../api/services/rules/vrdevice.rule');
const VendorRule = require('../../api/services/rules/vendor.rule');
const DirektoratRule = require('../../api/services/rules/direktorat.rule');
const StreamingRule = require('../../api/services/rules/streaming.rule');
const TipeCctvRule = require('../../api/services/rules/tipecctv.rule');
const TipeSourceCctvRule = require('../../api/services/rules/tipesourcecctv.rule');
const PosisiCctvPlatformRule = require('../../api/services/rules/posisicctvplatform.rule');
const SumberAnggaranRule = require('../../api/services/rules/sumberanggaran.rule');
const LhrnewRule = require('../../api/services/rules/lhrnew.rule');
const MetodeRule = require('../../api/services/rules/metode.rule');
const KategoriKegiatanRule = require('../../api/services/rules/kategorikegiatan.rule');
const SubKondisiAsetRule = require('../../api/services/rules/subkondisiaset.rule');
const SatuanRule = require('../../api/services/rules/satuan.rule');
const InstansiRule = require('../../api/services/rules/instansi.rule');
const LhrPelanggaranRule = require('../../api/services/rules/lhrpelanggaran.rule');
const BankRule = require('../../api/services/rules/bank.rule');

const privateRoutes = {
    'POST /user/validate': 'UsersController.validate',
    'POST /user/register': 'UsersController.register',
    'PUT /user/cpass/:id': 'UsersController.change_password',
    'PUT /user/epass/:id': 'UsersController.reset_password',
    'PUT /user/edit/:id': 'UsersController.edit',
    'DELETE /user/signout': 'UsersController.signout',
    'GET /user/all': 'UsersController.findAll',
    'GET /user/by/:id': 'UsersController.findOne',
    'GET /user/profile': 'UsersController.profile',
    'GET /user/xlsuser': 'UsersController.xlsUser',
    'PUT /user/updateArr/status': 'UsersController.updateStatus',
    'DELETE /user/deletesoft/:id': 'UsersController.removeSoft',
    'DELETE /user/delete/:id': 'UsersController.remove',
    'DELETE /user/deleteArrSoft/arr': 'UsersController.removeArrSoft',
    'DELETE /user/deleteArr/arr': 'UsersController.removeArr',
    'DELETE /user/truncate': 'UsersController.truncate',

    /* ************************Menu************************ */
    'GET /menu': 'MenuController.findAlls',

    /* ************************Role************************ */
    'GET /role': 'RoleController.findAll',
    'GET /role/:id': 'RoleController.findOne',
    'GET /role/publish/active': 'RoleController.findAllActive',
    'POST /role/create': {
        path: 'RoleController.create',
        middlewares: [RoleRule.createValidate]
    },
    'PUT /role/update/:id': {
        path: 'RoleController.update',
        middlewares: [RoleRule.updateValidate]
    },
    'PUT /role/privilege': {
        path: 'RoleController.updateUserPrivilege',
        middlewares: [RoleRule.updateUserPrivilege]
    },
    'PUT /role/updateArr/status': 'RoleController.updateStatus',
    'DELETE /role/deletesoft/:id': 'RoleController.removeSoft',
    'DELETE /role/delete/:id': 'RoleController.remove',
    'DELETE /role/deleteArrSoft/arr': 'RoleController.removeArrSoft',
    'DELETE /role/deleteArr/arr': 'RoleController.removeArr',
    'DELETE /role/truncate': 'RoleController.truncate',

    /* ************************Dashboard************************ */
    'GET /dashboard/chartpenimbangan': 'DashboardController.chartPenimbangan',
    'GET /dashboard/wim/chartpenimbangan': 'DashboardWimController.chartPenimbangan',
    'GET /dashboard/chartpenindakan': 'DashboardController.chartPenindakan',
    'GET /dashboard/chartjmlmelanggar': 'DashboardController.chartJmlJenisPelanggaran',
    'GET /dashboard/chartlebihmuat': 'DashboardController.chartLebihMuat',
    'GET /dashboard/toptenasaltujuan': 'DashboardController.toptenMelanggarAsalTujuan',
    'GET /dashboard/toptenperusahaan': 'DashboardController.toptenMelanggarPerusahaan',
    'GET /dashboard/toptenkomoditi': 'DashboardController.toptenMelanggarKomoditi',
    'GET /dashboard/toptenjeniskendaraan': 'DashboardController.toptenMelanggarJenisKendaraan',
    'GET /dashboard/widgetpenimbangan': 'DashboardController.widgetPenimbangan',
    'GET /dashboard/widgetuppkb': 'DashboardController.widgetUppkb',
    'GET /dashboard/widgetmelanggar': 'DashboardController.widgetMelanggar',
    'GET /dashboard/widgettidakditindak': 'DashboardController.widgetTidakDiTindak',
    'GET /dashboard/widgetpenindakan': 'DashboardController.widgetPenindakan',
    'GET /dashboard/widgetangkutanbarangtidakmasukuppkb': 'DashboardController.widgetAngkutanBarangTidakMasukUPPKB',
    'GET /dashboard/widgetverifikasi': 'DashboardController.widgetVerifikasi',
    'GET /dashboard/widgettidakdiverifikasi': 'DashboardController.widgetTidakDiVerifikasi',
    'GET /dashboard/chartangkutanbarangtidakmasuk': 'DashboardController.chartAngkutanBarangTidakMasuk',
    'GET /dashboard/chartlhrumum': 'DashboardController.chartLhrUmum',
    'GET /dashboard/chartlhrverifikasi': 'DashboardController.chartLhrVerifikasi',
    'GET /dashboard/lhrbarangtidakmasuk': 'DashboardController.lhrBarangTidakMasuk',
    'GET /dashboard/lhrbarangtidakmasuk/xls': 'DashboardController.lhrBarangTidakMasukXls',
    'GET /dashboard/lhrbarangtidakmasuk/print': 'DashboardController.lhrBarangTidakMasukPrint',
    'GET /dashboard/getjumlahblue': 'DashboardController.getJumlahBlue',
    'GET /dashboard/getjumlahblueaktif': 'DashboardController.getJumlahBlueAktif',
    'GET /dashboard/topkategorikomoditi': 'DashboardController.topMelanggarKategoriKomoditi',
    'GET /dashboard/topfiveuppkb': 'DashboardController.topFiveUppkb',
    'GET /dashboard/topfivebptd': 'DashboardController.topFiveBptd',
    'GET /dashboard/getdatalokasi': 'DashboardController.getDataLokasi',
    'GET /dashboard/resumedataproduksi': 'DashboardController.resumeDataProduksi',
    'GET /dashboard/resumekelebihanmuatan': 'DashboardController.resumeKelebihanMuatan',
    'GET /dashboard/resumedatalhruppkb': 'DashboardController.resumeDataLhrUppkb',
    
    // 'GET /bptd/:id': 'BptdController.findOne',
    // 'GET /bptd/publish/active': 'BptdController.findAllActive',
    // 'POST /bptd/create': {
    //     path:'BptdController.create',
    //     middlewares:[BptdRule.createValidate]
    // },
    // 'PUT /bptd/update/:id': {
    //     path:'BptdController.update',
    //     middlewares:[BptdRule.updateValidate]
    // },
    // 'PUT /bptd/updateArr/status': 'BptdController.updateStatus', 
    // 'DELETE /bptd/deletesoft/:id': 'BptdController.removeSoft',
    // 'DELETE /bptd/delete/:id': 'BptdController.remove',      
    // 'DELETE /bptd/deleteArrSoft/arr': 'BptdController.removeArrSoft',
    // 'DELETE /bptd/deleteArr/arr': 'BptdController.removeArr',
    // 'DELETE /bptd/truncate': 'BptdController.truncate',    

    /* ************************APP CONFIG SINKRONISASI************************ */
    'GET /csinkron': 'ConfigSinkronisasiController.findAll',
    'GET /csinkron/:id': 'ConfigSinkronisasiController.findOne',
    'GET /csinkron/publish/active': 'ConfigSinkronisasiController.findAllActive',
    'POST /csinkron/create': {
        path: 'ConfigSinkronisasiController.create',
        middlewares: [SinkronRule.createValidate]
    },
    'PUT /csinkron/update/:id': {
        path: 'ConfigSinkronisasiController.update',
        middlewares: [SinkronRule.updateValidate]
    },
    'PUT /csinkron/updateArr/status': 'ConfigSinkronisasiController.updateStatus',
    'DELETE /csinkron/deletesoft/:id': 'ConfigSinkronisasiController.removeSoft',
    'DELETE /csinkron/delete/:id': 'ConfigSinkronisasiController.remove',
    'DELETE /csinkron/deleteArrSoft/arr': 'ConfigSinkronisasiController.removeArrSoft',
    'DELETE /csinkron/deleteArr/arr': 'ConfigSinkronisasiController.removeArr',
    'DELETE /csinkron/truncate': 'ConfigSinkronisasiController.truncate',

    /* ************************APP VERSI************************ */
    'GET /versi': 'AppVersiController.findAll',
    'GET /versi/:id': 'AppVersiController.findOne',
    'GET /versi/publish/active': 'AppVersiController.findAllActive',
    'POST /versi/create': {
        path: 'AppVersiController.create',
        middlewares: [VersiRule.createValidate]
    },
    'PUT /versi/update/:id': {
        path: 'AppVersiController.update',
        middlewares: [VersiRule.updateValidate]
    },
    'PUT /versi/updateArr/status': 'AppVersiController.updateStatus',
    'DELETE /versi/deletesoft/:id': 'AppVersiController.removeSoft',
    'DELETE /versi/delete/:id': 'AppVersiController.remove',
    'DELETE /versi/deleteArrSoft/arr': 'AppVersiController.removeArrSoft',
    'DELETE /versi/deleteArr/arr': 'AppVersiController.removeArr',
    'DELETE /versi/truncate': 'AppVersiController.truncate',

    /* ************************APP MANUAL BOOK************************ */
    'GET /manualbook': 'AppManualBookController.findAll',
    'GET /manualbook/:id': 'AppManualBookController.findOne',
    'GET /manualbook/publish/active': 'AppManualBookController.findAllActive',
    'POST /manualbook/create': {
        path: 'AppManualBookController.create',
        middlewares: [ManualBookRule.createValidate]
    },
    'PUT /manualbook/update/:id': {
        path: 'AppManualBookController.update',
        middlewares: [ManualBookRule.updateValidate]
    },
    'PUT /manualbook/updateArr/status': 'AppManualBookController.updateStatus',
    'DELETE /manualbook/deletesoft/:id': 'AppManualBookController.removeSoft',
    'DELETE /manualbook/delete/:id': 'AppManualBookController.remove',
    'DELETE /manualbook/deleteArrSoft/arr': 'AppManualBookController.removeArrSoft',
    'DELETE /manualbook/deleteArr/arr': 'AppManualBookController.removeArr',
    'DELETE /manualbook/truncate': 'AppManualBookController.truncate',

    /* ************************Bptd************************ */
    'GET /bptd': 'BptdController.findAll',
    'GET /bptd/:id': 'BptdController.findOne',
    'GET /bptd/publish/active': 'BptdController.findAllActive',
    'POST /bptd/create': {
        path: 'BptdController.create',
        middlewares: [BptdRule.createValidate]
    },
    'PUT /bptd/update/:id': {
        path: 'BptdController.update',
        middlewares: [BptdRule.updateValidate]
    },
    'PUT /bptd/updateArr/status': 'BptdController.updateStatus',
    'DELETE /bptd/deletesoft/:id': 'BptdController.removeSoft',
    'DELETE /bptd/delete/:id': 'BptdController.remove',
    'DELETE /bptd/deleteArrSoft/arr': 'BptdController.removeArrSoft',
    'DELETE /bptd/deleteArr/arr': 'BptdController.removeArr',
    'DELETE /bptd/truncate': 'BptdController.truncate',

    /* ************************Provinsi************************ */
    'GET /provinsi': 'ProvinsiController.findAll',
    'GET /provinsi/:id': 'ProvinsiController.findOne',
    'GET /provinsi/publish/active': 'ProvinsiController.findAllActive',
    'POST /provinsi/create': {
        path: 'ProvinsiController.create',
        middlewares: [ProvinsiRule.createValidate]
    },
    'PUT /provinsi/update/:id': {
        path: 'ProvinsiController.update',
        middlewares: [ProvinsiRule.updateValidate]
    },
    'PUT /provinsi/updateArr/status': 'ProvinsiController.updateStatus',
    'DELETE /provinsi/delete/:id': 'ProvinsiController.remove',
    'DELETE /provinsi/deleteArr/arr': 'ProvinsiController.removeArr',
    'DELETE /provinsi/deletesoft/:id': 'ProvinsiController.removeSoft',
    'DELETE /provinsi/deleteArrSoft/arr': 'ProvinsiController.removeArrSoft',
    'DELETE /provinsi/truncate': 'ProvinsiController.truncate',
    /* ************************Kotakab************************ */
    'GET /kotakab': 'KotaController.findAll',
    'GET /kotakab/publish/paginate': 'KotaController.findPagination',
    'GET /kotakab/:id': 'KotaController.findOne',
    'GET /kotakab/publish/active': 'KotaController.findAllActive',
    'POST /kotakab/create': {
        path: 'KotaController.create',
        middlewares: [KotaRule.createValidate]
    },
    'PUT /kotakab/update/:id': {
        path: 'KotaController.update',
        middlewares: [KotaRule.updateValidate]
    },
    'PUT /kotakab/updateArr/status': 'KotaController.updateStatus',
    'DELETE /kotakab/delete/:id': 'KotaController.remove',
    'DELETE /kotakab/deleteArr/arr': 'KotaController.removeArr',
    'DELETE /kotakab/deletesoft/:id': 'KotaController.removeSoft',
    'DELETE /kotakab/deleteArrSoft/arr': 'KotaController.removeArrSoft',
    'DELETE /kotakab/truncate': 'KotaController.truncate',
    /* ************************Lokasi************************ */
    'GET /lokasi': 'LokasiController.findAll',
    'GET /lokasi/publish/paginate': 'LokasiController.findPagination',
    'GET /lokasi/resume': 'LokasiController.findResumeAll',
    'GET /lokasi/:id': 'LokasiController.findOne',
    'GET /lokasi/publish/active': 'LokasiController.findAllActive',
    'POST /lokasi/create': {
        path: 'LokasiController.create',
        middlewares: [LokasiRule.createValidate]
    },
    'PUT /lokasi/update/:id': {
        path: 'LokasiController.update',
        middlewares: [LokasiRule.updateValidate]
    },
    'PUT /lokasi/updatesync/:id/:kode': 'LokasiController.updatesync',
    'PUT /lokasi/updateArr/status': 'LokasiController.updateStatus',
    'DELETE /lokasi/delete/:id': 'LokasiController.remove',
    'DELETE /lokasi/deleteArr/arr': 'LokasiController.removeArr',
    'DELETE /lokasi/deletesoft/:id': 'LokasiController.removeSoft',
    'DELETE /lokasi/deleteArrSoft/arr': 'LokasiController.removeArrSoft',
    'DELETE /lokasi/truncate': 'LokasiController.truncate',
    /* ************************KategoriKomoditi************************ */
    'GET /kategorikomoditi/sync': 'KategoriKomoditiController.sinkronisasi',
    'GET /kategorikomoditi': 'KategoriKomoditiController.findAll',
    'GET /kategorikomoditi/:id': 'KategoriKomoditiController.findOne',
    'GET /kategorikomoditi/publish/active': 'KategoriKomoditiController.findAllActive',
    'POST /kategorikomoditi/create': {
        path: 'KategoriKomoditiController.create',
        middlewares: [kategorikomoditiRule.createValidate]
    },
    'PUT /kategorikomoditi/update/:id': {
        path: 'KategoriKomoditiController.update',
        middlewares: [kategorikomoditiRule.updateValidate]
    },
    'PUT /kategorikomoditi/updateArr/status': 'KategoriKomoditiController.updateStatus',
    'DELETE /kategorikomoditi/delete/:id': 'KategoriKomoditiController.remove',
    'DELETE /kategorikomoditi/deleteArr/arr': 'KategoriKomoditiController.removeArr',
    'DELETE /kategorikomoditi/deletesoft/:id': 'KategoriKomoditiController.removeSoft',
    'DELETE /kategorikomoditi/deleteArrSoft/arr': 'KategoriKomoditiController.removeArrSoft',
    'DELETE /kategorikomoditi/truncate': 'KategoriKomoditiController.truncate',
    /* ************************Komoditi************************ */
    'GET /komoditi/sync': 'KomoditiController.sinkronisasi',
    'GET /komoditi': 'KomoditiController.findAll',
    'GET /komoditi/:id': 'KomoditiController.findOne',
    'GET /komoditi/publish/active': 'KomoditiController.findAllActive',
    'POST /komoditi/create': {
        path: 'KomoditiController.create',
        middlewares: [komoditiRule.createValidate]
    },
    'PUT /komoditi/update/:id': {
        path: 'KomoditiController.update',
        middlewares: [komoditiRule.updateValidate]
    },
    'PUT /komoditi/updateArr/status': 'KomoditiController.updateStatus',
    'DELETE /komoditi/delete/:id': 'KomoditiController.remove',
    'DELETE /komoditi/deleteArr/arr': 'KomoditiController.removeArr',
    'DELETE /komoditi/deletesoft/:id': 'KomoditiController.removeSoft',
    'DELETE /komoditi/deleteArrSoft/arr': 'KomoditiController.removeArrSoft',
    'DELETE /komoditi/truncate': 'KomoditiController.truncate',
    /* ************************Toleransi Dimensi************************ */
    'GET /toleransidimensi/sync': 'ToleransiDimensiController.sinkronisasi',
    'GET /toleransidimensi': 'ToleransiDimensiController.findAll',
    'GET /toleransidimensi/:id': 'ToleransiDimensiController.findOne',
    'GET /toleransidimensi/publish/active': 'ToleransiDimensiController.findAllActive',
    'POST /toleransidimensi/create': 'ToleransiDimensiController.create',
    'PUT /toleransidimensi/update/:id': 'ToleransiDimensiController.update',
    'PUT /toleransidimensi/updateArr/status': 'ToleransiDimensiController.updateStatus',
    'DELETE /toleransidimensi/delete/:id': 'ToleransiDimensiController.remove',
    'DELETE /toleransidimensi/deleteArr/arr': 'ToleransiDimensiController.removeArr',
    'DELETE /toleransidimensi/deletesoft/:id': 'ToleransiDimensiController.removeSoft',
    'DELETE /toleransidimensi/deleteArrSoft/arr': 'ToleransiDimensiController.removeArrSoft',
    'DELETE /toleransidimensi/truncate': 'ToleransiDimensiController.truncate',
    /* ************************Toleransi Komoditi************************ */
    'GET /toleransikomoditi/sync': 'ToleransiKomoditiController.sinkronisasi',
    'GET /toleransikomoditi': 'ToleransiKomoditiController.findAll',
    'GET /toleransikomoditi/:id': 'ToleransiKomoditiController.findOne',
    'GET /toleransikomoditi/publish/active': 'ToleransiKomoditiController.findAllActive',
    'POST /toleransikomoditi/create': {
        path: 'ToleransiKomoditiController.create',
        middlewares: [ToleransiKomoditiRule.createValidate]
    },
    'PUT /toleransikomoditi/update/:id': {
        path: 'ToleransiKomoditiController.update',
        middlewares: [ToleransiKomoditiRule.updateValidate]
    },
    'PUT /toleransikomoditi/updateArr/status': 'ToleransiKomoditiController.updateStatus',
    'DELETE /toleransikomoditi/delete/:id': 'ToleransiKomoditiController.remove',
    'DELETE /toleransikomoditi/deleteArr/arr': 'ToleransiKomoditiController.removeArr',
    'DELETE /toleransikomoditi/deletesoft/:id': 'ToleransiKomoditiController.removeSoft',
    'DELETE /toleransikomoditi/deleteArrSoft/arr': 'ToleransiKomoditiController.removeArrSoft',
    'DELETE /toleransikomoditi/truncate': 'ToleransiKomoditiController.truncate',
    /* ************************Toleransi************************ */
    'GET /toleransi/sync': 'ToleransiController.sinkronisasi',
    'GET /toleransi': 'ToleransiController.findAll',
    'GET /toleransi/:id': 'ToleransiController.findOne',
    'GET /toleransi/publish/active': 'ToleransiController.findAllActive',
    'POST /toleransi/confirm': 'ToleransiController.confirmToleransi',
    'POST /toleransi/create': {
        path: 'ToleransiController.create',
        middlewares: [ToleransiRule.createValidate]
    },
    'PUT /toleransi/update/:id': {
        path: 'ToleransiController.update',
        middlewares: [ToleransiRule.updateValidate]
    },
    'PUT /toleransi/updateArr/status': 'ToleransiController.updateStatus',
    'DELETE /toleransi/delete/:id': 'ToleransiController.remove',
    'DELETE /toleransi/deleteArr/arr': 'ToleransiController.removeArr',
    'DELETE /toleransi/deletesoft/:id': 'ToleransiController.removeSoft',
    'DELETE /toleransi/deleteArrSoft/arr': 'ToleransiController.removeArrSoft',
    'DELETE /toleransi/truncate': 'ToleransiController.truncate',
    /* ************************ToleransiUPPKB************************ */
    'GET /toleransiuppkb': 'ToleransiUppkbController.findAll',
    'GET /toleransiuppkb/:id': 'ToleransiUppkbController.findOne',
    'GET /toleransiuppkb/publish/active': 'ToleransiUppkbController.findAllActive',
    'POST /toleransiuppkb/create': {
        path: 'ToleransiUppkbController.create',
        middlewares: [ToleransiUppkbRule.createValidate]
    },
    'PUT /toleransiuppkb/update/:id': {
        path: 'ToleransiUppkbController.update',
        middlewares: [ToleransiUppkbRule.updateValidate]
    },
    'PUT /toleransiuppkb/updateArr/status': 'ToleransiUppkbController.updateStatus',
    'DELETE /toleransiuppkb/delete/:id': 'ToleransiUppkbController.remove',
    'DELETE /toleransiuppkb/deleteArr/arr': 'ToleransiUppkbController.removeArr',
    'DELETE /toleransiuppkb/deletesoft/:id': 'ToleransiUppkbController.removeSoft',
    'DELETE /toleransiuppkb/deleteArrSoft/arr': 'ToleransiUppkbController.removeArrSoft',
    'DELETE /toleransiuppkb/truncate': 'ToleransiUppkbController.truncate',
    /* ************************JenisKendaraan************************ */
    'GET /jeniskendaraan/sync': 'JenisKendaraanController.sinkronisasi',
    'GET /jeniskendaraan': 'JenisKendaraanController.findAll',
    'GET /jeniskendaraan/:id': 'JenisKendaraanController.findOne',
    'GET /jeniskendaraan/publish/active': 'JenisKendaraanController.findAllActive',
    'POST /jeniskendaraan/create': {
        path: 'JenisKendaraanController.create',
        middlewares: [JenisKendaraanRule.createValidate]
    },
    'PUT /jeniskendaraan/update/:id': {
        path: 'JenisKendaraanController.update',
        middlewares: [JenisKendaraanRule.updateValidate]
    },
    'PUT /jeniskendaraan/updateArr/status': 'JenisKendaraanController.updateStatus',
    'DELETE /jeniskendaraan/deletesoft/:id': 'JenisKendaraanController.removeSoft',
    'DELETE /jeniskendaraan/deleteArrSoft/arr': 'JenisKendaraanController.removeArrSoft',
    'DELETE /jeniskendaraan/delete/:id': 'JenisKendaraanController.remove',
    'DELETE /jeniskendaraan/deleteArr/arr': 'JenisKendaraanController.removeArr',
    'DELETE /jeniskendaraan/truncate': 'JenisKendaraanController.truncate',
    /* ************************Sumbu************************ */
    'GET /sumbu/sync': 'SumbuController.sinkronisasi',
    'GET /sumbu': 'SumbuController.findAll',
    'GET /sumbu/:id': 'SumbuController.findOne',
    'GET /sumbu/publish/active': 'SumbuController.findAllActive',
    'POST /sumbu/create': {
        path: 'SumbuController.create',
        middlewares: [SumbuRule.createValidate]
    },
    'PUT /sumbu/update/:id': {
        path: 'SumbuController.update',
        middlewares: [SumbuRule.updateValidate]
    },
    'PUT /sumbu/updateArr/status': 'SumbuController.updateStatus',
    'DELETE /sumbu/deletesoft/:id': 'SumbuController.removeSoft',
    'DELETE /sumbu/deleteArrSoft/arr': 'SumbuController.removeArrSoft',
    'DELETE /sumbu/delete/:id': 'SumbuController.remove',
    'DELETE /sumbu/deleteArr/arr': 'SumbuController.removeArr',
    'DELETE /sumbu/truncate': 'SumbuController.truncate',
    /* ************************Satuan************************ */
    'GET /golongankendaraan': 'GolonganKendaraanController.findAll',
    'GET /golongankendaraan/:id': 'GolonganKendaraanController.findOne',
    'GET /golongankendaraan/publish/active': 'GolonganKendaraanController.findAllActive',
    'POST /golongankendaraan/create': {
        path: 'GolonganKendaraanController.create',
        middlewares: [GolonganKendaraanRule.createValidate]
    },
    'PUT /golongankendaraan/update/:id': {
        path: 'GolonganKendaraanController.update',
        middlewares: [GolonganKendaraanRule.updateValidate]
    },
    'PUT /golongankendaraan/updateArr/status': 'GolonganKendaraanController.updateStatus',
    'DELETE /golongankendaraan/deletesoft/:id': 'GolonganKendaraanController.removeSoft',
    'DELETE /golongankendaraan/deleteArrSoft/arr': 'GolonganKendaraanController.removeArrSoft',
    'DELETE /golongankendaraan/delete/:id': 'GolonganKendaraanController.remove',
    'DELETE /golongankendaraan/deleteArr/arr': 'GolonganKendaraanController.removeArr',
    'DELETE /golongankendaraan/truncate': 'GolonganKendaraanController.truncate',
    /* ************************Golongan SIM************************ */
    'GET /golsim/sync': 'GolSimController.sinkronisasi',
    'GET /golsim': 'GolSimController.findAll',
    'GET /golsim/:id': 'GolSimController.findOne',
    'GET /golsim/publish/active': 'GolSimController.findAllActive',
    'POST /golsim/create': {
        path: 'GolSimController.create',
        middlewares: [GolSimRule.createValidate]
    },
    'PUT /golsim/update/:id': {
        path: 'GolSimController.update',
        middlewares: [GolSimRule.updateValidate]
    },
    'PUT /golsim/updateArr/status': 'GolSimController.updateStatus',
    'DELETE /golsim/deletesoft/:id': 'GolSimController.removeSoft',
    'DELETE /golsim/deleteArrSoft/arr': 'GolSimController.removeArrSoft',
    'DELETE /golsim/delete/:id': 'GolSimController.remove',
    'DELETE /golsim/deleteArr/arr': 'GolSimController.removeArr',
    'DELETE /golsim/truncate': 'GolSimController.truncate',

    /* ************************Shift************************ */
    'GET /shift/now': 'ShiftController.findShiftByTime',
    'GET /shift': 'ShiftController.findAll',
    'GET /shift/:id': 'ShiftController.findOne',
    'GET /shift/publish/active': 'ShiftController.findAllActive',
    'POST /shift/create': {
        path: 'ShiftController.create',
        middlewares: [ShiftRule.createValidate]
    },
    'PUT /shift/update/:id': {
        path: 'ShiftController.update',
        middlewares: [ShiftRule.updateValidate]
    },
    'PUT /shift/updateArr/status': 'ShiftController.updateStatus',
    'DELETE /shift/deletesoft/:id': 'ShiftController.removeSoft',
    'DELETE /shift/deleteArrSoft/arr': 'ShiftController.removeArrSoft',
    'DELETE /shift/delete/:id': 'ShiftController.remove',
    'DELETE /shift/deleteArr/arr': 'ShiftController.removeArr',
    'DELETE /shift/truncate': 'ShiftController.truncate',

    /* ************************Regu************************ */
    'GET /regu': 'ReguController.findAll',
    'GET /regu/:id': 'ReguController.findOne',
    'GET /regu/publish/active': 'ReguController.findAllActive',
    'POST /regu/create': {
        path: 'ReguController.create',
        middlewares: [ReguRule.createValidate]
    },
    'PUT /regu/update/:id': {
        path: 'ReguController.update',
        middlewares: [ReguRule.updateValidate]
    },
    'PUT /regu/updateArr/status': 'ReguController.updateStatus',
    'DELETE /regu/deletesoft/:id': 'ReguController.removeSoft',
    'DELETE /regu/deleteArrSoft/arr': 'ReguController.removeArrSoft',
    'DELETE /regu/delete/:id': 'ReguController.remove',
    'DELETE /regu/deleteArr/arr': 'ReguController.removeArr',
    'DELETE /regu/truncate': 'ReguController.truncate',

    /* ************************Petugas************************ */
    'GET /petugas': 'PetugasController.findAll',
    'GET /petugas/:id': 'PetugasController.findOne',
    'GET /petugas/publish/active': 'PetugasController.findAllActive',
    'GET /petugas/uppkb/korsatpel': 'PetugasController.findKorsatpel',
    'GET /petugas/uppkb/ppns': 'PetugasController.findPpnsActive',
    'GET /petugas/uppkb/penguji': 'PetugasController.findPengujiActive',
    'POST /petugas/create': {
        path: 'PetugasController.create',
        middlewares: [PetugasRule.createValidate]
    },
    'PUT /petugas/update/:id': {
        path: 'PetugasController.update',
        middlewares: [PetugasRule.updateValidate]
    },
    'PUT /petugas/updateArr/status': 'PetugasController.updateStatus',
    'DELETE /petugas/deletesoft/:id': 'PetugasController.removeSoft',
    'DELETE /petugas/deleteArrSoft/arr': 'PetugasController.removeArrSoft',
    'DELETE /petugas/delete/:id': 'PetugasController.remove',
    'DELETE /petugas/deleteArr/arr': 'PetugasController.removeArr',
    'DELETE /petugas/truncate': 'PetugasController.truncate',

    /* ************************Timbangan************************ */
    'GET /timbangan': 'TimbanganController.findAll',
    'GET /timbangan/:id': 'TimbanganController.findOne',
    'GET /timbangan/publish/active': 'TimbanganController.findAllActive',
    'POST /timbangan/create': {
        path: 'TimbanganController.create',
        middlewares: [TimbanganRule.createValidate]
    },
    'PUT /timbangan/update/:id': {
        path: 'TimbanganController.update',
        middlewares: [TimbanganRule.updateValidate]
    },
    'PUT /timbangan/updateArr/status': 'TimbanganController.updateStatus',
    'DELETE /timbangan/deletesoft/:id': 'TimbanganController.removeSoft',
    'DELETE /timbangan/deleteArrSoft/arr': 'TimbanganController.removeArrSoft',
    'DELETE /timbangan/delete/:id': 'TimbanganController.remove',
    'DELETE /timbangan/deleteArr/arr': 'TimbanganController.removeArr',
    'DELETE /timbangan/truncate': 'TimbanganController.truncate',

    /* ************************Dokumen************************ */
    'GET /dokumen/sync': 'DokumenController.sinkronisasi',
    'GET /dokumen': 'DokumenController.findAll',
    'GET /dokumen/:id': 'DokumenController.findOne',
    'GET /dokumen/publish/active': 'DokumenController.findAllActive',
    'GET /dokumen/persyaratan/checklist': 'DokumenController.findDokumenChecked',
    'POST /dokumen/create': {
        path: 'DokumenController.create',
        middlewares: [DokumenRule.createValidate]
    },
    'PUT /dokumen/update/:id': {
        path: 'DokumenController.update',
        middlewares: [DokumenRule.updateValidate]
    },
    'PUT /dokumen/updateArr/status': 'DokumenController.updateStatus',
    'DELETE /dokumen/deletesoft/:id': 'DokumenController.removeSoft',
    'DELETE /dokumen/deleteArrSoft/arr': 'DokumenController.removeArrSoft',
    'DELETE /dokumen/delete/:id': 'DokumenController.remove',
    'DELETE /dokumen/deleteArr/arr': 'DokumenController.removeArr',
    'DELETE /dokumen/truncate': 'DokumenController.truncate',

    /* ************************Kategori Kepemilikan************************ */
    'GET /kategorikepemilikan/sync': 'KategoriKepemilikanController.sinkronisasi',
    'GET /kategorikepemilikan': 'KategoriKepemilikanController.findAll',
    'GET /kategorikepemilikan/:id': 'KategoriKepemilikanController.findOne',
    'GET /kategorikepemilikan/publish/active': 'KategoriKepemilikanController.findAllActive',
    'POST /kategorikepemilikan/create': {
        path: 'KategoriKepemilikanController.create',
        middlewares: [KategoriKepemilikanRule.createValidate]
    },
    'PUT /kategorikepemilikan/update/:id': {
        path: 'KategoriKepemilikanController.update',
        middlewares: [KategoriKepemilikanRule.updateValidate]
    },
    'PUT /kategorikepemilikan/updateArr/status': 'KategoriKepemilikanController.updateStatus',
    'DELETE /kategorikepemilikan/deletesoft/:id': 'KategoriKepemilikanController.removeSoft',
    'DELETE /kategorikepemilikan/deleteArrSoft/arr': 'KategoriKepemilikanController.removeArrSoft',
    'DELETE /kategorikepemilikan/delete/:id': 'KategoriKepemilikanController.remove',
    'DELETE /kategorikepemilikan/deleteArr/arr': 'KategoriKepemilikanController.removeArr',
    'DELETE /kategorikepemilikan/truncate': 'KategoriKepemilikanController.truncate',

    /* ************************Jenis Pelanggaran************************ */
    'GET /jenispelanggaran/sync': 'JenisPelanggaranController.sinkronisasi',
    'GET /jenispelanggaran': 'JenisPelanggaranController.findAll',
    'GET /jenispelanggaran/:id': 'JenisPelanggaranController.findOne',
    'GET /jenispelanggaran/publish/active': 'JenisPelanggaranController.findAllActive',
    'POST /jenispelanggaran/create': {
        path: 'JenisPelanggaranController.create',
        middlewares: [JenisPelanggaranRule.createValidate]
    },
    'PUT /jenispelanggaran/update/:id': {
        path: 'JenisPelanggaranController.update',
        middlewares: [JenisPelanggaranRule.updateValidate]
    },
    'PUT /jenispelanggaran/updateArr/status': 'JenisPelanggaranController.updateStatus',
    'DELETE /jenispelanggaran/deletesoft/:id': 'JenisPelanggaranController.removeSoft',
    'DELETE /jenispelanggaran/deleteArrSoft/arr': 'JenisPelanggaranController.removeArrSoft',
    'DELETE /jenispelanggaran/delete/:id': 'JenisPelanggaranController.remove',
    'DELETE /jenispelanggaran/deleteArr/arr': 'JenisPelanggaranController.removeArr',
    'DELETE /jenispelanggaran/truncate': 'JenisPelanggaranController.truncate',

    /* ************************Sanksi************************ */
    'GET /sanksi/sync': 'SanksiController.sinkronisasi',
    'GET /sanksi': 'SanksiController.findAll',
    'GET /sanksi/:id': 'SanksiController.findOne',
    'GET /sanksi/publish/active': 'SanksiController.findAllActive',
    'POST /sanksi/create': {
        path: 'SanksiController.create',
        middlewares: [SanksiRule.createValidate]
    },
    'PUT /sanksi/update/:id': {
        path: 'SanksiController.update',
        middlewares: [SanksiRule.updateValidate]
    },
    'PUT /sanksi/updateArr/status': 'SanksiController.updateStatus',
    'DELETE /sanksi/deletesoft/:id': 'SanksiController.removeSoft',
    'DELETE /sanksi/deleteArrSoft/arr': 'SanksiController.removeArrSoft',
    'DELETE /sanksi/delete/:id': 'SanksiController.remove',
    'DELETE /sanksi/deleteArr/arr': 'SanksiController.removeArr',
    'DELETE /sanksi/truncate': 'SanksiController.truncate',

    /* ************************SubSanksi************************ */
    'GET /subsanksi/sync': 'SubSanksiController.sinkronisasi',
    'GET /subsanksi': 'SubSanksiController.findAll',
    'GET /subsanksi/:id': 'SubSanksiController.findOne',
    'GET /subsanksi/publish/active': 'SubSanksiController.findAllActive',
    'POST /subsanksi/create': {
        path: 'SubSanksiController.create',
        middlewares: [SubSanksiRule.createValidate]
    },
    'PUT /subsanksi/update/:id': {
        path: 'SubSanksiController.update',
        middlewares: [SubSanksiRule.updateValidate]
    },
    'PUT /subsanksi/updateArr/status': 'SubSanksiController.updateStatus',
    'DELETE /subsanksi/deletesoft/:id': 'SubSanksiController.removeSoft',
    'DELETE /subsanksi/deleteArrSoft/arr': 'SubSanksiController.removeArrSoft',
    'DELETE /subsanksi/delete/:id': 'SubSanksiController.remove',
    'DELETE /subsanksi/deleteArr/arr': 'SubSanksiController.removeArr',
    'DELETE /subsanksi/truncate': 'SubSanksiController.truncate',

    /* ************************Sitaan************************ */
    'GET /sitaan/sync': 'SitaanController.sinkronisasi',
    'GET /sitaan': 'SitaanController.findAll',
    'GET /sitaan/:id': 'SitaanController.findOne',
    'GET /sitaan/publish/active': 'SitaanController.findAllActive',
    'POST /sitaan/create': {
        path: 'SitaanController.create',
        middlewares: [SitaanRule.createValidate]
    },
    'PUT /sitaan/update/:id': {
        path: 'SitaanController.update',
        middlewares: [SitaanRule.updateValidate]
    },
    'PUT /sitaan/updateArr/status': 'SitaanController.updateStatus',
    'DELETE /sitaan/deletesoft/:id': 'SitaanController.removeSoft',
    'DELETE /sitaan/deleteArrSoft/arr': 'SitaanController.removeArrSoft',
    'DELETE /sitaan/delete/:id': 'SitaanController.remove',
    'DELETE /sitaan/deleteArr/arr': 'SitaanController.removeArr',
    'DELETE /sitaan/truncate': 'SitaanController.truncate',

    /* ************************Pasal************************ */
    'GET /pasal/sync': 'PasalController.sinkronisasi',
    'GET /pasal': 'PasalController.findAll',
    'GET /pasal/:id': 'PasalController.findOne',
    'GET /pasal/publish/active': 'PasalController.findAllActive',
    'POST /pasal/create': {
        path: 'PasalController.create',
        middlewares: [PasalRule.createValidate]
    },
    'PUT /pasal/update/:id': {
        path: 'PasalController.update',
        middlewares: [PasalRule.updateValidate]
    },
    'PUT /pasal/updateArr/status': 'PasalController.updateStatus',
    'DELETE /pasal/deletesoft/:id': 'PasalController.removeSoft',
    'DELETE /pasal/deleteArrSoft/arr': 'PasalController.removeArrSoft',
    'DELETE /pasal/delete/:id': 'PasalController.remove',
    'DELETE /pasal/deleteArr/arr': 'PasalController.removeArr',
    'DELETE /pasal/truncate': 'PasalController.truncate',

    /* ************************Sanksi************************ */
    'GET /sanksipelanggaran': 'SanksiPelanggaranController.findAll',
    'GET /sanksipelanggaran/:id': 'SanksiPelanggaranController.findOne',
    'GET /sanksipelanggaran/publish/active': 'SanksiPelanggaranController.findAllActive',
    'POST /sanksipelanggaran/create': {
        path: 'SanksiPelanggaranController.create',
        middlewares: [SanksiPelanggaranRule.createValidate]
    },
    'PUT /sanksipelanggaran/update/:id': {
        path: 'SanksiPelanggaranController.update',
        middlewares: [SanksiPelanggaranRule.updateValidate]
    },
    'PUT /sanksipelanggaran/updateArr/status': 'SanksiPelanggaranController.updateStatus',
    'DELETE /sanksipelanggaran/deletesoft/:id': 'SanksiPelanggaranController.removeSoft',
    'DELETE /sanksipelanggaran/deleteArrSoft/arr': 'SanksiPelanggaranController.removeArrSoft',
    'DELETE /sanksipelanggaran/delete/:id': 'SanksiPelanggaranController.remove',
    'DELETE /sanksipelanggaran/deleteArr/arr': 'SanksiPelanggaranController.removeArr',
    'DELETE /sanksipelanggaran/truncate': 'SanksiPelanggaranController.truncate',

    /* ************************Pengadilan************************ */
    'GET /pengadilan': 'PengadilanController.findAll',
    'GET /pengadilan/:id': 'PengadilanController.findOne',
    'GET /pengadilan/publish/active': 'PengadilanController.findAllActive',
    'POST /pengadilan/create': {
        path: 'PengadilanController.create',
        middlewares: [PengadilanRule.createValidate]
    },
    'PUT /pengadilan/update/:id': {
        path: 'PengadilanController.update',
        middlewares: [PengadilanRule.updateValidate]
    },
    'PUT /pengadilan/updateArr/status': 'PengadilanController.updateStatus',
    'DELETE /pengadilan/deletesoft/:id': 'PengadilanController.removeSoft',
    'DELETE /pengadilan/deleteArrSoft/arr': 'PengadilanController.removeArrSoft',
    'DELETE /pengadilan/delete/:id': 'PengadilanController.remove',
    'DELETE /pengadilan/deleteArr/arr': 'PengadilanController.removeArr',
    'DELETE /pengadilan/truncate': 'PengadilanController.truncate',

    /* ************************Kejaksaan************************ */
    'GET /kejaksaan': 'KejaksaanController.findAll',
    'GET /kejaksaan/:id': 'KejaksaanController.findOne',
    'GET /kejaksaan/publish/active': 'KejaksaanController.findAllActive',
    'POST /kejaksaan/create': {
        path: 'KejaksaanController.create',
        middlewares: [KejaksaanRule.createValidate]
    },
    'PUT /kejaksaan/update/:id': {
        path: 'KejaksaanController.update',
        middlewares: [KejaksaanRule.updateValidate]
    },
    'PUT /kejaksaan/updateArr/status': 'KejaksaanController.updateStatus',
    'DELETE /kejaksaan/deletesoft/:id': 'KejaksaanController.removeSoft',
    'DELETE /kejaksaan/deleteArrSoft/arr': 'KejaksaanController.removeArrSoft',
    'DELETE /kejaksaan/delete/:id': 'KejaksaanController.remove',
    'DELETE /kejaksaan/deleteArr/arr': 'KejaksaanController.removeArr',
    'DELETE /kejaksaan/truncate': 'KejaksaanController.truncate',

    /* ************************Kendaraan************************ */
    'GET /kendaraan': 'KendaraanController.findAll',
    'GET /kendaraan/ujiberkala': 'KendaraanController.findUjiberkala',
    'GET /kendaraan/qrcode': 'KendaraanController.findQrcode',
    'GET /kendaraan/:id': 'KendaraanController.findOne',
    'GET /kendaraan/publish/active': 'KendaraanController.findAllActive',
    'POST /kendaraan/create': {
        path: 'KendaraanController.create',
        middlewares: [KendaraanRule.createValidate]
    },
    'PUT /kendaraan/update/:id': {
        path: 'KendaraanController.update',
        middlewares: [KendaraanRule.updateValidate]
    },
    'PUT /kendaraan/updateArr/status': 'KendaraanController.updateStatus',
    'DELETE /kendaraan/deletesoft/:id': 'KendaraanController.removeSoft',
    'DELETE /kendaraan/deleteArrSoft/arr': 'KendaraanController.removeArrSoft',
    'DELETE /kendaraan/delete/:id': 'KendaraanController.remove',
    'DELETE /kendaraan/deleteArr/arr': 'KendaraanController.removeArr',
    'DELETE /kendaraan/truncate': 'KendaraanController.truncate',

    /* ************************Detail Muatan************************ */
    'GET /detailmuatan': 'DetailMuatanController.findAll',
    'POST /detailmuatan/create': 'DetailMuatanController.create',
    'PUT /detailmuatan/update/:id': 'DetailMuatanController.update',
    'DELETE /detailmuatan/deletesoft/:id': 'DetailMuatanController.removeSoft',
    'DELETE /detailmuatan/delete/:id': 'DetailMuatanController.remove',
    'DELETE /detailmuatan/truncate': 'DetailMuatanController.truncate',

    /* ************************Detail Dokumen************************ */
    'GET /detaildokumen': 'DetailDokumenController.findAll',
    'GET /detaildokumen/kelengkapan': 'DetailDokumenController.findKelengkapanDokumen',
    'POST /detaildokumen/create': 'DetailDokumenController.create',
    'PUT /detaildokumen/update/:id': 'DetailDokumenController.update',
    'DELETE /detaildokumen/deletesoft/:id': 'DetailDokumenController.removeSoft',
    'DELETE /detaildokumen/delete/:id': 'DetailDokumenController.remove',
    'DELETE /detaildokumen/truncate': 'DetailDokumenController.truncate',

    /* ************************Detail Dimensi************************ */
    'GET /detaildimensi': 'DetailDimensiController.findAll',
    'POST /detaildimensi/calc': 'DetailDimensiController.findToleransiDimensiManual',
    'POST /detaildimensi/create': 'DetailDimensiController.create',
    'POST /detaildimensi/sink': 'DetailDimensiController.sinkDetailDimensi',
    'PUT /detaildimensi/update/:id': 'DetailDimensiController.update',
    'DELETE /detaildimensi/deletesoft/:id': 'DetailDimensiController.removeSoft',
    'DELETE /detaildimensi/delete/:id': 'DetailDimensiController.remove',
    'DELETE /detaildimensi/truncate': 'DetailDimensiController.truncate',

    /* ************************Detail Ramcek************************ */
    'GET /detailramcek': 'DetailRamcekController.findAll',
    'POST /detailramcek/create': 'DetailRamcekController.create',
    'POST /detailramcek/sink': 'DetailRamcekController.sinkDetailRamcek',
    'PUT /detailramcek/update/:id': 'DetailRamcekController.update',
    'DELETE /detailramcek/deletesoft/:id': 'DetailRamcekController.removeSoft',
    'DELETE /detailramcek/delete/:id': 'DetailRamcekController.remove',
    'DELETE /detailramcek/truncate': 'DetailRamcekController.truncate',

    /* ************************Histori Manifest************************ */
    // 'GET /histori/manifest': 'EmanifestController.findAll',

    /* ************************Detail Dokumen Temp************************ */
    'GET /detaildokumentemp': 'DetailDokumenTempController.findAll',
    'POST /detaildokumentemp/create': 'DetailDokumenTempController.create',
    'PUT /detaildokumentemp/update/:id': 'DetailDokumenTempController.update',
    'DELETE /detaildokumentemp/deletesoft/:id': 'DetailDokumenTempController.removeSoft',
    'DELETE /detaildokumentemp/delete/:id': 'DetailDokumenTempController.remove',
    'DELETE /detaildokumentemp/truncate': 'DetailDokumenTempController.truncate',
    /* ************************Integrasi************************ */
    'GET /integrasi/ujiberkala': 'IntegrasiController.findUjiberkala',
    'GET /integrasi/qr': 'IntegrasiController.findQrScan',
    /* ************************Penimbangan************************ */
    'POST /penimbangan/jalur': 'PenimbanganWimController.automaticLane',
    'GET /penimbangan/testing/data/sync/get': 'PenimbanganController.testingsync',
    'GET /penimbangan/datawim': 'PenimbanganWimController.dataWim',
    'GET /penimbangan/datawimpusat': 'PenimbanganWimController.dataWimPusat',
    'GET /penimbangan/datawim/detail/:id': 'PenimbanganWimController.dataWimById',
    'GET /penimbangan/printtimbangwim': 'PenimbanganWimController.printPenimbanganWim',
    'GET /penimbangan/xlspenimbanganwim': 'PenimbanganWimController.xlsPenimbanganWim',
    'GET /penimbangan/print/thermal/:id': 'PenimbanganController.printThermal',
    'GET /penimbangan/print/thermal': 'PenimbanganController.printThermal',
    'POST /penimbangan/print/thermal': 'PenimbanganController.printThermal',
    'GET /penimbangan': 'PenimbanganController.findAll',
    'GET /penimbangan/publish/paginate': 'PenimbanganController.findPagination',
    'GET /penimbangan/:id': 'PenimbanganController.findOne',
    'GET /penimbangan/publish/active': 'PenimbanganController.findAllActive',
    'GET /penimbangan/find/live/count': 'PenimbanganController.findLiveCount',
    'GET /penimbangan/sensor/dimensi/read': 'PenimbanganController.readDimensi',
    'POST /penimbangan/findpelanggaran': 'PenimbanganController.findPelanggaran',
    'POST /penimbangan/findhistori': 'PenimbanganController.findHistori',
    'POST /penimbangan/findtoleransi': 'PenimbanganController.useToleransiKomoditi',
    'POST /penimbangan/capture/cctv': 'PenimbanganController.captureImg',
    'POST /penimbangan/createwim': 'PenimbanganController.createLogWim',
    'POST /penimbangan/createwimsync': 'PenimbanganWimController.createSyncWimData',
    'POST /penimbangan/create': 'PenimbanganController.create',
    'POST /penimbangan/sink': 'PenimbanganController.sinkPenimbangan',
    'POST /penimbangan/sinkupsert': 'PenimbanganController.sinkUpsertPenimbangan',
    'POST /penimbangan/updatebytrx': 'PenimbanganController.updateTrxByKode',
    'POST /penimbangan/updatebytrxpelanggaran': 'PenimbanganController.updateTrxByKodePelanggaran',
    'PUT /penimbangan/update/:id': 'PenimbanganController.update',
    'PUT /penimbangan/updateArr/status': 'PenimbanganController.updateStatus',
    'DELETE /penimbangan/delete/:id': 'PenimbanganController.remove',
    'DELETE /penimbangan/deleteArr/arr': 'PenimbanganController.removeArr',
    'DELETE /penimbangan/deletesoft/:id': 'PenimbanganController.removeSoft',
    'DELETE /penimbangan/deleteArrSoft/arr': 'PenimbanganController.removeArrSoft',
    'DELETE /penimbangan/truncate': 'PenimbanganController.truncate',

    /* ************************Gate Control************************ */
    'POST /gate/control': 'GateTcpController.openCloseGate',
    /* ************************Pelanggaran************************ */
    'GET /pelanggaran': 'PelanggaranController.findAll',
    'GET /pelanggaran/:id': 'PelanggaranController.findOne',
    'GET /pelanggaran/publish/active': 'PelanggaranController.findAllActive',
    'POST /pelanggaran/create': 'PelanggaranController.create',
    // 'POST /pelanggaran/create/withimage': 'PelanggaranController.createWithImage',
    // 'POST /pelanggaran/create/fromsync': 'PelanggaranController.createFromSync',
    'PUT /pelanggaran/update/:id': 'PelanggaranController.update',
    'PUT /pelanggaran/updateArr/status': 'PelanggaranController.updateStatus',
    'DELETE /pelanggaran/delete/:id': 'PelanggaranController.remove',
    'DELETE /pelanggaran/deleteArr/arr': 'PelanggaranController.removeArr',
    'DELETE /pelanggaran/deletesoft/:id': 'PelanggaranController.removeSoft',
    'DELETE /pelanggaran/deleteArrSoft/arr': 'PelanggaranController.removeArrSoft',
    'DELETE /pelanggaran/truncate': 'PelanggaranController.truncate',
    /* ************************Penindakan************************ */
    'GET /penindakan': 'PenindakanController.findAll',
    'GET /penindakan/:id': 'PenindakanController.findOne',
    'GET /penindakan/publish/active': 'PenindakanController.findAllActive',
    'GET /penindakan/etilang/downloadba': 'PenindakanController.downloadBATilang',
    'GET /penindakan/blanko/print': 'PenindakanController.printPenindakan',
    'POST /penindakan/create': 'PenindakanController.create',
    'POST /penindakan/sink': 'PenindakanController.sinkPenindakan',
    'PUT /penindakan/update/:id': 'PenindakanController.update',
    'PUT /penindakan/updateArr/status': 'PenindakanController.updateStatus',
    'DELETE /penindakan/delete/:id': 'PenindakanController.remove',
    'DELETE /penindakan/deleteArr/arr': 'PenindakanController.removeArr',
    'DELETE /penindakan/deletesoft/:id': 'PenindakanController.removeSoft',
    'DELETE /penindakan/deleteArrSoft/arr': 'PenindakanController.removeArrSoft',
    'DELETE /penindakan/truncate': 'PenindakanController.truncate',
    /* ************************Detail Tindakan Pasal************************ */
    'GET /detailpasal': 'DetailTindakanPasalController.findAll',
    'POST /detailpasal/create': 'DetailTindakanPasalController.create',
    'PUT /detailpasal/update/:id': 'DetailTindakanPasalController.update',
    'DELETE /detailpasal/deletesoft/:id': 'DetailTindakanPasalController.removeSoft',
    'DELETE /detailpasal/delete/:id': 'DetailTindakanPasalController.remove',
    'DELETE /detailpasal/truncate': 'DetailTindakanPasalController.truncate',
    /* ************************Detail Tindakan Sanksi************************ */
    'GET /detailsanksi': 'DetailTindakanSanksiController.findAll',
    'POST /detailsanksi/create': 'DetailTindakanSanksiController.create',
    'PUT /detailsanksi/update/:id': 'DetailTindakanSanksiController.update',
    'DELETE /detailsanksi/deletesoft/:id': 'DetailTindakanSanksiController.removeSoft',
    'DELETE /detailsanksi/delete/:id': 'DetailTindakanSanksiController.remove',
    'DELETE /detailsanksi/truncate': 'DetailTindakanSanksiController.truncate',
    /* ************************Detail Tindakan Sitaan************************ */
    'GET /detailsitaan': 'DetailTindakanSitaanController.findAll',
    'POST /detailsitaan/create': 'DetailTindakanSitaanController.create',
    'PUT /detailsitaan/update/:id': 'DetailTindakanSitaanController.update',
    'DELETE /detailsitaan/deletesoft/:id': 'DetailTindakanSitaanController.removeSoft',
    'DELETE /detailsitaan/delete/:id': 'DetailTindakanSitaanController.remove',
    'DELETE /detailsitaan/truncate': 'DetailTindakanSitaanController.truncate',
    /* ************************Transfer Muat************************ */
    'GET /transfermuat': 'TransferMuatController.findAll',
    'GET /transfermuat/:id': 'TransferMuatController.findOne',
    'GET /transfermuat/publish/active': 'TransferMuatController.findAllActive',
    'POST /transfermuat/create': 'TransferMuatController.create',
    'POST /transfermuat/sink': 'TransferMuatController.sinkTransferMuat',
    'PUT /transfermuat/update/:id': 'TransferMuatController.update',
    'PUT /transfermuat/updateArr/status': 'TransferMuatController.updateStatus',
    'DELETE /transfermuat/delete/:id': 'TransferMuatController.remove',
    'DELETE /transfermuat/deleteArr/arr': 'TransferMuatController.removeArr',
    'DELETE /transfermuat/deletesoft/:id': 'TransferMuatController.removeSoft',
    'DELETE /transfermuat/deleteArrSoft/arr': 'TransferMuatController.removeArrSoft',
    'DELETE /transfermuat/truncate': 'TransferMuatController.truncate',

    /* ************************ Pengawasan ************************ */
    'GET /pengawasan/printtimbang': 'PengawasanController.printPenimbangan',
    'GET /pengawasan/printtimbangkios': 'PengawasanController.printPenimbanganKios',
    'GET /pengawasan/printpenimbangan': 'PengawasanController.pengawasanPenimbangan',
    'GET /pengawasan/printpelanggaran': 'PengawasanController.pengawasanPelanggaran',
    'GET /pengawasan/printpenindakan': 'PengawasanController.pengawasanPenindakan',
    'GET /pengawasan/printtransfermuat': 'PengawasanController.pengawasanTransferMuat',
    'GET /pengawasan/printpengukurandimensi': 'PengawasanController.pengawasanPengukuranDimensi',
    'GET /pengawasan/printramcek': 'PengawasanController.pengawasanRamcek',
    'GET /pengawasan/xlspenimbangan': 'PengawasanController.pengawasanXlsPenimbangan',
    'GET /pengawasan/xlspelanggaran': 'PengawasanController.pengawasanXlsPelanggaran',
    'GET /pengawasan/xlspenindakan': 'PengawasanController.pengawasanXlsPenindakan',
    'GET /pengawasan/xlstransfermuat': 'PengawasanController.pengawasanXlsTransferMuat',

    /* ************************ Laporan ************************ */
    'GET /laporan/lappengawasan': 'LaporanController.laporanPengawasan',
    'GET /laporan/lappengawasan/print': 'LaporanController.printLaporanPengawasan',
    'GET /laporan/printpengawasan': 'LaporanController.printLaporanPengawasan',
    'GET /laporan/xlspengawasan': 'LaporanController.xlsLaporanPengawasan',
    'GET /laporan/laplebihmuat': 'LaporanController.laporanLebihMuatan',
    'GET /laporan/printlebihmuat': 'LaporanController.printLaporanLebihMuatan',
    'GET /laporan/xlslebihmuat': 'LaporanController.xlsLaporanLebihMuatan',
    'GET /laporan/lapwim': 'LaporanController.laporanWim',
    'GET /laporan/printwim': 'LaporanController.printLaporanWim',
    'GET /laporan/xlswim': 'LaporanController.xlsLaporanWim',
    'GET /laporan/lapaset': 'LaporanController.laporanAset',
    'GET /laporan/printlaporanaset': 'LaporanController.printLaporanAset',
    'GET /laporan/xlslaporanaset': 'LaporanController.xlsLaporanAset',
    'GET /laporan/lappengaduan': 'LaporanController.laporanPengaduan',
    'GET /laporan/printlaporanpengaduan': 'LaporanController.printLaporanPengaduan',
    'GET /laporan/xlslaporanpengaduan': 'LaporanController.xlsLaporanPengaduan',

    /* ************************ LHR Log New ************************ */
    'GET /lhrnew': 'LhrLogNewController.getAll',
    'GET /lhrnew/by': 'LhrLogNewController.getBy',
    'POST /lhrnew/upsert': 'LhrLogNewController.upsert',
    'GET /lhrnew/filter': {
        path: 'LhrLogNewController.filter',
        middlewares: [LhrnewRule.filter]
    },
    'GET /lhrnew/xlslhr': 'LhrLogNewController.xlsLhr',
    'GET /lhrnew/printlhr': 'LhrLogNewController.printLhr',

    /* ************************ Kategori Aset ************************ */
    'GET /kategoriaset': 'KategoriAsetController.findAll',
    'GET /kategoriaset/:id': 'KategoriAsetController.findOne',
    'GET /kategoriaset/publish/active': 'KategoriAsetController.findAllActive',
    'POST /kategoriaset/create': {
        path: 'KategoriAsetController.create',
        middlewares: [KategoriAsetRule.createValidate]
    },
    'PUT /kategoriaset/update/:id': {
        path: 'KategoriAsetController.update',
        middlewares: [KategoriAsetRule.updateValidate]
    },
    'PUT /kategoriaset/updateArr/status': 'KategoriAsetController.updateStatus',
    'DELETE /kategoriaset/deletesoft/:id': 'KategoriAsetController.removeSoft',
    'DELETE /kategoriaset/delete/:id': 'KategoriAsetController.remove',
    'DELETE /kategoriaset/deleteArrSoft/arr': 'KategoriAsetController.removeArrSoft',
    'DELETE /kategoriaset/deleteArr/arr': 'KategoriAsetController.removeArr',
    'DELETE /kategoriaset/truncate': 'KategoriAsetController.truncate',

    /* ************************ Kondisi Aset ************************ */
    'GET /kondisiaset': 'KondisiAsetController.findAll',
    'GET /kondisiaset/:id': 'KondisiAsetController.findOne',
    'GET /kondisiaset/publish/active': 'KondisiAsetController.findAllActive',
    'POST /kondisiaset/create': {
        path: 'KondisiAsetController.create',
        middlewares: [KondisiAsetRule.createValidate]
    },
    'PUT /kondisiaset/update/:id': {
        path: 'KondisiAsetController.update',
        middlewares: [KondisiAsetRule.updateValidate]
    },
    'PUT /kondisiaset/updateArr/status': 'KondisiAsetController.updateStatus',
    'DELETE /kondisiaset/deletesoft/:id': 'KondisiAsetController.removeSoft',
    'DELETE /kondisiaset/delete/:id': 'KondisiAsetController.remove',
    'DELETE /kondisiaset/deleteArrSoft/arr': 'KondisiAsetController.removeArrSoft',
    'DELETE /kondisiaset/deleteArr/arr': 'KondisiAsetController.removeArr',
    'DELETE /kondisiaset/truncate': 'KondisiAsetController.truncate',

    /* ************************ Kegiatan Aset ************************ */
    'GET /kegiatan': 'KegiatanController.findAll',
    'GET /kegiatan/xlskegiatan': 'KegiatanController.xlsKegiatan',
    'GET /kegiatan/printkegiatan': 'KegiatanController.printKegiatan',
    'GET /kegiatan/printdetailkegiatan': 'KegiatanController.printDetailKegiatan',
    'GET /kegiatan/xlsdetailkegiatan': 'KegiatanController.xlsDetailKegiatan',
    'GET /kegiatan/:id': 'KegiatanController.findOne',
    'GET /kegiatan/publish/active': 'KegiatanController.findAllActive',
    'POST /kegiatan/create': {
        path: 'KegiatanController.create',
        middlewares: [KegiatanRule.createValidate]
    },
    'PUT /kegiatan/update/:id': {
        path: 'KegiatanController.update',
        middlewares: [KegiatanRule.updateValidate]
    },
    'PUT /kegiatan/updateArr/status': 'KegiatanController.updateStatus',
    'DELETE /kegiatan/deletesoft/:id': 'KegiatanController.removeSoft',
    'DELETE /kegiatan/delete/:id': 'KegiatanController.remove',
    'DELETE /kegiatan/deleteArrSoft/arr': 'KegiatanController.removeArrSoft',
    'DELETE /kegiatan/deleteArr/arr': 'KegiatanController.removeArr',
    'DELETE /kegiatan/truncate': 'KegiatanController.truncate',

    /* ************************ Satuan Aset ************************ */
    'GET /satuanaset': 'SatuanAsetController.findAll',
    'GET /satuanaset/:id': 'SatuanAsetController.findOne',
    'GET /satuanaset/publish/active': 'SatuanAsetController.findAllActive',
    'POST /satuanaset/create': {
        path: 'SatuanAsetController.create',
        middlewares: [SatuanRule.createValidate]
    },
    'PUT /satuanaset/update/:id': {
        path: 'SatuanAsetController.update',
        middlewares: [SatuanRule.updateValidate]
    },
    'PUT /satuanaset/updateArr/status': 'SatuanAsetController.updateStatus',
    'DELETE /satuanaset/deletesoft/:id': 'SatuanAsetController.removeSoft',
    'DELETE /satuanaset/delete/:id': 'SatuanAsetController.remove',
    'DELETE /satuanaset/deleteArrSoft/arr': 'SatuanAsetController.removeArrSoft',
    'DELETE /satuanaset/deleteArr/arr': 'SatuanAsetController.removeArr',
    'DELETE /satuanaset/truncate': 'SatuanAsetController.truncate',

    /* ************************ Manjemen Aset ************************ */
    'GET /aset': 'AsetController.findAll',
    'GET /aset/publish/paginate': 'AsetController.findPagination',
    'GET /aset/publish/nup': 'AsetController.findNup',
    'GET /aset/xlsaset': 'AsetController.xlsAset',
    'GET /aset/printaset': 'AsetController.printAset',
    'GET /aset/:id': 'AsetController.findOne',
    'GET /aset/publish/active': 'AsetController.findAllActive',
    'POST /aset/create': {
        path: 'AsetController.create',
        middlewares: [AsetRule.createValidate]
    },
    'POST /asetusulan/create': 'AsetController.create',
    'PUT /aset/update/:id': {
        path: 'AsetController.update',
        middlewares: [AsetRule.updateValidate]
    },
    'PUT /aset/updateArr/kondisi': 'AsetController.updateKondisi',
    'PUT /aset/updateArr/status': 'AsetController.updateStatus',
    'DELETE /aset/deletesoft/:id': 'AsetController.removeSoft',
    'DELETE /aset/delete/:id': 'AsetController.remove',
    'DELETE /aset/deleteArrSoft/arr': 'AsetController.removeArrSoft',
    'DELETE /aset/deleteArr/arr': 'AsetController.removeArr',
    'DELETE /aset/truncate': 'AsetController.truncate',

    /* ************************ Manjemen Aset Temporary ************************ */
    'GET /asettemp/publish/paginate': 'AsetTempController.findPagination',
    'GET /asettemp/:id': 'AsetTempController.findOne',
    'GET /asettemp/publish/active': 'AsetTempController.findAllActive',
    'POST /asettemp/create': 'AsetTempController.create',
    'PUT /asettemp/update/:id': 'AsetTempController.update',
    'PUT /asettemp/updateArr/status': 'AsetTempController.updateStatus',
    'DELETE /asettemp/deletesoft/:id': 'AsetTempController.removeSoft',
    'DELETE /asettemp/delete/:id': 'AsetTempController.remove',
    'DELETE /asettemp/deleteArrSoft/arr': 'AsetTempController.removeArrSoft',
    'DELETE /asettemp/deleteArr/arr': 'AsetTempController.removeArr',
    'DELETE /asettemp/truncate': 'AsetTempController.truncate',

    /* ************************ Vendor ************************ */
    'GET /vendor': 'VendorController.findAll',
    'GET /vendor/:id': 'VendorController.findOne',
    'GET /vendor/publish/active': 'VendorController.findAllActive',
    'POST /vendor/create': {
        path: 'VendorController.create',
        middlewares: [VendorRule.createValidate]
    },
    'PUT /vendor/update/:id': {
        path: 'VendorController.update',
        middlewares: [VendorRule.updateValidate]
    },
    'PUT /vendor/updateArr/status': 'VendorController.updateStatus',
    'DELETE /vendor/deletesoft/:id': 'VendorController.removeSoft',
    'DELETE /vendor/delete/:id': 'VendorController.remove',
    'DELETE /vendor/deleteArrSoft/arr': 'VendorController.removeArrSoft',
    'DELETE /vendor/deleteArr/arr': 'VendorController.removeArr',
    'DELETE /vendor/truncate': 'VendorController.truncate',

    /* ************************ Direktorat ************************ */
    'GET /direktorat': 'DirektoratController.findAll',
    'GET /direktorat/:id': 'DirektoratController.findOne',
    'GET /direktorat/publish/active': 'DirektoratController.findAllActive',
    'POST /direktorat/create': {
        path: 'DirektoratController.create',
        middlewares: [DirektoratRule.createValidate]
    },
    'PUT /direktorat/update/:id': {
        path: 'DirektoratController.update',
        middlewares: [DirektoratRule.updateValidate]
    },
    'PUT /direktorat/updateArr/status': 'DirektoratController.updateStatus',
    'DELETE /direktorat/deletesoft/:id': 'DirektoratController.removeSoft',
    'DELETE /direktorat/delete/:id': 'DirektoratController.remove',
    'DELETE /direktorat/deleteArrSoft/arr': 'DirektoratController.removeArrSoft',
    'DELETE /direktorat/deleteArr/arr': 'DirektoratController.removeArr',
    'DELETE /direktorat/truncate': 'DirektoratController.truncate',

    /* ************************ Streaming ************************ */
    'GET /streaming': 'StreamingController.findAll',
    'GET /streaming/xlsstreaming': 'StreamingController.xlsStreaming',
    'GET /streaming/printstreaming': 'StreamingController.printStreaming',
    'GET /streaming/:id': 'StreamingController.findOne',
    'GET /streaming/publish/active': 'StreamingController.findAllActive',
    'GET /streaming/publish/lokasi': 'StreamingController.findAllLokasi',
    'GET /streaming/publish/sink': 'StreamingController.sinkStreaming',
    'POST /streaming/create': 'StreamingController.create',
    'PUT /streaming/update/:id': 'StreamingController.update',
    'PUT /streaming/updateArr/status': 'StreamingController.updateStatus',
    'DELETE /streaming/deletesoft/:id': 'StreamingController.removeSoft',
    'DELETE /streaming/delete/:id': 'StreamingController.remove',
    'DELETE /streaming/deleteArrSoft/arr': 'StreamingController.removeArrSoft',
    'DELETE /streaming/deleteArr/arr': 'StreamingController.removeArr',
    'DELETE /streaming/truncate': 'StreamingController.truncate',

    /* ************************ Tipe CCTV ************************ */
    'GET /tipecctv': 'TipeCctvController.findAll',
    'GET /tipecctv/:id': 'TipeCctvController.findOne',
    'GET /tipecctv/publish/active': 'TipeCctvController.findAllActive',
    'POST /tipecctv/create': {
        path: 'TipeCctvController.create',
        middlewares: [TipeCctvRule.createValidate]
    },
    'PUT /tipecctv/update/:id': {
        path: 'TipeCctvController.update',
        middlewares: [TipeCctvRule.updateValidate]
    },
    'PUT /tipecctv/updateArr/status': 'TipeCctvController.updateStatus',
    'DELETE /tipecctv/deletesoft/:id': 'TipeCctvController.removeSoft',
    'DELETE /tipecctv/delete/:id': 'TipeCctvController.remove',
    'DELETE /tipecctv/deleteArrSoft/arr': 'TipeCctvController.removeArrSoft',
    'DELETE /tipecctv/deleteArr/arr': 'TipeCctvController.removeArr',
    'DELETE /tipecctv/truncate': 'TipeCctvController.truncate',

    /* ************************ Tipe Source CCTV ************************ */
    'GET /tipesourcecctv': 'TipeSourceCctvController.findAll',
    'GET /tipesourcecctv/:id': 'TipeSourceCctvController.findOne',
    'GET /tipesourcecctv/publish/active': 'TipeSourceCctvController.findAllActive',
    'POST /tipesourcecctv/create': {
        path: 'TipeSourceCctvController.create',
        middlewares: [TipeSourceCctvRule.createValidate]
    },
    'PUT /tipesourcecctv/update/:id': {
        path: 'TipeSourceCctvController.update',
        middlewares: [TipeSourceCctvRule.updateValidate]
    },
    'PUT /tipesourcecctv/updateArr/status': 'TipeSourceCctvController.updateStatus',
    'DELETE /tipesourcecctv/deletesoft/:id': 'TipeSourceCctvController.removeSoft',
    'DELETE /tipesourcecctv/delete/:id': 'TipeSourceCctvController.remove',
    'DELETE /tipesourcecctv/deleteArrSoft/arr': 'TipeSourceCctvController.removeArrSoft',
    'DELETE /tipesourcecctv/deleteArr/arr': 'TipeSourceCctvController.removeArr',
    'DELETE /tipesourcecctv/truncate': 'TipeSourceCctvController.truncate',

    /* ************************ Posisi CCTV Platform ************************ */
    'GET /posisicctvplatform': 'PosisiCctvPlatformController.findAll',
    'GET /posisicctvplatform/:id': 'PosisiCctvPlatformController.findOne',
    'GET /posisicctvplatform/publish/active': 'PosisiCctvPlatformController.findAllActive',
    'POST /posisicctvplatform/create': {
        path: 'PosisiCctvPlatformController.create',
        middlewares: [PosisiCctvPlatformRule.createValidate]
    },
    'PUT /posisicctvplatform/update/:id': {
        path: 'PosisiCctvPlatformController.update',
        middlewares: [PosisiCctvPlatformRule.updateValidate]
    },
    'PUT /posisicctvplatform/updateArr/status': 'PosisiCctvPlatformController.updateStatus',
    'DELETE /posisicctvplatform/deletesoft/:id': 'PosisiCctvPlatformController.removeSoft',
    'DELETE /posisicctvplatform/delete/:id': 'PosisiCctvPlatformController.remove',
    'DELETE /posisicctvplatform/deleteArrSoft/arr': 'PosisiCctvPlatformController.removeArrSoft',
    'DELETE /posisicctvplatform/deleteArr/arr': 'PosisiCctvPlatformController.removeArr',
    'DELETE /posisicctvplatform/truncate': 'PosisiCctvPlatformController.truncate',

    /* ************************PrioritasAduan************************ */
    // 'GET /prioritasaduan/sync': 'PrioritasAduanController.sinkronisasi',
    'GET /prioritasaduan': 'PrioritasAduanController.findAll',
    'GET /prioritasaduan/:id': 'PrioritasAduanController.findOne',
    'GET /prioritasaduan/publish/active': 'PrioritasAduanController.findAllActive',
    'POST /prioritasaduan/create': {
        path: 'PrioritasAduanController.create',
        middlewares: [prioritasaduanRule.createValidate]
    },
    'PUT /prioritasaduan/update/:id': {
        path: 'PrioritasAduanController.update',
        middlewares: [prioritasaduanRule.updateValidate]
    },
    'PUT /prioritasaduan/updateArr/status': 'PrioritasAduanController.updateStatus',
    'DELETE /prioritasaduan/delete/:id': 'PrioritasAduanController.remove',
    'DELETE /prioritasaduan/deleteArr/arr': 'PrioritasAduanController.removeArr',
    'DELETE /prioritasaduan/deletesoft/:id': 'PrioritasAduanController.removeSoft',
    'DELETE /prioritasaduan/deleteArrSoft/arr': 'PrioritasAduanController.removeArrSoft',
    'DELETE /prioritasaduan/truncate': 'PrioritasAduanController.truncate',

    /* ************************Pengaduan************************ */
    // 'GET /kategoripengaduan/sync': 'KategoriPengaduanController.sinkronisasi',
    'GET /pengaduan': 'PengaduanController.findAll',
    'GET /pengaduan/:id': 'PengaduanController.findOne',
    'GET /pengaduan/publish/active': 'PengaduanController.findAllActive',
    'POST /pengaduan/create': {
        path: 'PengaduanController.create',
        middlewares: [pengaduanRule.createValidate]
    },
    'PUT /pengaduan/update/:id': 'PengaduanController.update',
    'PUT /pengaduan/updatebystatus': 'PengaduanController.updateStatusPengaduan',
    'PUT /pengaduan/updateArr/status': 'PengaduanController.updateStatus',
    'DELETE /pengaduan/delete/:id': 'PengaduanController.remove',
    'DELETE /pengaduan/deleteArr/arr': 'PengaduanController.removeArr',
    'DELETE /pengaduan/deletesoft/:id': 'PengaduanController.removeSoft',
    'DELETE /pengaduan/deleteArrSoft/arr': 'PengaduanController.removeArrSoft',
    'DELETE /pengaduan/truncate': 'PengaduanController.truncate',

    /* ************************Pengaduan************************ */
    // 'GET /kategoripengaduan/sync': 'KategoriPengaduanController.sinkronisasi',
    'GET /penanganan': 'PenangananController.findAll',
    'GET /penanganan/:id': 'PenangananController.findOne',
    'GET /penanganan/publish/active': 'PenangananController.findAllActive',
    'POST /penanganan/create': {
        path: 'PenangananController.create',
        middlewares: [penangananRule.createValidate]
    },
    'PUT /penanganan/update/:id': 'PenangananController.update',
    'PUT /penanganan/updatebystatus/:id': 'PenangananController.updateStatusPenanganan',
    'PUT /penanganan/updateArr/status': 'PenangananController.updateStatus',
    'DELETE /penanganan/delete/:id': 'PenangananController.remove',
    'DELETE /penanganan/deleteArr/arr': 'PenangananController.removeArr',
    'DELETE /penanganan/deletesoft/:id': 'PenangananController.removeSoft',
    'DELETE /penanganan/deleteArrSoft/arr': 'PenangananController.removeArrSoft',
    'DELETE /penanganan/truncate': 'PenangananController.truncate',

    /* ************************Distribusi Aduan************************ */
    'PUT /distribusiaduan/update/:id': 'DistribusiAduanController.update',
    'PUT /distribusiaduan/updatebystatus': 'DistribusiAduanController.updateStatusDistribusi',

    /* ************************Status************************ */
    'GET /status/findByKategoriRole': 'StatusController.findByKategoriRole',
    'GET /status/findByKategori': 'StatusController.findByKategori',
    'GET /status': 'StatusController.findAll',
    'GET /status/:id': 'StatusController.findOne',
    'GET /status/publish/active': 'StatusController.findAllActive',
    'POST /status/create': {
        path: 'StatusController.create',
        middlewares: [StatusRule.createValidate]
    },
    'PUT /status/update/:id': {
        path: 'StatusController.update',
        middlewares: [StatusRule.updateValidate]
    },
    'PUT /status/updateArr/status': 'StatusController.updateStatus',
    'DELETE /status/delete/:id': 'StatusController.remove',
    'DELETE /status/deleteArr/arr': 'StatusController.removeArr',
    'DELETE /status/deletesoft/:id': 'StatusController.removeSoft',
    'DELETE /status/deleteArrSoft/arr': 'StatusController.removeArrSoft',
    'DELETE /status/truncate': 'StatusController.truncate',

    /* ************************Kategori Status************************ */
    // 'GET /kategoristatus/sync': 'KategoriStatusController.sinkronisasi',
    'GET /kategoristatus': 'KategoriStatusController.findAll',
    'GET /kategoristatus/:id': 'KategoriStatusController.findOne',
    'GET /kategoristatus/publish/active': 'KategoriStatusController.findAllActive',
    'POST /kategoristatus/create': {
        path: 'KategoriStatusController.create',
        middlewares: [kategoristatusRule.createValidate]
    },
    'PUT /kategoristatus/update/:id': {
        path: 'KategoriStatusController.update',
        middlewares: [kategoristatusRule.updateValidate]
    },
    'PUT /kategoristatus/updateArr/status': 'KategoriStatusController.updateStatus',
    'DELETE /kategoristatus/delete/:id': 'KategoriStatusController.remove',
    'DELETE /kategoristatus/deleteArr/arr': 'KategoriStatusController.removeArr',
    'DELETE /kategoristatus/deletesoft/:id': 'KategoriStatusController.removeSoft',
    'DELETE /kategoristatus/deleteArrSoft/arr': 'KategoriStatusController.removeArrSoft',
    'DELETE /kategoristatus/truncate': 'KategoriStatusController.truncate',


    /* ************************ Vr Pelanggaran ************************ */
    'GET /vrpelanggaran': 'VrPelanggaranController.findAll',
    'GET /vrpelanggaran/publish/paginate': 'VrPelanggaranController.findPagination',
    'GET /vrpelanggaran/xlswim': 'VrPelanggaranController.xlsWim',
    'GET /vrpelanggaran/printwim': 'VrPelanggaranController.printWim',
    'GET /vrpelanggaran/printverifikasi': 'VrPelanggaranController.printVerifikasi',
    'GET /vrpelanggaran/:id': 'VrPelanggaranController.findOne',
    'GET /vrpelanggaran/publish/active': 'VrPelanggaranController.findAllActive',
    'POST /vrpelanggaran/create': 'VrPelanggaranController.create',
    'POST /vrpelanggaran/create/fromsync': 'VrPelanggaranController.createFromSync',
    'POST /vrpelanggaran/deteksi': 'VrPelanggaranController.deteksi',

    /* ************************Live Penimbangan************************ */
    'GET /livepenimbangan/resumelive': 'LivePenimbanganController.resumeLive',
    'GET /livepenimbangan/chartpenimbangan': 'LivePenimbanganController.chartPenimbangan',
    'GET /livepenimbangan/chartpenindakan': 'LivePenimbanganController.chartPenindakan',
    'GET /timbangan/lokal/active': 'LivePenimbanganController.getTimbanganLokal',

    /* ************************ Sumber Anggaran ************************ */
    'GET /sumberanggaran': 'SumberAnggaranController.findAll',
    'GET /sumberanggaran/:id': 'SumberAnggaranController.findOne',
    'GET /sumberanggaran/publish/active': 'SumberAnggaranController.findAllActive',
    'POST /sumberanggaran/create': {
        path: 'SumberAnggaranController.create',
        middlewares: [SumberAnggaranRule.createValidate]
    },
    'PUT /sumberanggaran/update/:id': {
        path: 'SumberAnggaranController.update',
        middlewares: [SumberAnggaranRule.updateValidate]
    },
    'PUT /sumberanggaran/updateArr/status': 'SumberAnggaranController.updateStatus',
    'DELETE /sumberanggaran/deletesoft/:id': 'SumberAnggaranController.removeSoft',
    'DELETE /sumberanggaran/delete/:id': 'SumberAnggaranController.remove',
    'DELETE /sumberanggaran/deleteArrSoft/arr': 'SumberAnggaranController.removeArrSoft',
    'DELETE /sumberanggaran/deleteArr/arr': 'SumberAnggaranController.removeArr',
    'DELETE /sumberanggaran/truncate': 'SumberAnggaranController.truncate',

    /* ************************ Metode Kegiatan ************************ */
    'GET /metode': 'MetodeController.findAll',
    'GET /metode/:id': 'MetodeController.findOne',
    'GET /metode/publish/active': 'MetodeController.findAllActive',
    'POST /metode/create': {
        path: 'MetodeController.create',
        middlewares: [MetodeRule.createValidate]
    },
    'PUT /metode/update/:id': {
        path: 'MetodeController.update',
        middlewares: [MetodeRule.updateValidate]
    },
    'PUT /metode/updateArr/status': 'MetodeController.updateStatus',
    'DELETE /metode/deletesoft/:id': 'MetodeController.removeSoft',
    'DELETE /metode/delete/:id': 'MetodeController.remove',
    'DELETE /metode/deleteArrSoft/arr': 'MetodeController.removeArrSoft',
    'DELETE /metode/deleteArr/arr': 'MetodeController.removeArr',
    'DELETE /metode/truncate': 'MetodeController.truncate',

    /* ************************ Jenis Aset ************************ */
    'GET /jenisaset': 'JenisAsetController.findAll',
    'GET /jenisaset/:id': 'JenisAsetController.findOne',
    'GET /jenisaset/publish/active': 'JenisAsetController.findAllActive',
    'POST /jenisaset/create': {
        path: 'JenisAsetController.create',
        middlewares: [JenisAsetRule.createValidate]
    },
    'PUT /jenisaset/update/:id': {
        path: 'JenisAsetController.update',
        middlewares: [JenisAsetRule.updateValidate]
    },
    'PUT /jenisaset/updateArr/status': 'JenisAsetController.updateStatus',
    'DELETE /jenisaset/deletesoft/:id': 'JenisAsetController.removeSoft',
    'DELETE /jenisaset/delete/:id': 'JenisAsetController.remove',
    'DELETE /jenisaset/deleteArrSoft/arr': 'JenisAsetController.removeArrSoft',
    'DELETE /jenisaset/deleteArr/arr': 'JenisAsetController.removeArr',
    'DELETE /jenisaset/truncate': 'JenisAsetController.truncate',

    /* ************************ Kategori Kegiatan ************************ */
    'GET /kategorikegiatan': 'KategoriKegiatanController.findAll',
    'GET /kategorikegiatan/:id': 'KategoriKegiatanController.findOne',
    'GET /kategorikegiatan/publish/active': 'KategoriKegiatanController.findAllActive',
    'POST /kategorikegiatan/create': {
        path: 'KategoriKegiatanController.create',
        middlewares: [KategoriKegiatanRule.createValidate]
    },
    'PUT /kategorikegiatan/update/:id': {
        path: 'KategoriKegiatanController.update',
        middlewares: [KategoriKegiatanRule.updateValidate]
    },
    'PUT /kategorikegiatan/updateArr/status': 'KategoriKegiatanController.updateStatus',
    'DELETE /kategorikegiatan/deletesoft/:id': 'KategoriKegiatanController.removeSoft',
    'DELETE /kategorikegiatan/delete/:id': 'KategoriKegiatanController.remove',
    'DELETE /kategorikegiatan/deleteArrSoft/arr': 'KategoriKegiatanController.removeArrSoft',
    'DELETE /kategorikegiatan/deleteArr/arr': 'KategoriKegiatanController.removeArr',
    'DELETE /kategorikegiatan/truncate': 'KategoriKegiatanController.truncate',

    /* ************************ Sub Kondisi Aset ************************ */
    'GET /subkondisiaset': 'SubKondisiAsetController.findAll',
    'GET /subkondisiaset/:id': 'SubKondisiAsetController.findOne',
    'GET /subkondisiaset/publish/active': 'SubKondisiAsetController.findAllActive',
    'POST /subkondisiaset/create': {
        path: 'SubKondisiAsetController.create',
        middlewares: [SubKondisiAsetRule.createValidate]
    },
    'PUT /subkondisiaset/update/:id': {
        path: 'SubKondisiAsetController.update',
        middlewares: [SubKondisiAsetRule.updateValidate]
    },
    'PUT /subkondisiaset/updateArr/status': 'SubKondisiAsetController.updateStatus',
    'DELETE /subkondisiaset/deletesoft/:id': 'SubKondisiAsetController.removeSoft',
    'DELETE /subkondisiaset/delete/:id': 'SubKondisiAsetController.remove',
    'DELETE /subkondisiaset/deleteArrSoft/arr': 'SubKondisiAsetController.removeArrSoft',
    'DELETE /subkondisiaset/deleteArr/arr': 'SubKondisiAsetController.removeArr',
    'DELETE /subkondisiaset/truncate': 'SubKondisiAsetController.truncate',

      /* ************************ Instansi ************************ */
    'GET /instansi': 'InstansiController.findAll',
    'GET /instansi/:id': 'InstansiController.findOne',
    'GET /instansi/publish/active': 'InstansiController.findAllActive',
    'POST /instansi/create': {
        path: 'InstansiController.create',
        middlewares: [InstansiRule.createValidate]
    },
    'PUT /instansi/update/:id': {
        path: 'InstansiController.update',
        middlewares: [InstansiRule.updateValidate]
    },
    'PUT /instansi/updateArr/status': 'InstansiController.updateStatus',
    'DELETE /instansi/deletesoft/:id': 'InstansiController.removeSoft',
    'DELETE /instansi/delete/:id': 'InstansiController.remove',
    'DELETE /instansi/deleteArrSoft/arr': 'InstansiController.removeArrSoft',
    'DELETE /instansi/deleteArr/arr': 'InstansiController.removeArr',
    'DELETE /instansi/truncate': 'InstansiController.truncate',

     /* ************************Perbaikan************************ */
    'GET /perbaikan': 'PerbaikanController.findAll',
    'GET /perbaikan/:id': 'PerbaikanController.findOne',
    'GET /perbaikan/publish/active': 'PerbaikanController.findAllActive',
    'POST /perbaikan/create': 'PerbaikanController.create',
    'PUT /perbaikan/update/:id': 'PerbaikanController.update',
    'PUT /perbaikan/updateArr/status': 'PerbaikanController.updateStatus',
    'DELETE /perbaikan/delete/:id': 'PerbaikanController.remove',
    'DELETE /perbaikan/deleteArr/arr': 'PerbaikanController.removeArr',
    'DELETE /perbaikan/deletesoft/:id': 'PerbaikanController.removeSoft',
    'DELETE /perbaikan/deleteArrSoft/arr': 'PerbaikanController.removeArrSoft',
    'DELETE /perbaikan/truncate': 'PerbaikanController.truncate',

    /* ************************LHRPelanggaran************************ */
    'GET /lhrpelanggaran': 'LhrPelanggaranController.findAll',
    // 'GET /lhrpelanggaran/:id': 'LhrPelanggaranController.findOne',
    // 'GET /lhrpelanggaran/publish/active': 'LhrPelanggaranController.findAllActive',
    'POST /lhrpelanggaran/create': 'LhrPelanggaranController.create',
    'PUT /lhrpelanggaran/update/:id': 'LhrPelanggaranController.update',
    'PUT /lhrpelanggaran/updateArr/status': 'LhrPelanggaranController.updateStatus',
    'DELETE /lhrpelanggaran/delete/:id': 'LhrPelanggaranController.remove',
    'DELETE /lhrpelanggaran/deleteArr/arr': 'LhrPelanggaranController.removeArr',
    'DELETE /lhrpelanggaran/truncate': 'LhrPelanggaranController.truncate',
    'GET /lhrpelanggaran/filter': {
        path: 'LhrPelanggaranController.filter',
        middlewares: [LhrPelanggaranRule.filter]
    },
    'GET /lhrpelanggaran/filterAb': 'LhrPelanggaranController.filterAb',
  
    'GET /lhrpelanggaran/xlslhr': 'LhrPelanggaranController.xlsLhrPelanggaran',
    'GET /lhrpelanggaran/printlhr': 'LhrPelanggaranController.printLhrPelanggaran',

    'GET /lhrpelanggaran/xlslhrAb': 'LhrPelanggaranController.xlsLhrPelanggaranAb',
    'GET /lhrpelanggaran/printlhrAb': 'LhrPelanggaranController.printLhrPelanggaranAb',
    'GET /lhrpelanggaran/getvrdata': 'LhrPelanggaranController.getVrData',

        /* ************************Statistik LHR************************ */
    'GET /statistiklhr/getsinkdata': 'StatistikLhrController.getSinkronisasiData',
    'GET /statistiklhr/getresumelhrumum': 'StatistikLhrController.getResumeLhrUmum',
    'GET /statistiklhr/getresumelhrangkutan': 'StatistikLhrController.getResumeLhrAngkutan',
    'GET /statistiklhr/getlhrumum': 'StatistikLhrController.getLhrUmum',
    'GET /statistiklhr/getangkutanbarangjk': 'StatistikLhrController.getAngkutanBarangJK',
    'GET /statistiklhr/getangkutanbarangka': 'StatistikLhrController.getAngkutanBarangKA',
    'GET /statistiklhr/getvcrasio': 'StatistikLhrController.getTopKinerjaRuas',
    'GET /statistiklhr/getgrafikvcrasio': 'StatistikLhrController.grafikKinerjaRuas',

        /* ************************Statistik WDIM************************ */
    'GET /statistikwdim/getsinkdata': 'StatistikWdimController.getSinkronisasiData',

     /* ************************Pergantian************************ */
    'GET /pergantian': 'PergantianController.findAll',
    'GET /pergantian/:id': 'PergantianController.findOne',
    'GET /pergantian/publish/active': 'PergantianController.findAllActive',
    'POST /pergantian/create': 'PergantianController.create',
    'PUT /pergantian/update/:id': 'PergantianController.update',
    'PUT /pergantian/updateArr/status': 'PergantianController.updateStatus',
    'DELETE /pergantian/delete/:id': 'PergantianController.remove',
    'DELETE /pergantian/deleteArr/arr': 'PergantianController.removeArr',
    'DELETE /pergantian/deletesoft/:id': 'PergantianController.removeSoft',
    'DELETE /pergantian/deleteArrSoft/arr': 'PergantianController.removeArrSoft',
    'DELETE /pergantian/truncate': 'PergantianController.truncate',

     /* ************************Detail Penanganan************************ */
    'GET /detailpenanganan': 'DetailPenangananController.findAll',
    'GET /detailpenanganan/:id': 'DetailPenangananController.findOne',
    'GET /detailpenanganan/publish/active': 'DetailPenangananController.findAllActive',
    'POST /detailpenanganan/create': 'DetailPenangananController.create',
    'PUT /detailpenanganan/update/:id': 'DetailPenangananController.update',
    'PUT /detailpenanganan/updateArr/status': 'DetailPenangananController.updateStatus',
    'DELETE /detailpenanganan/delete/:id': 'DetailPenangananController.remove',
    'DELETE /detailpenanganan/deleteArr/arr': 'DetailPenangananController.removeArr',
    'DELETE /detailpenanganan/deletesoft/:id': 'DetailPenangananController.removeSoft',
    'DELETE /detailpenanganan/deleteArrSoft/arr': 'DetailPenangananController.removeArrSoft',
    'DELETE /detailpenanganan/truncate': 'DetailPenangananController.truncate',

    /* ************************WIM************************ */
    'GET /wiminfo': 'WimController.wimInfo',
    'GET /integrasi-data-wim': 'WimController.wimIntegrasiPU',

    /* ************************LHR Sensor************************ */
    'GET /lhrsensor/publish/active': 'LhrSensorController.findAllActive',

    'GET /ruas/publish/active': 'RuasController.findAllActive',

    /* ************************ BANK ************************ */
    'GET /bank': 'BankController.findAll',
    'GET /bank/:id': 'BankController.findOne',
    'GET /bank/publish/active': 'BankController.findAllActive',
    'POST /bank/create': {
        path: 'BankController.create',
        middlewares: [BankRule.createValidate]
    },
    'PUT /bank/update/:id': {
        path: 'BankController.update',
        middlewares: [BankRule.updateValidate]
    },
    'PUT /bank/updateArr/status': 'BankController.updateStatus',
    'DELETE /bank/deletesoft/:id': 'BankController.removeSoft',
    'DELETE /bank/delete/:id': 'BankController.remove',
    'DELETE /bank/deleteArrSoft/arr': 'BankController.removeArrSoft',
    'DELETE /bank/deleteArr/arr': 'BankController.removeArr',
    'DELETE /bank/truncate': 'BankController.truncate',

};

module.exports = privateRoutes;
