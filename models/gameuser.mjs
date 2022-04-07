export default function initGameUser(sequelize, DataTypes) {
  return sequelize.define(
    'gameuser',
      {id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      username: {
        type: DataTypes.STRING,
      },
      isSpy: {
        type: DataTypes.BOOLEAN,
      },
       isRed: {
        type: DataTypes.BOOLEAN
       },
        roomId: {
        type: DataTypes.INTEGER, 
        references:{
          model:'rooms', 
          key:'id'
        }
       },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      // The underscored option makes Sequelize reference snake_case names in the DB.
      underscored: true,
    }
  );
}