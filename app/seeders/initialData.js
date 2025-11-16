// app/seeders/initialData.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
const db = require('../models');

async function seedInitialData() {
  try {
    console.log("🌱 Заполнение базы начальными данными...");

    // Проверяем, есть ли уже данные
    const existingPictures = await db.picture.count();
    if (existingPictures > 0) {
      console.log("✅ Данные уже существуют, пропускаем заполнение");
      return;
    }

    // 1. Сначала создаем художников
    console.log("👨‍🎨 Создаем художников...");
    const artists = await db.artist.bulkCreate([
      {
        name: "Винсент Ван Гог",
        bio: "Нидерландский художник-постимпрессионист",
        birthDate: new Date(1853, 2, 30),
        deathDate: new Date(1890, 6, 29),
        nationality: "Голландец"
      },
      {
        name: "Леонардо да Винчи",
        bio: "Итальянский художник, ученый, изобретатель",
        birthDate: new Date(1452, 3, 15),
        deathDate: new Date(1519, 4, 2),
        nationality: "Итальянец"
      },
      {
        name: "Пабло Пикассо",
        bio: "Испанский художник, основоположник кубизма",
        birthDate: new Date(1881, 9, 25),
        deathDate: new Date(1973, 3, 8),
        nationality: "Испанец"
      }
    ]);

    console.log(`✅ Создано художников: ${artists.length}`);

    // 2. Создаем картины с ПРАВИЛЬНЫМИ artistId
    console.log("🖼️ Создаем картины со связями...");
    const pictures = await db.picture.bulkCreate([
      {
        title: "Звездная ночь",
        artist: "Винсент Ван Гог",
        artistId: artists[0].id, // Связь с Ван Гогом
        year: 1889,
        description: "Одна из самых известных картин Ван Гога",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
        style: "Постимпрессионизм",
        price: 1000000.00,
        size: "73.7 × 92.1 см"
      },
      {
        title: "Мона Лиза",
        artist: "Леонардо да Винчи",
        artistId: artists[1].id, // Связь с да Винчи
        year: 1503,
        description: "Портрет Лизы дель Джокондо",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
        style: "Ренессанс",
        price: 8600000.00,
        size: "77 × 53 см"
      },
      {
        title: "Авиньонские девицы",
        artist: "Пабло Пикассо",
        artistId: artists[2].id, // Связь с Пикассо
        year: 1907,
        description: "Картина, положившая начало кубизму",
        imageUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Les_Demoiselles_d%27Avignon.jpg/800px-Les_Demoiselles_d%27Avignon.jpg",
        style: "Кубизм",
        price: 1200000.00,
        size: "243.9 × 233.7 см"
      }
    ]);

    console.log("✅ Начальные данные успешно добавлены!");
    console.log(`   - Художников: ${artists.length}`);
    console.log(`   - Картин: ${pictures.length}`);

  } catch (error) {
    console.log("❌ Ошибка при заполнении базы:", error.message);
  }
}

module.exports = seedInitialData;