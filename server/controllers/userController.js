const userModel = require("../models/userModel.js");
const logger = require("../logs/logger.js");

const getUserData =  async(req, res) =>{
    try {

        // const {userId} = req.body;
         const userId = req.user?.id;
        
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified,
            }
        })
        
    } catch (error) {
        logger.error('Error while fetching user data', {
            userId,
            error: error.message,
            stack: error.stack
        });

        res.json({success: false, message: error.message})    
    }
}
 
module.exports = {getUserData};