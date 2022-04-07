import './styles.scss';
import { io } from "socket.io-client";
import axios from 'axios';
import e from 'cors';

const socket = io.connect()
/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */


const assignTeamClass = (command,element,startingColor,secondColor)=>{
  element.firstElementChild.innerHTML=""
  switch(command){
    case 'startingTeam':
      element.classList.add(`${startingColor}`)
      break;
    
    case 'secondTeam':
      element.classList.add(`${secondColor}`)
      break;
    
    case 'neutral':
      element.classList.add('neutral')
      break;
    
    case 'bomb':
     element.classList.add('bomb')
      break;
    
  }
}

/* -------------------------------------------------------------------------- */
/*                               MAIN FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

//DOM MANIPULATION 
const currentTeamTurnDiv = document.querySelector('.show-current-team')
const roomBtn = document.querySelector('.room-btn')
const submitRoomCodeBtn = document.querySelector('#submit-room-number')
const submitGameUserDetailsBtn = document.querySelector('#submit-gameuser-btn')
const guessSubmitBtn = document.querySelector('#guesses-submit')
const submitHostBtn = document.querySelector('#submit-host')
const usernameBtn = document.querySelector('#choose-username-btn')
const joinRoomBtn = document.querySelector('.join-room-btn')

let spyColor

//to manipulate

/* --------------------- LOBBY AREA ELEMENTS AND LOG IN --------------------- */
const playersFieldEl = document.querySelector('.players-input')
const hostUserNameEl = document.querySelector('.host-user')
const submitPlayersBtn = document.querySelector('#submit-players-number')
const lobbyDiv = document.querySelector('.lobby-wrapper')
const mainHeader =document.querySelector('.game-load')
const enterRoomCodeEl = document.querySelector('.room-code-input')
const guestUsernameWrapper = document.querySelector('.choose-username-wrapper')


/* ----------------------------- MAIN GAMEBOARD ----------------------------- */
const mainGameBoard = document.querySelector('.main-gamedashboard')
const gameBoardContainer = document.querySelector('.dashboard-container')

/* -------------------------------------------------------------------------- */
/*                  TO CREATE ROOM AND JOIN PLAYERS TO ROOM                  */
/* -------------------------------------------------------------------------- */
const submitPlayers= (e)=>{
  e.target.classList.add('hide')
  console.log( e.target)
  joinRoomBtn.classList.add('hide')
  playersFieldEl.classList.remove('hide')

  const createRoomCode = () =>{
    const playersInput =  document.querySelector('#player-numbers').value
    const playerData= {
      playerNumbers : playersInput
    }

    axios.post('/rooms', playerData)
    .then(response =>{
      hostUserNameEl.classList.remove('hide')
      playersFieldEl.classList.add('hide')
      const roomID = response.data.createRoom.id
      const roomCodeDiv = document.querySelector('#show-room-code')
      roomCodeDiv.innerHTML = `${response.data.createRoom.roomCode}`
      axios.post('/createGame', roomID)
      .then(res=>{
        console.log(res.data)
        
      })
    })
    .catch(error=>{
      console.log(error)


    })
  } 
  submitPlayersBtn.addEventListener('click', createRoomCode)
}

//this is to show the lobby area when either host or guest have logged into the game
const showLobbyArea = (room)=>{ 
  console.log("lobby area shown")
  const chooseRoleDiv = document.querySelector('.choose-role')
  // chooseRoleDiv.classList.add('hide')
  const submitGameUserBtn = document.querySelector('#submit-gameuser-btn')
  const redTeamMessageDiv = document.querySelector('.red-team-message')
  const blueTeamMessageDiv = document.querySelector('.blue-team-message')
  const teamRadioEl = document.querySelectorAll('input[name="team"]')
  
  socket.emit('findTeam')
  socket.on('returnTeam',(data)=>{
    console.log('yes')
      console.log(data)
      const currentRedTeam = data.teamChosen.teamPlayerCount[0]
      const currentBlueTeam = data.teamChosen.teamPlayerCount[1]
      const totalRedTeam = Math.floor(data.playersNumber/2)
      const totalBlueTeam = data.playersNumber -totalRedTeam
    
      
      redTeamMessageDiv.innerHTML=`${currentRedTeam} out of ${totalRedTeam} have joined red team`
      blueTeamMessageDiv.innerHTML=`${currentBlueTeam} out of ${totalBlueTeam} have joined blue team` 

      const spyMessageDiv = document.querySelector('.spy-msg')
      const nonSpyMessageDiv =document.querySelector('.non-spy-msg')

    
      teamRadioEl.forEach(radio => radio.addEventListener('input', ()=>{
        socket.emit('findTeam')
        socket.on('returnTeam', (data)=>{
  
          if (currentRedTeam >= totalRedTeam ){
            document.querySelector('input[value=red]').disabled = true 
            redTeamMessageDiv.innerHTML = 'team is filled'
          } 
          if (currentBlueTeam >= totalBlueTeam){ 
            document.querySelector('input[value=blue]').disabled = true 
            blueTeamMessageDiv.innerHTML = 'team is filled'
          }

        let checkTeamSelected = document.querySelector('input[name="team"]:checked')?.value;
          const isRedSpyAval = data.teamChosen.redSpy 
          const isBlueSpyAval = data.teamChosen.blueSpy 
          console.log(isBlueSpyAval)
          console.log(checkTeamSelected)

          //if player chooses red or blue and spy role already taken 
          if (isRedSpyAval && checkTeamSelected ==="red" && isBlueSpyAval && checkTeamSelected==="blue"){
            document.querySelector('input[value="spy"]').disabled = true 
          }

          if (isRedSpyAval && checkTeamSelected ==="red"){
            spyMessageDiv.innerHTML = 'Red spy role taken'
            document.querySelector('input[value="spy"]').disabled = true 
          }

          if (isBlueSpyAval && checkTeamSelected ==="blue"){
            spyMessageDiv.innerHTML = 'Blue spy role taken'
            document.querySelector('input[value="spy"]').disabled = true 
          }

          else {
            //if all other field operatives role taken, only left spy role 
            if (!isRedSpyAval && checkTeamSelected ==="red" && currentRedTeam === totalRedTeam -1 || 
            !isBlueSpyAval && checkTeamSelected ==="blue" && currentBlueTeam === totalBlueTeam -1 ){
              document.querySelector('input[value="non-spy"]').disabled = true 
              nonSpyMessageDiv.innerHTML = 'All field operatives roles are taken'
            }

            else {
              spyMessageDiv.innerHTML = 'Spy role available'
              document.querySelector('input[value="spy"]').disabled = false 
              document.querySelector('input[value="non-spy"]').disabled = false 
            }
          } 
          })
        }))
    })
}

const createGameUser = (userData) =>{
  axios.post('/gameuser',userData)
  .then(response=>{
    const gameuserDetail = {
      username: userData.username, 
      roomId: response.data.createGameUser.roomId
    }
    const gameUserId = response.data.createGameUser.id
    console.log(response.data,"gameusers data")
  
    socket.emit('join room',gameuserDetail)
    socket.emit('join')
    socket.on('hello message', (...args)=>{
      console.log('hellllooooooo')
      const messageDiv = document.querySelector('.message-users-joined')
      messageDiv.innerHTML=""
      console.log(args)
      messageDiv.innerHTML=`${args[0]} have joined the room`
      showLobbyArea(gameuserDetail.roomId)
    })

    socket.on('full room',(...count)=>{
     const fullRoomMsg = document.querySelector('.full-room-message')
     fullRoomMsg.innerHTML='room is full!!!'

      console.log('room full')
    })
  })
}

const enterUsername = ()=>{
const usernameInput = document.querySelector('#choose-username').value 
  const userInfo = {
    username:usernameInput
  }
  createGameUser(userInfo)
  guestUsernameWrapper.classList.add('hide')
  lobbyDiv.classList.remove('hide')
  mainHeader.classList.add('hide')
}


const submitHost = () =>{
  const hostName = document.querySelector('#username-host').value
  const dataUser = {
    host: hostName
  }

  axios.post('/createHost',dataUser)
  .then(response =>{
    hostUserNameEl.classList.add('hide')
    lobbyDiv.classList.remove('hide')
    mainHeader.classList.add('hide')
    console.log(mainHeader)

    const userdata ={
      username: response.data.hostUser.username
    }
    createGameUser(userdata)
  })
}

const guestJoinRoom = (e) =>{
  enterRoomCodeEl.classList.remove('hide')
  e.target.classList.add('hide')
  roomBtn.classList.add('hide')

}

const checkRoomcode = ()=>{
  const roomCodeInput = document.querySelector('#room-code-input').value 
  const roomInput= {
    roomCode: roomCodeInput
  }

  axios.post('/joinroom',roomInput)
  .then(response=>{
    console.log(response.data)
    enterRoomCodeEl.classList.add('hide')
    guestUsernameWrapper.classList.remove('hide')

  })
  .catch(error=>{
    console.log(error)
  })
}


const checkForCurrentTeam = (colorSpy)=>{
console.log(colorSpy)
 const mainGameBoard =document.querySelectorAll('#universal-game-board .col')
  socket.on('returnGameStatus', (data)=>{
    console.log('return current game status')
    currentTeamTurnDiv.innerHTML = `CURRENT TEAM IS: ${data.gamestate.currentTeam}`
    if (data.gamestate.currentTeam != colorSpy){
      document.querySelector('#guesses-input').disabled = true
      mainGameBoard.forEach(element=>{
        element.style.pointerEvents = 'none'
      })
    }
    else {
        document.querySelector('#guesses-input').disabled = false
        mainGameBoard.forEach(element=>{
        element.style.pointerEvents = 'auto'
      })
      }
   })
}

const receiveChangeInCards = ()=>{
    socket.on('reveal', (data)=>{
    console.log(data,'data')
    socket.emit('findGameStatus')
    const cardElDiv = document.querySelector(`.card-backface-${data.cardValue}`)
    const cardElDivParent = document.querySelector(`.card-backface-${data.cardValue}`).parentNode
    console.log(cardElDivParent)

    cardElDiv.innerHTML = data.cardAnswer 
    assignTeamClass(data.cardCategory,cardElDivParent, data.startingTeam,data.secondTeam)
  })
}

const flipCard = (gameDetails)=>{
  socket.emit('showCards', gameDetails)

}

//data here stores the game information 
const checkUseridentity =(data)=>{
  //to show general information to all 
  mainGameBoard.classList.remove('hide')

  //if starting team is red, to show red start first, else otherwise 
  const ifRedStarts = document.querySelector('.if-starting-team-red')
  const guessOutputRed = document.querySelector('.required-guess-red')
  const ifBlueStarts = document.querySelector('.if-starting-team-blue')
  const guessOutputBlue =  document.querySelector('.required-guess-blue')

  if (data.gamestate.startingTeam ==='red'){
     ifRedStarts.innerHTML = `STARTING TEAM`
     guessOutputRed.innerHTML = '9'
     guessOutputBlue.innerHTML = '8'
     

  } else{
    ifBlueStarts.innerHTML = `STARTING TEAM`
    guessOutputRed.innerHTML = '8'
    guessOutputBlue.innerHTML = '9'
  }


  axios.get('/gameuserIdentity')
  .then(response=>{
    const showTeamDiv = document.querySelector('.show-team')
    let teamOfUser
    console.log(response.data)
    response.data.findGameuser.isRed? teamOfUser = 'red': teamOfUser = 'blue'
    showTeamDiv.innerHTML = `Team: ${teamOfUser}`
    const mainBoard = document.querySelector('#universal-game-board .gameboard-container')
    mainBoard.classList.remove('hide')
    const showRole = document.querySelector('.show-role')
    if(!response.data.findGameuser.isSpy){
      showRole.innerHTML = 'ROLE: FIELD OPERATIVE'
      const allCardsElement = document.querySelectorAll('#universal-game-board .card-btn')
      allCardsElement.forEach(card=> card.innerHTML ="")
    
    }
    else{
      showRole.innerHTML = 'ROLE:SPY'
      response.data.findGameuser.isRed? spyColor= 'red': spyColor= 'blue'
      const spyBoard = document.querySelector('.small-revealed-board .gameboard-container')
      spyBoard.classList.remove('hide')
      console.log(spyBoard)

      //to assign cards to each board 
      const cardsShuffled = data.cards.allWords
      console.log(cardsShuffled)
      const boardBox = document.querySelectorAll('.card-btn-main')
      const spyBoardEl = document.querySelectorAll('.small-revealed-board .card-btn')
  
      console.log(spyBoardEl)
      console.log(boardBox)

      for (let i=0; i<boardBox.length; i+=1){
        boardBox[i].setAttribute('id',`${i}`)
        boardBox[i].classList.add(`card-backface-${i}`)
        spyBoardEl[i].innerHTML = cardsShuffled[i]
        boardBox[i].innerHTML = cardsShuffled[i]  
      }
      //small board for spy master to see the cards 
      
      const mainGameBoard =document.querySelectorAll('#universal-game-board .col .card-btn-main')

      mainGameBoard.forEach(card=> {
        console.log(card)
        card.addEventListener('click', (e)=>{
          console.log(e.target)  
          const getCardValue = e.target.id
          const cardValueCheck = {
            card: parseInt(getCardValue)
          }
          let secondTeam;
          data.gamestate.startingTeam === 'blue'? secondTeam='red':secondTeam ='blue'

          const gameData = {
            gameId: data.id, 
            cardValue: cardValueCheck.card, 
            startingTeamColor: data.gamestate.startingTeam, 
            secondTeamColor: secondTeam, cardValueCheck, 
            roomId: data.roomId,
          }
          //spy will trigger this event
          flipCard(gameData)
          //everytime click the div to check whether spycolor is same as current team 
         checkForCurrentTeam(spyColor)
         })
      })

      //array shows the team each index is associated with 
      const mappingWord = []
      spyBoardEl.forEach((card,index) =>{
        const checkWord = cardsShuffled[index]
        for (let category in data.cards){
            if (data.cards[category].includes(checkWord)){
              mappingWord[index] = category
            }
        }
      })

      const startingTeamColor = data.gamestate.startingTeam 
      let secondColorTeam; 
      startingTeamColor=== 'blue'? secondColorTeam = 'red': secondColorTeam = 'blue'
      //to assign colors to the spyboard 
      for (let i =0; i<spyBoardEl.length; i+=1){
        const spyBoardElparent = document.querySelectorAll('.small-revealed-board .card-btn')[i].parentNode
        spyBoardEl[i].innerHTML = ""
         assignTeamClass(mappingWord[i],spyBoardElparent,startingTeamColor,secondColorTeam)
        }
      checkForCurrentTeam(spyColor)
    }
  })
  .catch(error=>console.log(error))
}

const getGuessValue = ()=>{
  const guessValue = document.querySelector('#guesses-input').value 
  console.log(guessValue)
  //need  to know who is the current team
  socket.emit('newGame')
  socket.on('returnGame', gameResult=>{
    console.log('return')
    console.log(gameResult)
     socket.emit('receiveGuess', guessValue,gameResult)

  })
 
}

const showGuessValue = ()=>{
   socket.on('showGuess', (...result)=>{
     const guessMessageDiv = document.querySelector('.show-guess')
     guessMessageDiv.innerHTML = `Number of guess: ${result[0]}`
   })
}


/* -------------------------------------------------------------------------- */
/*                                INIT GAMMEEEE                               */
/* -------------------------------------------------------------------------- */


const initGame = ()=>{
  const lobbyContainerEl = document.querySelector('.lobby-wrapper')
  lobbyContainerEl.classList.add('hide')

  socket.emit('newGame')
  socket.on('returnGame',(gameData=>{
    console.log('gamedata', gameData)
    checkUseridentity(gameData)
    console.log(gameData)
  }))
  receiveChangeInCards()
  showGuessValue()
  socket.emit('findGameStatus')
  socket.on('returnGameStatus',(result)=>{
    console.log(result)
    currentTeamTurnDiv.innerHTML = `${result.gamestate.currentTeam}`
     
  })

}


//this is to update game user details when player press the submit button 
const submitGameDetails = ()=>{
   const checkTeamSelected =document.querySelector('input[name="team"]:checked').value
   const roleSelected = document.querySelector('input[name="role"]:checked').value
  //to update isSpy and isRed column under games_users table 
  const userDetailsSelected = {
     role: roleSelected, 
     teamSelected: checkTeamSelected
    }
 
  //to update game user details AND update room- team chosen column AND  create game at the same time
  axios.put(`/gameuserPlay`,userDetailsSelected )
  .then(response=>{
    console.log(response.data)
  })

   axios.put('/roomTeamDetails', userDetailsSelected)
  .then(response=>{
      console.log(response.data)
      // showLobbyArea(response.data.roomData.roomId)
        //if in the case where exceed  
      socket.emit('findTeam')
      socket.on('startGame', ()=>{
      initGame(response.data.roomData.id)
    })
  })
}

/* -------------------------------------------------------------------------- */
/*                      DOM MANIPULATION TO SHOW AND HIDE                     */
/* -------------------------------------------------------------------------- */

//1. when click create btn, the number of players div and username field appear and button for create room disappear 




roomBtn.addEventListener('click', submitPlayers)
submitGameUserDetailsBtn.addEventListener('click', submitGameDetails)
submitRoomCodeBtn.addEventListener('click', checkRoomcode)
guessSubmitBtn.addEventListener('click', getGuessValue)
submitHostBtn.addEventListener('click', submitHost)
usernameBtn.addEventListener('click', enterUsername)
joinRoomBtn.addEventListener('click', guestJoinRoom)