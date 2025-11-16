// app/models/index.js
const dbConfig = require("../config/db.config.js");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Правильная регистрация моделей - исправляем синтаксис
db.goodsGroup = require("./goods-group.model.js")(sequelize, Sequelize);
db.picture = require("./picture.model.js")(sequelize, Sequelize);
db.artist = require("./artist.model.js")(sequelize, Sequelize);
db.exhibition = require("./exhibition.model.js")(sequelize, Sequelize);
db.exhibitionPicture = require("./exhibition-picture.model.js")(sequelize, Sequelize);

// Проверим, что все модели загрузились
console.log("📋 Загруженные модели:");
Object.keys(db).forEach(key => {
  if (key !== 'Sequelize' && key !== 'sequelize') {
    console.log(`   - ${key}`);
  }
});

// Подключаем связи между моделями
require("./references.model.js")(db);

module.exports = db;