// app/models/exhibition-picture.model.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ExhibitionPicture extends Model {
    static associate(models) {
      ExhibitionPicture.belongsTo(models.Exhibition, { foreignKey: 'exhibitionId' });
      ExhibitionPicture.belongsTo(models.Picture, { foreignKey: 'pictureId' });
    }
  }
  
  ExhibitionPicture.init({
    exhibitionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pictureId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ExhibitionPicture',
    tableName: 'exhibition_pictures'
  });
  
  return ExhibitionPicture;
};