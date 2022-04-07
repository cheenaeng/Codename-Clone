export default function initHostController(db) {

  const createGameHost = async (request,response) =>{
    try {

     const hostUser = await db.Host.create({
       username: request.body.host, 
     })
     response.cookie('hostId', hostUser.id)
     response.send({hostUser})
    }
    catch(error){
      console.log(error)
    }
  };  
 return {
    createGameHost
  }
}