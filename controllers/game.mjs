import pkg from 'word-pictionary-list';
const {randomPictionaryWords} = pkg;


let newArrOfWords =[]
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
  const randomWords= pkg(25)
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

  // const checkGameCards = async (request,response) =>{
  //   try {
  //    //check card that is sent via request.body --> does it belong to red team or blue team 

  //    //this gives the card id 
  //    const cardToCheckIndex = request.body.card
  //    //now to identify the card 

  //    const game = await db.Game.findOne({
  //     where:{
  //       id: request.params.id 
  //     }
  //    })

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

  //     //1. need to check which is the starting team and who is the second, check starting team color, else is second 
  //     const colorOfStartingTeam = game.gamestate.startingTeam
  //     let secondTeamColor 
  //     colorOfStartingTeam === 'blue'? secondTeamColor = 'red' : secondTeamColor = 'blue'
  //     console.log(secondTeamColor)
  //     //check the word, which team it belongs to. if word belongs to starting team AND if current team === starting team, add points to the team does it belongs to.

  //     //if current team is the starting team 
  //     if (game.gamestate.currentTeam === colorOfStartingTeam ){
  //       if (cardCategory === 'startingTeam'){
  //         game.gamestate.gameScore[0]+=1 
  //       }
  //       if (cardCategory === 'secondTeam'){
  //         game.gamestate.gameScore[1] +=1 
  //         game.gamestate.currentTeam = secondTeamColor
  //       }
  //       if (cardCategory === 'neutral'){
  //         game.gamestate.currentTeam = secondTeamColor
  //       }
  //     } 
  //     //if current team is the secondTeam 
  //     if ( game.gamestate.currentTeam === secondTeamColor){
  //       if (cardCategory === 'secondTeam'){
  //         game.gamestate.gameScore[1]+=1 
  //       }
  //       if (cardCategory === 'startingTeam'){
  //         game.gamestate.gameScore[0] +=1 
  //         game.gamestate.currentTeam = colorOfStartingTeam
  //       }
  //       if (cardCategory === 'neutral'){
  //         game.gamestate.currentTeam = colorOfStartingTeam
  //       }
  //     }

  //     //need to update current team and teamscore 
  //     const updatedGameState = {
  //       startingTeam : colorOfStartingTeam, 
  //       currentTeam: game.gamestate.currentTeam, 
  //       gameScore : game.gamestate.gameScore
  //     }


  //     const updatedGame = await db.Game.update(
  //       {
  //         gamestate : updatedGameState
  //       },
  //       { 
  //         where:{
  //           id: request.params.id 
  //         }
  //       })
      
  //     console.log(updatedGame)
  //     const result = {
  //       cardCategory : cardCategory, 
  //       updatedGameStatus: updatedGameState, 
  //       cardAnswer: cardIdentity
  //     }

  //    response.send({result})
  //   }
  //   catch(error){
  //     console.log(error)
  //   }
  // };  
  

 return {
   findGame,createGame
  }
}