export default function initGameUserController(db) {

  const postGameUserDetail = async (request,response) =>{
    try {

     const createGameUser = await db.Gameuser.create({
       username: request.body.username, 
       roomId: request.cookies.roomId, 
     })
     response.cookie('gameuserId', createGameUser.id)
     response.send({createGameUser})
    }
    catch(error){
      console.log(error)
    }
  };  

  const addTeamRoleDetails = async (request,response) =>{
    try {
      const teamResult = request.body.teamSelected
      const roleSelected = request.body.role 
  
      let teamRed
      let spyRole
      teamResult === "red"? teamRed = true: teamRed = false 
      roleSelected === "spy"? spyRole = true: spyRole = false 

     const updateGameUser = await db.Gameuser.update({
       isSpy: spyRole,
       isRed: teamRed  
     }, {
       where:{
         id: request.cookies.gameuserId
       }
     })
     response.send({updateGameUser})
    }
    catch(error){
      console.log(error)
    }
  };  

  const checkGameuserIdentity = async (request,response) =>{
    try {
    
     const findGameuser = await db.Gameuser.findOne(
      { 
       where:
       {
         id: request.cookies.gameuserId
       }
     })
     response.send({findGameuser})
    }
    catch(error){
      console.log(error)
    }
  };  
 return {
    postGameUserDetail,addTeamRoleDetails, checkGameuserIdentity
  }
}