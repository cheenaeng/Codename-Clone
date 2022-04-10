import express from 'express';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import bindRoutes from './routes.mjs';
import { createServer } from "http";
import { Server } from "socket.io"

import initSocketController from './controllers/socket.mjs';
import initSocketCardController from './controllers/socket_checkCard.mjs';

import db from './models/index.mjs';


// Initialise Express instance
const app = express();
// Set the Express view engine to expect EJS templates
app.set('view engine', 'ejs');
// Bind cookie parser middleware to parse cookies in requests
app.use(cookieParser());
// Bind Express middleware to parse request bodies for POST requests
app.use(express.urlencoded({ extended: false }));
// Bind Express middleware to parse JSON request bodies
app.use(express.json());

// Bind method override middleware to parse PUT and DELETE requests sent as POST requests
app.use(methodOverride('_method'));
// Expose the files stored in the public folder
app.use(express.static('public'));
// Expose the files stored in the distribution folder
app.use(express.static('dist'));

// Bind route definitions to the Express application
bindRoutes(app);
// Set Express to listen on the given port
const PORT = process.env.PORT || 3004;

const server = createServer(app)

server.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));

const io = new Server(server)

io.on('connection', (socket) => {
    console.log('A user just connected.');
    //data contains room information 
    let maxPlayersData;
    let usersJoinedData
    let roomId
    let currentGuessValue 
    let tempCorrectAns = 0 
    let addedBonus = false 

    socket.on('join room',(data)=>{
     socket.join(`${data.roomId}`)
        //if max capacity is not reached, client can still join the room
        const roomIdData = data.roomId 
        const socketController = initSocketController(db,roomIdData)
        const roomInfo = socketController.getCapacity()
        .then(result=> {
            const usersJoined = [...io.sockets.adapter.rooms.get(`${data.roomId}`)]
            maxPlayersData = result.playersNumber
            usersJoinedData= usersJoined.length
            console.log(maxPlayersData)
            console.log(usersJoinedData)

            if(usersJoined.length<=result.playersNumber){
                const numberUsersJoined = usersJoinedData
                const maxCapacity = maxPlayersData
                roomId = data.roomId
                console.log(`join specific room,${data.roomId} `)
                io.in(`${roomId}`).emit('hello message', data.username,numberUsersJoined,maxCapacity)
            }
  
            else{
             socket.emit('full room')
             console.log('room is full')
            }
        })
        .catch(error=>{
            console.log(error)
        })
    })

    //whenever user enters the room 
    socket.on('findTeam',()=>{
        console.log(roomId)
        
        const socketController = initSocketController(db,roomId)
        const roomInfo = socketController.getCapacity()
        .then(roomResult=>{
            // socket.join(`${roomResult.id}`)
            console.log(roomResult)
            console.log(roomResult.playersNumber, roomResult.teamChosen.teamPlayerCount[0] +roomResult.teamChosen.teamPlayerCount[1])
            if(roomResult.playersNumber <= roomResult.teamChosen.teamPlayerCount[0] +roomResult.teamChosen.teamPlayerCount[1]){
                console.log('exceed')
                io.in(`${roomId}`).emit('startGame',roomResult )
            }
            else
            {   
                console.log('return')
                io.in(`${roomId}`).emit('returnTeam',roomResult)
            }
          
        })
        .catch(error=>{
            console.log(error)
        })
    })

    socket.on('newGame',()=>{
    const socketController = initSocketController(db,roomId)
    const newGameData = socketController.findGame()
        .then(gameResult =>
            {   
                socket.emit('returnGame',gameResult )
            })

    })

    socket.on('findGameStatus',()=>{
    const socketController = initSocketController(db,roomId)
    const newGameData = socketController.findGame()
        .then(result =>
            {   
                io.in(`${roomId}`).emit('returnGameStatus',result)
            })

    })

    socket.on('updateGameState',(gameData)=>{
    
    const socketCardController = initSocketCardController(db,gameData,currentGuessValue,tempCorrectAns,addedBonus)
    const gameInfo = socketCardController.checkGameCards()
        .then(gameResult=>{
            currentGuessValue = gameResult.updatedInputGuess
            tempCorrectAns = gameResult.updatedTempScore 

            io.in(`${gameData.roomId}`).emit('updatedResult',gameResult)
        })
        
    })

    socket.on('receiveGuess', (...dataReceived)=>{
        console.log(dataReceived)
     
        currentGuessValue = dataReceived[0]
        const numberOfGuess= currentGuessValue
        io.in(`${dataReceived[1].roomId}`).emit('showGuess',numberOfGuess,dataReceived[1])

    })

    socket.on('disconnect', () => {
        console.log('A user has disconnected.');
    })

});   


  // axios.post(`/checkCardTeam/${gameId}`,cardValueCheck)