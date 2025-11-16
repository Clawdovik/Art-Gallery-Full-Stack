// app/models/references.model.js
module.exports = (db) => {
  console.log("🔗 Настройка связей между моделями...");
  
  // Проверим доступность моделей
  console.log("📋 Проверка моделей:");
  console.log("   - db.artist:", !!db.artist);
  console.log("   - db.picture:", !!db.picture);
  console.log("   - db.exhibition:", !!db.exhibition);
  console.log("   - db.exhibitionPicture:", !!db.exhibitionPicture);

  // Используем правильные имена моделей (в lowercase)
  if (db.artist && db.picture) {
    console.log("✅ Настраиваем связь Artist <-> Picture");
    try {
      // Художник имеет много картин
      db.artist.hasMany(db.picture, { foreignKey: 'artistId' });
      // Картина принадлежит художнику
      db.picture.belongsTo(db.artist, { foreignKey: 'artistId' });
      console.log("✅ Связь Artist-Picture установлена");
    } catch (error) {
      console.log("❌ Ошибка при установке связи Artist-Picture:", error.message);
    }
  }

  if (db.exhibition && db.picture && db.exhibitionPicture) {
    console.log("✅ Настраиваем связи Exhibition <-> Picture");
    try {
      // Выставка имеет много картин через промежуточную таблицу
      db.exhibition.belongsToMany(db.picture, {
        through: db.exhibitionPicture,
        foreignKey: 'exhibitionId',
        otherKey: 'pictureId'
      });
      
      // Картина принадлежит многим выставкам через промежуточную таблицу
      db.picture.belongsToMany(db.exhibition, {
        through: db.exhibitionPicture,
        foreignKey: 'pictureId',
        otherKey: 'exhibitionId'
      });
      
      console.log("✅ Связи Exhibition-Picture установлены");
    } catch (error) {
      console.log("❌ Ошибка при установке связей Exhibition-Picture:", error.message);
    }
  }

  console.log("🔗 Настройка связей завершена");
};