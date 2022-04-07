export default function initGameModel(sequelize, DataTypes) {
  return sequelize.define(
    'game',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
          },
        gamestate: {
          type: DataTypes.JSON,
        },
        cards:{
          type: DataTypes.JSON,
          }, 
        roomId:{
          type:DataTypes.INTEGER, 
          references:{
            model: 'rooms', 
            key: 'id'
          }
        }, 
        createdAt: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: DataTypes.DATE,
        }
      },
    {
      // The underscored option makes Sequelize reference snake_case names in the DB.
      underscored: true,
    }
  );
}