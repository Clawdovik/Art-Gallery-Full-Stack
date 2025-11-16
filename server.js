require('dotenv').config();
const express = require("express");
const db = require("./app/models");
const path = require("path");

const app = express();

// Упрощенная функция для поиска свободного порта
const findFreePort = async (startPort) => {
  const net = require('net');
  
  for (let port = startPort; port < 65536; port++) {
    try {
      await new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once('error', reject);
        server.once('listening', () => {
          server.close();
          resolve();
        });
        server.listen(port);
      });
      return port;
    } catch (err) {
      if (err.code !== 'EADDRINUSE') {
        throw err;
      }
    }
  }
  throw new Error('No free ports found');
};

async function startServer() {
  try {
    const startPort = parseInt(process.env.NODE_LOCAL_PORT) || 6868;
    const PORT = await findFreePort(startPort);
    
    console.log(`🔍 Найден свободный порт: ${PORT}`);

    // Middleware
    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'public')));

    // Логирование всех запросов
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    // Синхронизация с БД - ВРЕМЕННО с force: true для пересоздания таблиц
    await db.sequelize.sync({ alter: true });
    console.log("✅ База данных пересоздана.");
    
    // Заполняем базу начальными данными
    try {
      const seedInitialData = require('./app/seeders/initialData');
      await seedInitialData();
    } catch (error) {
      console.log("⚠️  Ошибка при заполнении начальных данных:", error.message);
    }
    
    console.log("📊 Доступные модели:");
    Object.keys(db).forEach(modelName => {
      if (db[modelName] && typeof db[modelName] === 'object' && db[modelName].name) {
        console.log(`   - ${modelName}: ${db[modelName].name}`);
      }
    });
    
    // ==================== МАРШРУТЫ ====================
    
    // Главная страница
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Проверка здоровья
    app.get("/api/health", (req, res) => {
      res.json({ 
        status: "OK", 
        timestamp: new Date().toISOString(),
        database: "Connected"
      });
    });

    // Получение картин с информацией о художниках
app.get("/api/pictures", async (req, res) => {
  try {
    console.log("🖼️ Запрос всех картин с художниками");
    const pictures = await db.picture.findAll({
      include: [{
        model: db.artist,
        attributes: ['id', 'name', 'nationality'] // Только нужные поля
      }],
      order: [['createdAt', 'DESC']]
    });
    console.log(`✅ Найдено картин: ${pictures.length}`);
    res.json(pictures);
  } catch (err) {
    console.error("❌ Ошибка получения картин:", err.message);
    res.status(500).json({ error: err.message });
  }
});

    // Создание картины с автоматическим связыванием с художником
    app.post("/api/pictures", async (req, res) => {
      try {
        console.log("📨 Получен запрос на создание картины:", req.body);
        
        if (!req.body.title || !req.body.artist || !req.body.imageUrl) {
          return res.status(400).json({ 
            error: "Обязательные поля: title, artist, imageUrl" 
          });
        }
        
        // Ищем или создаем художника
        let artist = await db.artist.findOne({
          where: { name: req.body.artist }
        });
        
        if (!artist) {
          console.log(`🎨 Художник "${req.body.artist}" не найден, создаем нового`);
          artist = await db.artist.create({
            name: req.body.artist,
            bio: null,
            birthDate: null,
            deathDate: null,
            nationality: null
          });
        }
        
        // Создаем картину с правильным artistId
        const pictureData = {
          title: req.body.title,
          artist: req.body.artist,
          artistId: artist.id, // Связываем с художником
          year: req.body.year || null,
          description: req.body.description || null,
          imageUrl: req.body.imageUrl,
          style: req.body.style || null,
          price: req.body.price || null,
          size: req.body.size || null
        };
        
        const picture = await db.picture.create(pictureData);
        console.log("✅ Картина создана с ID:", picture.id, "artistId:", artist.id);
        
        // Возвращаем картину с информацией о художнике
        const pictureWithArtist = await db.picture.findByPk(picture.id, {
          include: [{
            model: db.artist,
            attributes: ['id', 'name', 'nationality']
          }]
        });
        
        res.json(pictureWithArtist);
      } catch (err) {
        console.error("❌ Ошибка создания картины:", err.message);
        res.status(500).json({ error: "Ошибка создания: " + err.message });
      }
    });

    // Получение одной картины с информацией о художнике
    app.get("/api/pictures/:id", async (req, res) => {
      try {
        console.log(`🖼️ Запрос картины с ID: ${req.params.id}`);
        const picture = await db.picture.findByPk(req.params.id, {
          include: [{
            model: db.artist,
            attributes: ['id', 'name', 'bio', 'nationality']
          }]
        });
        
        if (picture) {
          console.log("✅ Картина найдена:", picture.title);
          res.json(picture);
        } else {
          console.log("❌ Картина не найдена, ID:", req.params.id);
          res.status(404).json({ error: "Картина не найдена" });
        }
      } catch (err) {
        console.error("❌ Ошибка получения картины:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    // Получение художников с их картинами
    app.get("/api/artists", async (req, res) => {
      try {
        console.log("🎨 Запрос всех художников с картинами");
        const artists = await db.artist.findAll({
          include: [{
            model: db.picture,
            attributes: ['id', 'title', 'year', 'imageUrl', 'style', 'price']
          }],
          order: [['name', 'ASC']]
        });
        console.log(`✅ Найдено художников: ${artists.length}`);
        res.json(artists);
      } catch (err) {
        console.error("❌ Ошибка получения художников:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    // Получение конкретного художника с его картинами
    app.get("/api/artists/:id", async (req, res) => {
      try {
        console.log(`🎨 Запрос художника с ID: ${req.params.id}`);
        const artist = await db.artist.findByPk(req.params.id, {
          include: [{
            model: db.picture,
            attributes: ['id', 'title', 'year', 'imageUrl', 'style', 'price'],
            order: [['year', 'DESC']]
          }]
        });
        
        if (artist) {
          console.log("✅ Художник найден:", artist.name);
          res.json(artist);
        } else {
          console.log("❌ Художник не найден, ID:", req.params.id);
          res.status(404).json({ error: "Художник не найден" });
        }
      } catch (err) {
        console.error("❌ Ошибка получения художника:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    // Получение картин конкретного художника
    app.get("/api/artists/:id/pictures", async (req, res) => {
      try {
        console.log(`🖼️ Запрос картин художника с ID: ${req.params.id}`);
        const pictures = await db.picture.findAll({
          where: { artistId: req.params.id },
          include: [{
            model: db.artist,
            attributes: ['id', 'name', 'nationality']
          }],
          order: [['year', 'DESC']]
        });
        
        console.log(`✅ Найдено картин: ${pictures.length}`);
        res.json(pictures);
      } catch (err) {
        console.error("❌ Ошибка получения картин художника:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    // Обновление информации о картине
    app.put("/api/pictures/:id", async (req, res) => {
      try {
        console.log(`✏️ Запрос на обновление картины ID: ${req.params.id}`, req.body);
        
        const picture = await db.picture.findByPk(req.params.id);
        if (!picture) {
          return res.status(404).json({ error: "Картина не найдена" });
        }

        // Если меняется художник, обновляем связь
        if (req.body.artist && req.body.artist !== picture.artist) {
          let artist = await db.artist.findOne({
            where: { name: req.body.artist }
          });
          
          if (!artist) {
            console.log(`🎨 Создаем нового художника: ${req.body.artist}`);
            artist = await db.artist.create({
              name: req.body.artist,
              bio: null,
              birthDate: null,
              deathDate: null,
              nationality: null
            });
          }
          
          req.body.artistId = artist.id;
        }

        await picture.update(req.body);
        
        // Возвращаем обновленную картину с информацией о художнике
        const updatedPicture = await db.picture.findByPk(req.params.id, {
          include: [{
            model: db.artist,
            attributes: ['id', 'name', 'nationality']
          }]
        });
        
        console.log("✅ Картина обновлена:", updatedPicture.title);
        res.json(updatedPicture);
      } catch (err) {
        console.error("❌ Ошибка обновления картины:", err.message);
        res.status(500).json({ error: "Ошибка обновления: " + err.message });
      }
    });

    // Удаление картины
    app.delete("/api/pictures/:id", async (req, res) => {
      try {
        console.log(`🗑️ Запрос на удаление картины ID: ${req.params.id}`);
        
        const picture = await db.picture.findByPk(req.params.id);
        if (!picture) {
          return res.status(404).json({ error: "Картина не найдена" });
        }

        await picture.destroy();
        console.log("✅ Картина удалена:", picture.title);
        res.json({ message: "Картина успешно удалена", deletedPicture: picture });
      } catch (err) {
        console.error("❌ Ошибка удаления картины:", err.message);
        res.status(500).json({ error: "Ошибка удаления: " + err.message });
      }
    });

    // Обработка 404
    app.use("/api/*", (req, res) => {
      console.log(`❌ API маршрут не найден: ${req.method} ${req.originalUrl}`);
      res.status(404).json({ 
        error: "API маршрут не найден",
        path: req.originalUrl 
      });
    });

    // Обработка ошибок
    app.use((err, req, res, next) => {
      console.error("💥 Необработанная ошибка:", err);
      res.status(500).json({ 
        error: "Внутренняя ошибка сервера"
      });
    });

    console.log("🔄 Загруженные маршруты:");
    console.log("   GET    /api/health");
    console.log("   GET    /api/pictures");
    console.log("   POST   /api/pictures");
    console.log("   GET    /api/pictures/:id");
    console.log("   PUT    /api/pictures/:id");
    console.log("   DELETE /api/pictures/:id");
    console.log("   GET    /api/artists");
    console.log("   GET    /api/artists/:id");
    console.log("   GET    /api/artists/:id/pictures");

    // Запуск сервера
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`🌐 Откройте в браузере: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Ошибка запуска сервера:", error.message);
  }
}

startServer();

module.exports = app;