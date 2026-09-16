'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const config = require('../../config/config.js');
const basename = path.basename(__filename);
const db = {};

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host || 'localhost',
        port: config.port || 5432,
        dialect: config.dialect || 'postgres',
        timezone: `${config.timezone}` || '+07:00',
        operatorsAliases: 0,
        pool: {
            max: 100,
            min: 3,
            acquire: 30000,
            idle: 10000,
            evict: 5000
        },
        dialectOptions: {
            statement_timeout: 120000,
            idle_in_transaction_session_timeout: 120000,
        },
        define: {
            timestamps: true,
            underscored: true,
            underscoredAll: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (
            file.slice(-3) === '.js'
        );
    })
    .forEach(file => {
        const model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object
    .keys(db)
    .forEach(modelName => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

// 'use strict';

// const fs = require('fs');
// const path = require('path');
// const Sequelize = require('sequelize');
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'production';
// const config = require('../../config/config.js') //require(__dirname + '/../../config/config.js')[env];
// const db = {};
// console.log(__dirname);
// const sequelize = new Sequelize(
//   config.database,
//   config.username,
//   config.password,
//   {
//       host: config.host || 'localhost',
//       port: config.port || 5432,
//       dialect: config.dialect || 'postgres',
//       timezone: '+07:00',
//       operatorsAliases: 0,
//       pool: {
//           max: 5,
//           min: 0,
//           acquire: 30000,
//           idle: 10000
//       },
//       define  : {
//           timestamps: true,
//           underscored: true,
//           underscoredAll: true,
//           createdAt: 'created_at',
//           updatedAt: 'updated_at'
//       }
//   }
// );
// /*
// let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }
// */
// fs
//     .readdirSync(__dirname)
//     .filter(file => {
//         return (file.indexOf('.') !== 0) && (file !== basename) && (
//             file.slice(-3) === '.js'
//         );
//     })
//     .forEach(file => {
//         const model = sequelize['import'](path.join(__dirname, file));
//         db[model.name] = model;
//     });

// Object
//     .keys(db)
//     .forEach(modelName => {
//         if (db[modelName].associate) {
//             db[modelName].associate(db);
//         }
//     });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;
