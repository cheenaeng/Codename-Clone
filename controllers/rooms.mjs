import randomize from 'randomatic'

// db is an argument to this function so
// that we can make db queries inside
export default function initRoomsController(db) {

  const getRoomCode = async (request,response) =>{
    try {
    //teamChosen - json format (team:{[0,0] - R:B}, redSpy:true/false, blueSpy:true/false)

    const initialTeamCreated = {
      teamPlayerCount: [0,0], 
      redSpy: false,
      blueSpy: false 
    }
    
     const roomCode = randomize('A', 4)
     console.log(roomCode)
     const createRoom = await db.Room.create({
       roomCode: roomCode, 
       hostId: request.cookies.hostId, 
       playersNumber: request.body.playerNumbers, 
       teamChosen: initialTeamCreated 
     })

     response.cookie('roomId', createRoom.id)
     response.send({createRoom})
    }
    catch(error){
      console.log(error)
    }
  };  
  
  const checkRoomCode = async (request,response) =>{
    try {
     const findRoom = await db.Room.findOne({
       where:{
        roomCode: request.body.roomCode, 
       }
     })
     response.cookie('roomId',findRoom.id)
     response.send({findRoom})
    }
    catch(error){
      console.log(error)
    }
  };

  const updateTeamDetails = async (request,response) =>{
    try {
      const findRoom = await db.Room.findOne({
       where:{
         id: request.cookies.roomId
       }
     })
      const teamDetails = findRoom.teamChosen
      const updatedTeamDetails = request.body
      let updatedDetails

      updatedTeamDetails.teamSelected === "red"? teamDetails.teamPlayerCount[0] +=1 : teamDetails.teamPlayerCount[1] +=1 

      if (updatedTeamDetails.role ==="spy" && updatedTeamDetails.teamSelected === "red"){
        teamDetails.redSpy = true 
      }
      if (updatedTeamDetails.role ==="spy" && updatedTeamDetails.teamSelected === "blue"){
        teamDetails.blueSpy = true 
      }

      const updateRoom = await db.Room.update({
        teamChosen: teamDetails
        },{
          where:{
          id: request.cookies.roomId, 
        }
      })

      const roomData = {
        id: request.cookies.roomId
      }
    
      response.send({roomData})
    }
    catch(error){
      console.log(error)
    }
  };
  
 return {
    getRoomCode,checkRoomCode, updateTeamDetails
  };
 
}