const Client = require("express").Router();
const connector = require("../components/connector");
const Protector = require("../middleware/Protector");


// get all equipments that are not taken
Client.get("/getavailable" , Protector , (req , res)=>{
    // authorize user
    if(!req.user){
        res.json({
            error:true,
            message:`No authorized user was found`,
            status:404,
        })
    }

    const { previledge , userID } = req.user[0];
    console.log(userID);
    if(previledge == "admin"){
        res.json({
            error:true,
            message:`You are currently and admin kindly downgrade to client to access this`,
        })
    }
    // end of auth
    const getAvailableQuerry = "SELECT * FROM equipments where ((NOT (LENGTH(equipments.whohas) > 0)) OR (equipments.whohas ='"+userID+"')) AND (NOT equipments.taken='true') AND (equipments.state='present')";
    // const getAvailableQuerry = "SELECT * FROM equipments (CASE equipments.whohas='' THEN NULL ELSE equipments.whohas='"+userID+"' END) AND (NOT equipments.taken='true') AND (equipments.state='present'";
    connector.query(getAvailableQuerry, (error , results , fields)=>{
        if(error){
            res.json({
                error:true,
                message:`Faced an error fetching\n${error}`,
                status:404,
            })
        }
        if(results.length > 0){
            res.json({
                error:false,
                message:`Got equipments`,
                equipments:results,
            })
        }else{
            res.json({
                error:false,
                message:`Got equipments`,
                equipments:[],
            })
        }
    })
});
// request for an equipment
Client.get("/borrow/:equipmentID" , Protector , (req , res)=>{
    // authorize user
    if(!req.user){
        res.json({
            error:true,
            message:`No authorized user was found`,
            status:404,
        })
    }
    const { previledge , userID } = req.user[0];
    console.log(userID);
    
    if(previledge == "admin"){
        res.json({
            error:true,
            message:`You are currently and admin kindly downgrade to client to access this`,
        })
    }
    // end of auth
    const { equipmentID } = req.params;
    if(!equipmentID){
        res.json({
            error:false,
            message:`Equipment id was not was not passed`,
        })
    }

    const checkQuerry = "SELECT state, taken , requested , whohas FROM equipments where equipments.equipmentID='"+equipmentID+"'"
    const bookQuerry = "UPDATE equipments SET requested='true',whohas='"+userID+"' WHERE equipments.equipmentID='"+equipmentID+"'";
    connector.query(checkQuerry , (error , results , fields)=>{
        if(error){
            res.json({
                error:true,
                message:`Faced an sql error\${error}`,
                status:404,
            });
        }
        const { state , taken , requested , whohas } = results[0];
        if(!((state == "present") && (requested == "false") && !whohas.length > 0)){
            res.json({
                error:true,
                message:`Equipment has already been booked`,
            })
        }else{
            // now set it as booked -- booked and user id d
            connector.query(bookQuerry, (error)=>{
                if(error){
                    res.json({
                        error:true,
                        message:`Faced an error while requesting for the equipment\n${error}`,
                        status:500,
                    });
                }
                res.json({
                    error:false,
                    message:`Equipment with id ${equipmentID} has been successfully requested for booking`,
                    status:200,
                })
            })
        }
    });
})
// return an equipments


module.exports = Client;