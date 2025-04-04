const Doctor = require('../models/Doctor');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const SECRET_KEY = "your_secret_key"


const registerDoctor = async (req, res) => {
    // #swagger.tags=['Doctors']
    try {
        const { fullName, specialization, phone, email, password, experience, role } = req.body;

        if (!fullName || !specialization || !phone || !email || !password || !experience) {
            return res.status(400).json({ success:false , message: "All fields are required" });
        }

        const existingDoctor = await Doctor.findOne({ $or: [{ email }, { phone }] });
        if (existingDoctor) {
            return res.status(400).json({ success:false, message: "Doctor with this email or phone already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const doctor = new Doctor({
            fullName,
            specialization,
            phone,
            email,
            password: hashedPassword,
            experience,
            role: role  
        });

        await doctor.save();

        //  Generate JWT Token
        const token = jwt.sign(
            { id: doctor._id, role: doctor.role },
            SECRET_KEY,
            { expiresIn: "7d" } 
        );

        res.status(201).json({ success:true,
             message: "Doctor registered successfully",
            token,
            doctor: {
                id: doctor._id,
                fullName: doctor.fullName,
                email: doctor.email,
                role: doctor.role
            }
         });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const getDoctorProfile = async(req,res)=>{
    // #swagger.tags=['Doctors']
    try{
        
        if(req.user.role !=="doctor"){
            return res.status(403).json({
                success:false,
                message:"Access Denied.Please enter doctor token"
            })
        }

        const doctor = await Doctor.findOne({_id: req.user.userId}).select('-password');
        if(!doctor){
            return res.status(404).json({
                success:false,
                message: "No doctors found"
            })
        }

        return res.status(200).json({success:true, message:"Doctor fetched successfully", doctor})

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message

        })
    }
}


const updateDoctorProfile = async(req,res)=>{
    // #swagger.tags=['Doctors']
    try{

        const  doctorId  = req.user.userId;
        const {  fullName,  phone, experience } = req.body;

        const doctor = await Doctor.findById(doctorId).select('-email -password');
        if(!doctor){
            return res.status(404).json({
                success:false,
                message:"Doctor not found"
            })
        }

        if(phone && phone !== doctor.phone){
            const existingDoctor = await Doctor.findOne({ phone});
            if(existingDoctor){
                return res.status(400).json({
                    success:false,
                    message:"phone number is already in use"
                })
            }
        }

        if(fullName) doctor.fullName = fullName;
        if(phone) doctor.phone = phone;
        if(experience) doctor.experience = experience;

        await doctor.save();

        res.status(200).json({
            success:true,
            message:"Profile updated successfully",
            doctor
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message
        })
    }
}


const searchDoctors =  async (req, res) => {
    // #swagger.tags=['Doctors']
    try {
          
        const { name, id,  phone, specialization } = req.query;
        
        if (req.user.role !== "receptionist") {
            return res.status(403).json({ success: false, message: "Access denied. Only receptionists can perform searches." });
        }

        const query = {};
        if (id) query._id = id;
        if (name) query.fullName = { $regex: new RegExp(name, "i") };
        if (specialization) query.specialization = { $regex: new RegExp(specialization, "i") };
        if (phone) query.phone = phone;

        const doctors = await Doctor.find(query).select("-password");    

        if(doctors.length==0){
            return res.status(404).json({success:false, 
                message:"No doctors found"
            })
        }

        res.status(200).json({ success: true, doctors });
    }catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

const deleteDoctorProfile = async(req,res)=>{
    // #swagger.tags=['Doctors']
    try{

        const doctorId = req.user.userId;

        const doctor = await Doctor.findById(doctorId);
        if(!doctor){
            res.status(404).json({
                success:false,
                message:"Doctor not found"

            })
        }

        await Doctor.findByIdAndDelete(doctorId);

        res.status(200).json({
            success:true,
            message:"Profile deleted successfully"
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:"server error",
            error:error.message
            
        })
    }
}



module.exports = { registerDoctor, getDoctorProfile, updateDoctorProfile, searchDoctors, deleteDoctorProfile };
