export default function initRoomModel(sequelize, DataTypes) {
  return sequelize.define(
    'room',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      roomCode: {
        type: DataTypes.STRING,
      },
      hostId: {
        type: DataTypes.INTEGER,
        references:{
          model:'hosts', 
          key: 'id'
        }
      },
      teamChosen:{
        type:DataTypes.JSON
      }, 
       playersNumber: {
        type: DataTypes.INTEGER
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