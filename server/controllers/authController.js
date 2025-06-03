const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel.js');
const transporter = require('../config/nodemailer.js');
const crypto = require('crypto');

// Helper function to hash password with SHA-256 (same as client)
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
}

const register = async (req, res) => {
    const {name, email, password} = req.body;  

    if(!name || !email || !password){
        return res.json({success: false, message: 'Missing Details'})
    }

    try {
        // Finding Existing user
        const existingUser = await userModel.findOne({email})

        if(existingUser){
            return res.json({ success: false, message: "User already exists" });
        }

        // Hash the already client-side encrypted password with bcrypt for storage
        const hashedPassword = await bcrypt.hash(password, 10);

        // If everything is clear new user is being created
        const user = new userModel({name, email, password: hashedPassword})
        // user saved in the database
        await user.save();

        //JWT
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60  * 1000
        })

        // Sending Welcome Email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Procture',
            text: `Welcome to Procture. Your Account has been created with the email id: ${email}`
        }

        try {
            await transporter.sendMail(mailOptions);
            console.log("Mail sent successfully.");
        } catch (err) {
            console.error("Mail error:", err);
        }

        return res.json({success: true});
        
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

const login = async (req, res) => {
    const {email, password} = req.body; 
    
    if(!email || !password){
        return res.json({success: false, message: 'Email and Password Required'})
    }

    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success: false, message: 'Invalid email'})
        }

        // Compare the client-side encrypted password with the stored bcrypt hash
        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.json({success: false, message: 'Invalid password'}) 
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60  * 1000
        })

        return res.json({success: true});

    } catch (error) {
        res.json({success: false, message: error.message}) 
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60  * 1000 
        })

        return res.json({success: true, message: "Logged Out"})
    } catch (error) {
      res.json({success: false, message: error.message});  
    }
}

// Send Verification Otp to the User's Email
const sendVerifyOtp = async (req, res)=>{
    try {
        // const {userId} = req.body;
        const userId = req.user?.id;

        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({success: false, message: "Account Alredy Verified"})
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000) ) // generate a 6 digit random number

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hrs

        await user.save();

        const mailOption ={
            from: process.env.SENDER_EMAIL,
            to: user.email, // this will come form the email entered by the user in the body
            subject: 'OTP For Account Verification',
            text: `Your OTP is ${otp}. Verify your account using this OTP`
        }

        try {
            await transporter.sendMail(mailOption);
            res.json({success: true, message: 'Verification OTP Sent on Email'});
        } catch (err) {
            console.error("Mail error:", err);
        }

    } catch (error) {
       res.json({success: false, message: error.message})
    } 
}

const verifyEmail = async (req, res)=>{
    const userId = req.user?.id;
    const {otp} = req.body;

    //  const {userId, otp} = req.body;

    if(!userId || !otp){
       return  res.json({success: false, message: 'Missing Details'}); 
    } 

    try {
        const user = await userModel.findById(userId); 

        if(!userId){
           return  res.json({success: false, message: 'User Not Exisit'}); 
        }

        if (!user.verifyOtp || user.verifyOtp.trim() !== String(otp).trim()) {
             return res.json({ success: false, message: 'Invalid OTP' });
        }

        if(user.verifyOtpExpireAt < Date.now()){
           return res.json({success: false, message: 'OTP Expired' }); 
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res.json({success: true, message: 'Email Verified Successfully'})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// To check if the user is Authenticated
const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true});
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

//Send Password reset OTP
const sendResetOtp = async (req, res) => {
    const {email} = req.body;

    if(!email){
        return res.json({success: false, message: 'Email is required'})
    }

    try {
        // Finding Existing user
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success: false, message: 'User Not found'}) 
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000) ) // generate a 6 digit random number

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        await user.save();

        const mailOption ={
            from: process.env.SENDER_EMAIL,
            to: user.email, // this will come form the email entered by the user in the body
            subject: 'OTP For Changing Password',
            text: `Your OTP is Resetting your password is ${otp}. Use this OTP to proceed with resetting your password`
        }

        try {
            await transporter.sendMail(mailOption);
            res.json({success: true, message: 'OTP Sent on your Email to chnage the password'});
        } catch (err) {
            console.error("Mail error:", err);
        }


    } catch (error) {
       res.json({success: false, message: error.message}) 
    }

}

// Reset User Password
const resetPassword = async (req, res) => {
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success: false, message: 'Email , OTP and New Password are required'})
    }

    try {
        // Finding Existing user
        const user = await userModel.findOne({email})

        if(!user){
           return res.json({success: false, message: 'User Not found'}) 
        }

        if(user.resetOtp === "" || user.resetOtp !== otp){ // if the otp is empty or otp in db dont match with the otp provided by the user
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        if(user.resetOtpExpireAt < Date.now()){ // if the otp is expired, the time limit has exceded
            return res.json({ success: false, message: 'OTP Expired'})
        }

        // Convert the new password provided bu the user into a hashed password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword; // update the current password with the hased passsword

        user.resetOtp = ''; //convert this back to default form
        user.resetOtpExpireAt = 0; //convert this back to default form

        await user.save();

        return res.json({success:true, message: 'Your Password has been reset Successfully'});

    } catch (error) {
        res.json({success: false, message: error.message})   
    }
}


module.exports = {register, login, logout, sendVerifyOtp, verifyEmail, isAuthenticated, sendResetOtp, resetPassword };