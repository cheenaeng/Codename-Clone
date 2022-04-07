import { resolve } from 'path';
import db from './models/index.mjs';
import initRoomsController from './controllers/rooms.mjs';
import initGameUserController from './controllers/gameuser.mjs';
import initGameController from './controllers/game.mjs';
import initHostController from './controllers/host.mjs';


export default function bindRoutes(app) {
  const RoomsController = initRoomsController(db);
  const GameUserController = initGameUserController(db)
  const GameController = initGameController(db)
  const HostController = initHostController(db)

  app.post('/rooms', RoomsController.getRoomCode);
  app.post('/joinroom', RoomsController.checkRoomCode)
  // special JS page. Include the webpack index.html file

  app.post('/gameuser',GameUserController.postGameUserDetail)
  app.put('/gameuserPlay', GameUserController.addTeamRoleDetails)
  app.put('/roomTeamDetails',RoomsController.updateTeamDetails )

  app.post('/createGame',GameController.createGame )
  app.post('/createHost', HostController.createGameHost)

  // app.post('/checkCardTeam/:id',GameController.checkGameCards )
  app.get('/', (request, response) => {
    response.sendFile(resolve('dist', 'main.html'));
  });  

  app.get('/gameuserIdentity',GameUserController.checkGameuserIdentity)

  app.get('/gameboard/:id', GameController.findGame)
}