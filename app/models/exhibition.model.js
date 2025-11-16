// app/models/exhibition.model.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Exhibition extends Model {
    static associate(models) {
      // Выставка имеет много картин через промежуточную таблицу
      Exhibition.belongsToMany(models.Picture, {
        through: 'ExhibitionPictures',
        foreignKey: 'exhibitionId'
      });
    }
  }
  
  Exhibition.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Exhibition',
    tableName: 'exhibitions'
  });
  
  return Exhibition;
};