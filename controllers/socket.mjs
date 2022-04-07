export default function  initSocketController(db, dataRoomId) {
  const getCapacity = async () =>{
    try{
      const findPlayersCapacity =  await db.Room.findOne({
        where:{
        id: dataRoomId, 
        }
      })
      return findPlayersCapacity
    }
    catch(error){
      console.log(error)
    }
  }

  const findGame = async () =>{
    try{
      const game = await db.Game.findOne({
        where:{
          roomId: dataRoomId
        }
       
      })
      return game
    }
      catch(error){
        console.log(error)
      }
  }


  return {getCapacity, findGame}
 }

