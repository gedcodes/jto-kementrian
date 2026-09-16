/**
 * third party libraries
 */
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
// normally you'd just do require('express-openapi'), but this is for test purposes.
var openapi = require('express-openapi');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
// swaggerDocument = require('./swagger.json');
// const listEndpoints = require('express-list-endpoints');
const { ApolloServer } = require('apollo-server-express');
const helmet = require('helmet');
const http = require('http');
const mapRoutes = require('express-routes-mapper');
const session = require('express-session');
var MemoryStore = require('memorystore')(session)
const addRequestId = require('express-request-id')();
const redis = require('redis');
const connectRedis = require('connect-redis');
const morgan = require('morgan');
const moment = require('moment');
const fileUpload = require('express-fileupload');
// var expressLayouts = require('express-ejs-layouts');
const RedisStore = connectRedis(session);
const fs = require('fs');
const path = require("path");

const captchaUrl = '/captcha.jpg';
const captchaMathUrl = '/captcha_math.jpg';
const captchaSessionId = 'captcha';
const captchaFieldName = 'captcha';

const captcha = require('svg-captcha-express').create({
    background: 'rgb(255,255,150)',
    cookie: captchaSessionId,
    fontSize: 50,
    width: 180,
    height: 80,
    charPreset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    size: 5,
    noise: 1,
    color: false
});

//load custom font (optional)
captcha.loadFont(path.join(__dirname, '../fonts/airstrike.ttf'));

// let swaggerPaths = {};
/**
 * server configuration
 */
const config = require('../config');

/**
 * express application
 */
const api = express();

// api.use(expressLayouts);
api.set("views", path.join(__dirname, "views"));
// api.set("view engine", "ejs");
//api.set('views', __dirname + '/views');


//api.set("views", {layout: false});
api.engine('html', require('ejs').renderFile);

api.use(cors());
api.set('trust proxy', true);
// secure express app
api.use(helmet({
    dnsPrefetchControl: false,
    frameguard: false,
    ieNoOpen: false,
}));
api.use(
    fileUpload({
        createParentPath: true,
    })
);


//Configure redis client
const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379
})
redisClient.on('error', function (err) {
    console.log('-----------------------Could not establish a connection with redis. ' + err);
    //console.log(`---------------------------------------------------------------------------`);
});
redisClient.on('connect', function (err) {
    console.log('----------------------Connected to redis successfully----------------------');
    //console.log(`---------------------------------------------------------------------------`);
});

//const memoryStore = new session.MemoryStore();
api.use(session({
    name: 'app.jto21',
    secret: config.private_key,
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({ client: redisClient }),
    cookie: { secure: false, httpOnly: false, maxAge: Number(config.session_expires) }
}))


const server = http.Server(api);

const auth = require('./policies/auth.combined.policy'); //require('./policies/auth.policy');
//const dbService = require('./services/db.service');
const { schema } = require('./graphql');

// environment: development, testing, production
const environment = process.env.PROD_ENV;
const mappedRoutes = mapRoutes(config.publicRoutes, 'api/controllers/');
const mappedPrivateRoutes = mapRoutes(config.privateRoutes, 'api/controllers/');
//const DB = dbService(environment, config.migrate).start();

// console.log('MAPPED ROUTES : ', mappedPrivateRoutes.stack);


api.use(function (req, res, next) {
    if (!req.session) {
        return next(new Error('oh no')) // handle error
    }
    next() // otherwise continue
})


var unlimited = 24 * 60 * 60 * 1000;

// parsing the request bodys
api.use(bodyParser.urlencoded({ extended: false, limit: '100mb' }));
api.use(bodyParser.json({ limit: '100mb' }));
api.use(addRequestId);

morgan.token('id', function getId(req) {
    return req.id
});

var loggerFormat = ':id [:date[web]] ":method :url" :status :response-time';
api.use(morgan(loggerFormat, {
    skip: function (req, res) {
        return res.statusCode < 400
    },
    stream: process.stderr
}));

api.use(morgan(loggerFormat, {
    skip: function (req, res) {
        return res.statusCode >= 400
    },
    stream: process.stdout
}));

// public REST API
api.use('/api/v2pb', mappedRoutes);

// private REST API
api.use('/api/v2pv', auth, mappedPrivateRoutes);

// private GraphQL API
api.post('/graphql', (req, res, next) => auth(req, res, next));

api.get(captchaUrl, captcha.image());

api.get('/api/v2/v2pb/cpt', (req, res) => {
    res.type('html');
    res.end(`
        <img src="${captchaUrl}"/>
        <div><a href='/cpt'>refresh</a></div>
    `);
});



const graphQLServer = new ApolloServer({
    schema,
});

graphQLServer.applyMiddleware({
    app: api,
    cors: {
        origin: true,
        credentials: true,
        methods: ['POST'],
        allowedHeaders: [
            'X-Requested-With',
            'X-HTTP-Method-Override',
            'Content-Type',
            'Accept',
            'Authorization',
            'Access-Control-Allow-Origin',
        ],
    },
    playground: {
        settings: {
            'editor.theme': 'light',
        },
    },
});


const swaggerJson = JSON.parse(
    fs.readFileSync(`${path.resolve()}/api/openapi.json`)
);

const swaggerDocs = swaggerJSDoc(swaggerJson);

api.use('/api-docs', auth, swaggerUI.serve, swaggerUI.setup(swaggerDocs));


server.listen(config.port, () => {
    // if (environment !== 'production'
    //   && environment !== 'development'
    //   && environment !== 'testing'
    // ) {
    //   console.error(`NODE_ENV is set to ${environment}, but only production and development are valid.`);
    //   process.exit(1);
    // }
    console.log(`-----------------------------------------------------------------------------------------`);
    console.log(`-----------------------Start ${environment}, port : ${config.port}-----------------------`);
    console.log(`-----------------------------------------------------------------------------------------`);
    // return DB;
});
