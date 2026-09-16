'use strict'

const messageService = () => {
    const GET_SUCCESS = 'Permintaan Data Berhasil';
    const GET_FAILED = 'Permintaan Data Gagal';
    const GET_DATA_NULL = 'Data Tidak Tersedia';
    const FIND_DATA_FAIL = 'Data Tidak Ditemukan';
    const CREATE_SUCCESS = 'Tambah Data Berhasil';
    const CREATE_FAILED = 'Tambah Data Gagal';
    const UPDATE_SUCCESS = 'Ubah Data Berhasil';
    const UPDATE_FAILED = 'Ubah Data Gagal';
    const UPDATE_STATUS_SUCCESS = 'Ubah Status Berhasil';
    const UPDATE_STATUS_FAILED = 'Ubah Status Gagal';
    const REMOVE_SUCCESS = 'Hapus Data Berhasil';
    const REMOVE_FAILED = 'Hapus Data Gagal';
    const TRUNCATE_SUCCESS = 'Kosongkan Data dan Reset ID Berhasil';
    const TRUNCATE_FAILED = 'Kosongkan Data dan Reset ID Gagal';
    const UPLOAD_IMG_FAILED = 'Unggah Gambar Gagal';
    const UPLOAD_FILE_FAILED = 'Unggah File Gagal';
    const UPLOAD_FAIL = 'Upload Data Gagal';
    const INTEGRASI_FAIL = 'Integrasi Data Gagal';
    const INTEGRASI_SUCCESS = 'Integrasi Data Berhasil';

    return {
        GET_SUCCESS,
        GET_FAILED,
        GET_DATA_NULL,
        FIND_DATA_FAIL,
        CREATE_SUCCESS,
        CREATE_FAILED,
        UPDATE_SUCCESS,
        UPDATE_FAILED,
        UPDATE_STATUS_SUCCESS,
        UPDATE_STATUS_FAILED,
        REMOVE_SUCCESS,
        REMOVE_FAILED,
        TRUNCATE_SUCCESS,
        TRUNCATE_FAILED,
        UPLOAD_IMG_FAILED,
        UPLOAD_FILE_FAILED,
        UPLOAD_FAIL,
        INTEGRASI_FAIL,
        INTEGRASI_SUCCESS,
    };
}

module.exports = messageService;