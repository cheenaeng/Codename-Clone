import pkg from 'word-pictionary-list';
const {randomPictionaryWords} = pkg;

let newGameScore = [0,0]
let tempCorrectAns =0 
let newArrOfWords =[]
let inputGuess

const shuffleWords = (allWords)=>{
    //generate a random number from 0-24
    console.log(allWords.length,"words length")
    if (allWords.length>0){
    const randomNumber = Math.floor(Math.random()*allWords.length)
    
  //get the new item 
    const removedWord = allWords.splice(randomNumber, 1)
      console.log(removedWord)
  //then remove the item from the list 
    newArrOfWords.push(removedWord)

  //recursively call the function until words.length =0 
    shuffleWords(allWords)
    }  
    if (allWords.length===0) {
    return newArrOfWords
  }
}

const generateInitialGameState = ()=>{
   const randomNumber = Math.round(Math.random())
      let initalStartingTeam 
      let initalCurrentTeam 
      randomNumber ===0? initalStartingTeam = 'red': initalStartingTeam = 'blue'
      initalCurrentTeam = initalStartingTeam 
      const initialGameState = {
        startingTeam : initalStartingTeam, 
        currentTeam: initalCurrentTeam, 
        gameScore : [0,0]
      }
    return initialGameState
}
const generateCards = () =>{
  newArrOfWords =[]
  //need 25 random nouns/verbs/adjectives 
  // const randomWords= pkg(25)
  const randomWords = ['book','tree','paper','boat','prison','hospital','chef','sad', 'black', 'hat', 'socks', 'camel','fairy', 'netflix', 'berlin', 'america', 'casino', 'rich', 'war', 'late', 'water', 'sea', 'bed', 'cake', 'Mr Potato Head']
  
  console.log(randomWords, "random words")
  const startingTeamWords = randomWords.slice(0,9)
  const secondTeamWords = randomWords.slice(9, 17)
  const neutralWords = randomWords.slice(17,24)
  const bombWord = randomWords.slice(-1)
  shuffleWords(randomWords)
  console.log(randomWords)

  const cardsList = {
    allWords: newArrOfWords.flat(1),
    startingTeam: startingTeamWords, 
    secondTeam: secondTeamWords, 
    neutral: neutralWords, 
    bomb: bombWord
  }
  return cardsList
}

export default function initGameController(db) {

  const createGame = async (request,response) =>{
    try {
      //need to decide which team to start first, 0 for red team, 1 for blue team 
     const intialGamestate = generateInitialGameState()
     const cardsList = generateCards()
   
     const game = await db.Game.create({
       roomId: request.cookies.roomId, 
       gamestate: intialGamestate, 
       cards: cardsList,
     })
    response.cookie('gameId', game.id)
     response.send({game})
    }
    catch(error){
      console.log(error)
    }
  };  

  const findGame = async (request,response) =>{
    try {
      //need to decide which team to start first, 0 for red team, 1 for blue team 
  
     const game = await db.Game.findOne({
      where:{
        id: request.params.id
      }
     })

     response.send({game})
    }
    catch(error){
      console.log(error)
    }
  };  

  const findSingleGame = async (request,response) =>{
    try {
      //need to decide which team to start first, 0 for red team, 1 for blue team 
  
     const game = await db.Game.findOne({
      where:{
        id: request.cookies.gameId
      }
     })

     response.send({game})
    }
    catch(error){
      console.log(error)
    }
  };  

  //  const updateScore = async (request,response) =>{
  //   try {
  //     const data = request.body
  //     console.log(data)
  //     const cardToCheckIndex = data.cardValue
  //     //now to identify the card 

  //     const game = await db.Game.findOne({
  //       where:{
  //         id: data.gameId
  //       }
  //     })

  //     const cardIdentity =  game.cards.allWords[cardToCheckIndex]
  //     const cardsCategories = game.cards
  //     //to check whether this word falls in red team or blue team or neutral 
  //     let cardCategory 
  //      console.log(cardIdentity)
  //     for (let category in cardsCategories){
  //      cardsCategories[category].forEach(word=> {
  //         if (word === cardIdentity){
  //           cardCategory = category
  //         }
  //       })
  //     }
 
  //     const colorOfStartingTeam = game.gamestate.startingTeam
  //     let secondTeamColor 
  //     colorOfStartingTeam === 'blue'? secondTeamColor = 'red' : secondTeamColor = 'blue'
      
      
  //     let currentTeamColor
  //     inputGuess = parseInt(data.guessValue)
      

  //     if (game.gamestate.currentTeam === colorOfStartingTeam ){
  //       if (cardCategory === 'startingTeam'){
  //         newGameScore[0]+=1 
  //         currentTeamColor = colorOfStartingTeam
  //         tempCorrectAns +=1 
  //         if (inputGuess === tempCorrectAns){
  //           currentTeamColor = secondTeamColor
  //           tempCorrectAns =0 
  //         }
    
  //       }
  //       if (cardCategory === 'secondTeam'){
  //         newGameScore[1] +=1 
  //         currentTeamColor = secondTeamColor
  //         tempCorrectAns =0 
  //       }
  //       if (cardCategory === 'neutral'){
  //         currentTeamColor = secondTeamColor
  //         tempCorrectAns =0 
  //       }
     
  //     } 
  
  //     //if current team is the secondTeam 
  //     else{

  //       if (game.gamestate.currentTeam === secondTeamColor){

  //         if (cardCategory === 'secondTeam'){
  //           newGameScore[1]+=1 
  //           currentTeamColor = secondTeamColor
  //           tempCorrectAns +=1 
        
  //           if (inputGuess === tempCorrectAns){
  //               currentTeamColor = colorOfStartingTeam
  //               tempCorrectAns =0 
  //               }
  //         }

  //         if (cardCategory === 'startingTeam'){
  //           newGameScore[0]+=1 
  //           currentTeamColor = colorOfStartingTeam
  //           tempCorrectAns =0 
  //         }

  //         if (cardCategory === 'neutral'){
  //           currentTeamColor = colorOfStartingTeam
  //           tempCorrectAns =0 
  //         }
    
  //       }

  //     }
      
  //     console.log('1'+game.gamestate.currentTeam,colorOfStartingTeam,secondTeamColor)
  //     console.log('2'+'currenteamcolor', currentTeamColor)

     

  //     //need to update current team and teamscore 
  //     const updatedGameState = {
  //       startingTeam : colorOfStartingTeam, 
  //       currentTeam: currentTeamColor,
  //       gameScore : newGameScore, 
  //       cardValueClicked: data.cardValue,
  //       secondTeam: secondTeamColor, 
  //       cardCategoryClicked : cardCategory, 
  //       cardAnswer: cardIdentity,
  //       previousTeam: data.currentTeam

  //     }
  //     console.log(tempCorrectAns,inputGuess)
     

  //     const updatedGame = await db.Game.update(
  //       {
  //         gamestate : updatedGameState
  //       },
  //       { 
  //         where:{
  //           id: data.gameId
  //         }
  //       })
    
  //    response.send({updatedGameState})
  

  //   }
  //   catch(error){
  //     console.log(error)
  //   }
  // };  

 return {
   findGame,createGame
  }
}