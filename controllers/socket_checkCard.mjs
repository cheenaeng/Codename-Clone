export default function  initSocketCardController(db, data,inputGuess,tempCorrectAns,bonus ) {
   const checkGameCards = async () =>{
    try {
      let correctGuess = false  
     //check card that is sent via request.body --> does it belong to red team or blue team 

     //this gives the card id 
     const cardToCheckIndex = data.cardValue
     //now to identify the card 

     const game = await db.Game.findOne({
      where:{
        id: data.gameId
      }
     })

      const cardIdentity =  game.cards.allWords[cardToCheckIndex]
      const cardsCategories = game.cards
      //to check whether this word falls in red team or blue team or neutral 
      let cardCategory 
       console.log(cardIdentity)
      for (let category in cardsCategories){
       cardsCategories[category].forEach(word=> {
          if (word === cardIdentity){
            cardCategory = category
          }
        })
      }

      //1. need to check which is the starting team and who is the second, check starting team color, else is second 
      const colorOfStartingTeam = game.gamestate.startingTeam
      let secondTeamColor 
      colorOfStartingTeam === 'blue'? secondTeamColor = 'red' : secondTeamColor = 'blue'
      console.log(secondTeamColor)

      let currentTeamColor
      let newGameScore =[]

      //check the word, which team it belongs to. if word belongs to starting team AND if current team === starting team, add points to the team does it belongs to.

      //if current team is the starting team 
      if (game.gamestate.currentTeam === colorOfStartingTeam ){
        if (cardCategory === 'startingTeam'){
          newGameScore[0]+=1 
          currentTeamColor = colorOfStartingTeam
          tempCorrectAns +=1 
          console.log(tempCorrectAns,"temppppp",inputGuess,"inputt")
          if (inputGuess <= tempCorrectAns && !bonus){
            console.log(tempCorrectAns,"temppppp", inputGuess)
            currentTeamColor = secondTeamColor
            tempCorrectAns =0 
          }
          if (inputGuess <= tempCorrectAns && bonus){
            inputGuess +=1 
            bonus = false 
          }
        }
        if (cardCategory === 'secondTeam'){
          game.gamestate.gameScore[1] +=1 
          currentTeamColor = secondTeamColor
          tempCorrectAns =0 
        }
        if (cardCategory === 'neutral'){
          currentTeamColor = secondTeamColor
          tempCorrectAns =0 
        }
     
      
      } 
      //if current team is the secondTeam 
      if ( game.gamestate.currentTeam === secondTeamColor){
        if (cardCategory === 'secondTeam'){
          newGameScore[1]+=1 
          currentTeamColor = secondTeamColor
          tempCorrectAns +=1 
          console.log(tempCorrectAns,"temppppp",inputGuess)
          if (inputGuess <= tempCorrectAns && !bonus){
              console.log(inputGuess,tempCorrectAns)
              currentTeamColor = colorOfStartingTeam
              tempCorrectAns =0 
             }
          if (inputGuess <= tempCorrectAns && bonus){
            console.log(tempCorrectAns,"temppppp", inputGuess)
              inputGuess +=1 
              bonus = false 
            }
        }
        if (cardCategory === 'startingTeam'){
          game.gamestate.gameScore[0] +=1 
          currentTeamColor = colorOfStartingTeam
           tempCorrectAns =0 
        }
        if (cardCategory === 'neutral'){
          currentTeamColor = colorOfStartingTeam
           tempCorrectAns =0 
        }
     
      }

      console.log('currenteamcolor', currentTeamColor)

      //need to update current team and teamscore 
      const updatedGameState = {
        startingTeam : colorOfStartingTeam, 
        currentTeam: currentTeamColor,
        gameScore : newGameScore
      }


      const updatedGame = await db.Game.update(
        {
          gamestate : updatedGameState
        },
        { 
          where:{
            id: data.gameId
          }
        })
      
      console.log(updatedGame)
      const result = {
        cardCategory : cardCategory, 
        updatedGameStatus: updatedGameState, 
        cardAnswer: cardIdentity,
        cardValue: data.cardValue, 
        startingTeam: colorOfStartingTeam, 
        secondTeam: secondTeamColor, 
        updatedBonus: bonus, 
        updatedInputGuess: inputGuess, 
        updatedTempScore: tempCorrectAns
      }

     return result 
    }
    catch(error){
      console.log(error)
    }
  };  

  return {checkGameCards}
 }




  