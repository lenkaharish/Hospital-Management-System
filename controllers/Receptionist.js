const Receptionist = require('../models/Receptionist');
const bcrypt = require("bcrypt");
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');
const SECRET_KEY = "your_secret_key"

const registerReceptionist = async (req, res) => {
    // #swagger.tags=['Receptionist']
    try {
        const { fullName, phone, email, password, role } = req.body;

        if (!fullName || !phone || !email || !password || !role) {
            return res.status(400).json({ success:false , message: "All fields are required" });
        }

        const existingReceptionist = await Receptionist.findOne({ $or: [{ email }, { phone }] });
        if (existingReceptionist) {
            return res.status(400).json({ success:false, message: "Receptionist with this email or phone already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const receptionist = new Receptionist({
            fullName,
            phone,
            email,
            password: hashedPassword,
            role: role  
        });

        await receptionist.save();

        const token = jwt.sign(
            { id: receptionist._id, role: receptionist.role },
            SECRET_KEY, 
            { expiresIn: "365d" }
        );

        res.status(201).json({ success:true,
            message: "Receptionist registered successfully",
            token,
            receptionist:{
                id: receptionist._d,
                fullName: receptionist.fullName,
                email: receptionist.email,
                role: receptionist.role
            }
         });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const login = async (req, res) => {
    // #swagger.tags=['Login']
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        let user;
        let role;

        // Check in Doctors, Patients, Receptionists
        user = await Doctor.findOne({ email });
        if (user) role = "doctor";

        if (!user) {
            user = await Patient.findOne({ email });
            if (user) role = "patient";
        }

        if (!user) {
            user = await Receptionist.findOne({ email });
            if (user) role = "receptionist";
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role },
            "your_secret_key", 
            { expiresIn: "365d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: { id: user._id, email: user.email, role, fullName: user.fullName }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


const getReceptionistProfile = async(req,res)=>{
    // #swagger.tags=['Receptionist']
    try{

        if(req.user.role !=="receptionist"){
            return res.status(403).json({
                message:"Access Denied.Please enter a receptionist  token"
            })
        }

        const receptionist = await Receptionist.findOne({_id: req.user.userId}).select('-password');
        if(!receptionist){
            return res.status(404).json({
                message:"Receptionist not found"
            })
        }

        return res.status(400).json({
            message:'Receptionist fetched successfully',
            receptionist
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message
        })
    }
}

const updateReceptionistProfile = async(req,res)=>{
    // #swagger.tags=['Receptionist']
    try{
        const receptionistId = req.user.userId;
        const{ fullName, phone } = req.body;

        const receptionist = await Receptionist.findById(receptionistId).select('-password -email');
        if(!receptionist){
            res.status(404).json({
                success:false,
                message:"Receptionist not found"
            })
        }

        if(fullName) receptionist.fullName = fullName;
        if(phone) receptionist.phone = phone

        await receptionist.save();

        res.status(200).json({
            success:true,
            message:"Profile update successfully",
            receptionist
        })

        

    }catch(error){
        res.status(500).json({
            success:false,
            message:"Server error",
            error: error.message
        })
    }
}

const deleteReceptionistProfile = async(req,res)=>{
    // #swagger.tags=['Receptionist']
    try{
        const receptionistId = req.user.userId;
     
        const receptionist = await Receptionist.findById(receptionistId);
        if(!receptionist){
            return res.status(404).json({
                success:false,
                message:"Receptionist not found"
            })
        }

        await Receptionist.findByIdAndDelete(receptionistId);

        return res.status(200).json({
            success:true,
            message:"Profile deleted successfully"
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message
        })
    }
}


module.exports = { registerReceptionist, login, getReceptionistProfile, updateReceptionistProfile, deleteReceptionistProfile };
