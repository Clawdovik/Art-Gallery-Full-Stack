module.exports = (sequelize, Sequelize) => {
  const GoodsGroup = sequelize.define("goodsgroup", {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    baseGoodsGroup: {
      type: Sequelize.INTEGER,
      // Это поле для ссылки на родительскую группу товаров
    }
  });
  return GoodsGroup;
};