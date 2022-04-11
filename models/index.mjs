import sequelizePackage from 'sequelize';
import allConfig from '../config/config.js';

import initHostModel from './host.mjs';
import initGameModel from './game.mjs';
import initRoomModel from './room.mjs';
import initGameUser from './gameuser.mjs';


const { Sequelize } = sequelizePackage;
const env = process.env.NODE_ENV || 'development';
const config = allConfig[env];
const db = {};
let sequelize;

if (env === 'production') {
  // Break apart the Heroku database url and rebuild the configs we need
  const { DATABASE_URL } = process.env;
  const dbUrl = url.parse(DATABASE_URL);
  const username = dbUrl.auth.substr(0, dbUrl.auth.indexOf(':'));
  const password = dbUrl.auth.substr(
    dbUrl.auth.indexOf(':') + 1,
    dbUrl.auth.length
  );
  const dbName = dbUrl.path.slice(1);
  const host = dbUrl.hostname;
  const { port } = dbUrl;
  config.host = host;
  config.port = port;
  sequelize = new Sequelize(dbName, username, password, config);
}

// If env is not production, retrieve DB auth details from the config
else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

db.Host= initHostModel(sequelize, Sequelize.DataTypes);
db.Gameuser = initGameUser(sequelize, Sequelize.DataTypes);
db.Game = initGameModel(sequelize, Sequelize.DataTypes);
db.Room = initRoomModel(sequelize, Sequelize.DataTypes);

//one game belongs to one room, one room only one game 
db.Room.hasOne(db.Game);
db.Game.belongsTo(db.Room);

//many to many between game and use 
db.Game.belongsToMany(db.Host, {through:'hosts_games'})
db.Host.belongsToMany(db.Game, {through:'hosts_games'})

//one to many between host and room 
db.Room.belongsTo(db.Host)
db.Host.hasMany(db.Room)

//one to many between gameusers and rooms 
db.Gameuser.belongsTo(db.Room)
db.Room.hasMany(db.Gameuser)

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;