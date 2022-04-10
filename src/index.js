import './styles.scss';
import { io } from "socket.io-client";
import axios from 'axios';


const socket = io.connect()

/* -------------------------------------------------------------------------- */
/*                              DOM MANIPULATIONS                              */
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
let tempGuessValue =0


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
const spyBoardContainer = document.querySelector('.small-revealed-board .gameboard-container')
const guessinputFieldEl = document.querySelector('#guesses-input')
const gameBoardContainerEl = document.querySelector('#universal-game-board .gameboard-container')
const guessFieldEl = document.querySelector('.guesses-field')
const mainGameBoardColsEl =document.querySelectorAll('#universal-game-board .col')
const redGameScore = document.querySelector('.red-team-score')
const blueGameScore = document.querySelector('.blue-team-score')

const winningMessage = document.querySelector('.winner-message')
const winningModal = document.querySelector('.modal-winning-message')

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */


const assignTeamClass = (command,element,startingColor,secondColor)=>{
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

const assignGameScore = () =>{
  console.log('scoressss', redScore, blueScore)
  console.log(document.querySelectorAll('#universal-game-board .red'))
  console.log(document.querySelectorAll('#universal-game-board .blue'))
  const redScore = document.querySelectorAll('#universal-game-board .red').length
  const blueScore = document.querySelectorAll('#universal-game-board .blue').length
  redGameScore.innerHTML = redScore
  blueGameScore.innerHTML = blueScore

  return [redScore,blueScore]

}

const checkForWinningCondition = (gameData)=>{
  const gameResult = assignGameScore()
  if (gameData.cardCategory==="bomb"){
    winningModal.classList.remove('hide')
    winningMessage.innerHTML = `${gameData.updatedGameStatus.currentTeam} team wins the game!`
  }
  if (gameData.startingTeam === 'red' && gameResult[0] ===9 || gameData.startingTeam ==='blue' && gameResult[1] === 9){
     winningModal.classList.remove('hide')
     winningMessage.innerHTML = `${gameData.startingTeam} team wins the game!`
    
  }
  if (gameData.secondTeam === 'red' && gameResult[0] ===8 || gameData.secondTeam ==='blue' && gameResult[1] === 8){
     winningModal.classList.remove('hide')
     winningMessage.innerHTML = `${gameData.secondTeam} team wins the game!`
    
  }

}

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
          document.querySelector('input[value="spy"]').disabled = false 

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
      messageDiv.innerHTML=`${args[0]} has joined the room`
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
  socket.emit('findGameStatus')
  socket.on('returnGameStatus', data=>{
    console.log('currentTeam'+ data)
    currentTeamTurnDiv.innerHTML = `${data.gamestate.currentTeam}`
 
    if (data.gamestate.currentTeam != colorSpy){
      document.querySelector('#guesses-input').disabled = true
      gameBoardContainerEl.classList.add('container-overlay')
      mainGameBoardColsEl.forEach(element=>{
        element.style.pointerEvents = 'none'
      })
    }
    else {
        document.querySelector('#guesses-input').disabled = false
      }
    })
  // checkForWinningCondition(data)
}


const receiveChangeInCards = ()=>{
    socket.on('updatedResult', (data)=>{
      console.log(data,'data')
      const cardElDiv = document.querySelector(`.card-backface-${data.cardValue}`)
      const cardElDivParent = document.querySelector(`.card-backface-${data.cardValue}`).parentNode
      console.log(cardElDivParent)
      cardElDiv.innerHTML = ""
      assignTeamClass(data.cardCategory,cardElDivParent, data.startingTeam,data.secondTeam)
      checkForCurrentTeam(spyColor)
      checkForWinningCondition(data)
  })
}


const updateGameScore = (cardData) =>{
  console.log('clicked')
  socket.emit('updateGameState',cardData)
}


//data here stores the game information 
const checkUseridentity =(data)=>{
  //to show general information to all 
  mainGameBoard.classList.remove('hide')
  console.log(data)
  currentTeamTurnDiv.innerHTML = `${data.gamestate.currentTeam}`
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

  //for each client to check their user identity 
  axios.get('/gameuserIdentity')
  .then(response=>{
    //if user is a field operative, do not show spy board  
    const showTeamDiv = document.querySelector('.show-team')
    let teamOfUser
    console.log(response.data)
    response.data.findGameuser.isRed? teamOfUser = 'red': teamOfUser = 'blue'
    showTeamDiv.innerHTML = `${teamOfUser}`
    const mainBoard = document.querySelector('#universal-game-board .gameboard-container')
    mainBoard.classList.remove('hide')
    const showRole = document.querySelector('.show-role')

    //to assign cards to each board 
    const cardsShuffled = data.cards.allWords

    const boardBox = document.querySelectorAll('.card-btn-main')
    const spyBoardEl = document.querySelectorAll('.small-revealed-board .card-btn')

    for (let i=0; i<boardBox.length; i+=1){
      boardBox[i].setAttribute('id',`${i}`)
      boardBox[i].classList.add(`card-backface-${i}`)
      spyBoardEl[i].innerHTML = cardsShuffled[i]
      boardBox[i].innerHTML = cardsShuffled[i]  
    }
    //small board for spy master to see the cards 
    
    const mainGameBoard =document.querySelectorAll('#universal-game-board .col .card-btn-main')

    //if user is field operative, can only see the main gameboard
    if(!response.data.findGameuser.isSpy){
      showRole.innerHTML = 'FIELD OPERATIVE'
      const allCardsElement = document.querySelectorAll('#universal-game-board .card-btn')
      allCardsElement.forEach(card=> card.innerHTML ="")
      guessFieldEl.classList.add('hide')
      spyBoardContainer.classList.add('hide')
    }
    else{
      showRole.innerHTML = 'SPY'
      response.data.findGameuser.isRed? spyColor= 'red': spyColor= 'blue'

      const spyBoard = document.querySelector('.small-revealed-board .gameboard-container')
      // checkForCurrentTeam(spyColor)
      spyBoard.classList.remove('hide')


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

      //WHEN INDIVIDUAL CARD IS CLICKED ****
      mainGameBoard.forEach(card=> {
        card.addEventListener('click', (e)=>{
          console.log(response.data,"responsedata")
          console.log(data,"222")
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
            currentTeam: data.gamestate.currentTeam, 
            guessValue: tempGuessValue,
            colorSpy: spyColor, 
            isSpy:response.data.findGameuser.isSpy
          }
          //only one person can update the score 
          updateGameScore(gameData)
    
        })
      })
      checkForCurrentTeam(spyColor)
    }
  })
  .catch(error=>console.log(error))
}

const getGuessValue = ()=>{
  const guessValue = document.querySelector('#guesses-input').value 
  tempGuessValue = guessValue
  //need  to know who is the current team
  socket.emit('newGame')
  socket.on('returnGame', gameResult=>{
    gameBoardContainerEl.classList.remove('container-overlay')
    socket.emit('receiveGuess', guessValue,gameResult)
     mainGameBoardColsEl.forEach(element=>{
      element.style.pointerEvents = 'auto'
    })
  })

  guessinputFieldEl.innerHTML =""
}

const showGuessValue = ()=>{
   socket.on('showGuess', (...result)=>{
     const guessMessageDiv = document.querySelector('.show-guess')
     guessMessageDiv.innerHTML = `${result[0]}`
   })
}


/* -------------------------------------------------------------------------- */
/*                                INIT GAMMEEEE                               */
/* -------------------------------------------------------------------------- */



const initGame = ()=>{
  const lobbyContainerEl = document.querySelector('.lobby-wrapper')
  lobbyContainerEl.classList.add('hide')
  socket.on('returnGame',(gameData=>{

    checkUseridentity(gameData)
  
  }))

  showGuessValue()
  receiveChangeInCards()

}


const submitGameDetails = (e)=>{
  e.target.disabled = true 
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
      const waitingDiv = document.querySelector('.waiting-message')
      waitingDiv.innerHTML = `Waiting for others to join...`
      console.log(response.data)
      // showLobbyArea(response.data.roomData.roomId)
        //if in the case where exceed  
      socket.emit('findTeam')
      socket.on('startGame', ()=>{
      socket.emit('newGame')
      initGame()
    })
  }) 
}

/* -------------------------------------------------------------------------- */
/*                      DOM MANIPULATION TO SHOW AND HIDE                     */
/* -------------------------------------------------------------------------- */



roomBtn.addEventListener('click', submitPlayers)
submitGameUserDetailsBtn.addEventListener('click', submitGameDetails)
submitRoomCodeBtn.addEventListener('click', checkRoomcode)
guessSubmitBtn.addEventListener('click', getGuessValue)
submitHostBtn.addEventListener('click', submitHost)
usernameBtn.addEventListener('click', enterUsername)
joinRoomBtn.addEventListener('click', guestJoinRoom)



//update game state 


//user clicks a card, client check what is the cardValue and send to the server and check for identity --> if correct, query database and add 


  
console.log(score,"scoreeee", spyColor,"spyyyyy")

