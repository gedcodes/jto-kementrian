const axios = require('axios');
const cheerio = require('cheerio');
var qs = require('qs');
const { t_integrasi, t_etilang, sequelize } = require('../../models');
const { Op, QueryTypes } = require('sequelize');
const etilang = 'ETL'
const moment = require('moment');
const fs = require('fs');
const path = require("path");
const config = require('../../../config/config');
const timer = ms => new Promise(res => setTimeout(res, ms))
const imageToBase64 = require('image-to-base64');
var nodeBase64 = require('nodejs-base64-converter');
const { getJenisKendaraanId, getSumbuId, getKepemilikanId, getKepemilikanVal, checkMasaBerlaku } = require('./dataid');