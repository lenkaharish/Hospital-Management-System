const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const Doctor = require('../models/Doctor');
const SECRET_KEY = "your_secret_key"


const registerPatient = async (req, res) => {
    // #swagger.tags=['Patient']
    try {
        const { fullName, age, gender, email, phone, address, problems, password,role } = req.body;

        if (!fullName || !age || !gender || !email || !phone || !address || !problems || !password) {
            return res.status(400).json({ success:false , message: "All fields are required" });
        }

        const existingPatient = await Patient.findOne({ $or: [{ email }, { phone }] });
        if (existingPatient) {
            return res.status(400).json({ success:false, message: "Patient with this email or phone already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const patient = new Patient({
            fullName,
            age,
            gender,
            email,
            phone,
            password: hashedPassword,
            role: role,
            problems,
            address  
        });

        await patient.save();
        const token = jwt.sign(
            { id: patient._id, role: patient.role },
            SECRET_KEY,
            { expiresIn: "7d" } 
        );

        res.status(201).json({ success:true,
            message: "patient  registered successfully",
            token,
            patient: {
                id: patient._id,
                fullName: patient.fullName,
                email: patient.email,
                role: patient.role
            } });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



const getPatientProfile = async(req,res)=>{
    // #swagger.tags=['Patient']
    try{
        
        if(req.user.role !=="patient"){
            return res.status(403).json({
                message:"Access Denied.Please provide a patient token"
            });
        }

        const patient = await Patient.findOne({_id:req.user.userId}).select('-password');
        if(!patient){
            res.status(404).json({message:"Patients not found"})
        } 

        return res.status(400).json({
            message:"Patient fetched successfully",
            patient
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message

        })
    }
}

const updatePatientProfile = async(req,res)=>{
    // #swagger.tags=['Patient']
    try{
        const patientId = req.user.userId;
        const { fullName, age, gender, phone, address, problems } = req.body;

        const patient = await Patient.findById(patientId).select('-password -email');
        if(!patient){
            res.status(404).json({
                success:false,
                message:"Patient not found"
            })
        }

        if(fullName) patient.fullName = fullName;
        if(age) patient.age = age;
        if(gender) patient.gender = gender;
        if(phone) patient.phone = phone;
        if(address) patient.address = address;
        if(problems) patient.problems = problems;

        await patient.save();

        res.status(200).json({
            success:true,
            message:"Patient updated successfully",
            patient
        })



    }catch(error){
        res.status(500).json({
            success:false,
            message:"Internal server error",
            error: error.message
        })
    }
}


const searchPatients = async(req,res)=>{
    // #swagger.tags=['Patient']
    try{

        const { name, id, phone } = req.query;


        if(req.user.role !== "receptionist"){
            return res.status(403).json({
                success:false, message:"Access Denied.Only receptionist can performe serches"
            });
        }
         const query = {};

         if(name) query.fullName = { $regex: new RegExp(name, "i") };
         if (id) query._id = id;
         if (phone) query.phone = phone;

         const patients = await Patient.find(query).select("-password");

         if (patients.length === 0) {
            return res.status(404).json({ success: false, message: "No patients found." });
        }

         res.status(200).json({ success: true, patients });

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message
        })
    }
}

const deletePatientProfile = async(req,res)=>{
    // #swagger.tags=['Patient']
    try{
        const patientId = req.user.userId;

        const patient = await Patient.findById(patientId);
        if(!patient){
            res.status(404).json({
                success:false,
                message:"Patient not found"
            })
        }

        await Patient.findByIdAndDelete(patientId);
        res.status(200).json({
            success:true,
            message:"Profile deleted successfully"
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:"Internal server error",
            error: error.message
        })
    }
}

module.exports = { registerPatient, getPatientProfile, updatePatientProfile, searchPatients, deletePatientProfile };
