const Slot = require('../models/Slot');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');


const createSlot = async(req,res)=>{
    // #swagger.tags=['Slots']
    try{

        if(req.user.role !== "receptionist"){
            return res.status(403).json({success:false, message:"Access Denied only receptionist can create slots"});
        }

        const { doctorId, patientId, date, time } = req.body;

        if(!date || !time){
            return res.status(400).json({success:false, message:"Please enter a valid date and time"})
        }
        

        const doctor = await Doctor.findById(doctorId)
        if(!doctor){
            return res.status(404).json({success:false, message:"Doctor not found"});
        }

        const patient = await Patient.findById(patientId);
        if(!patient){
            return res.status(404).json({success:false, message:"Patient not found"});
        }

        const activeSlot = await Slot.findOne({ doctorId, patientId, status:"Booked"});
        if(activeSlot){
            return res.status(400).json({
                success:false,
                message:"Patient also Active booking.Please complete the previous booking complete"
            })
        }


        const completeSlot = await Slot.findOne({ doctorId, patientId, status:"Completed"});
        if(completeSlot){
            console.log("Patient had completed slot.Now booking again");
        }
        
        const existingDoctorSlot = await Slot.findOne({ doctorId, date, time});
        if(existingDoctorSlot){
            return res.status(400).json({
                success:false,
                message:"This doctor already has a booking at this time. Please choose a different time slot."
            })
        }

        const existingPatientSlot = await Slot.findOne({ patientId, date, time});
        if(existingPatientSlot){
            return res.status(400).json({
                success:false,
                message:"This patient already has a booking at this time.Please choose a different time slot."
            })
        }

        
        const newSlot = new Slot ({
            doctorId,
            patientId,
            date,
            time,
            status:"Booked"

        })
        await newSlot.save()

        res.status(200).json({success:true,
            message:"Slot Booked successfully",
            slot: newSlot});

    }catch(error){
        res.status(500).json({
            success:false,
            message:"server error",
            error:error.message

        })
    }
}


const getSlotByDoctor = async(req,res)=>{
    // #swagger.tags=['Slots']
    try{

        const { doctorId }= req.params;

        if(req.user.role !=="receptionist"){
            return res.status(403).json({
                success:false,
                message:"Unauthorized token.Please provide valid token"
            })
        }
                   
        const slots = await Slot.find({ doctorId})
        .populate('doctorId', 'fullName specialization')
        .populate('patientId', 'name age problems')

        if(!slots || slots.length === 0){
            return res.status(404).json({
                success:false,
                message:"No slots booking for this doctor"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Slots fetched successfully",
            slots
        })


    }catch(error){
        return res.status(404).json({
            success:false,
            message:"Internal server error",
            error:error.message
        })
    }
}


const getSlotsByPatient = async(req,res)=>{
    // #swagger.tags=['Slots']
    try{
        const { patientId } = req.params;

        if(req.user.role !=="receptionist"){
            return res.status(403).json({
                success:false,
                message: "Unauthorized token.Please provide a valid token",
            })
        }

        const slots = await Slot.find({ patientId })
        .populate('patientId', 'name age problems')
        .populate('doctorId', 'fullName specialization');

        if(!slots || slots.length == 0){
            return res.status(404).json({
                success:false,
                message:"No slots booked for this patient"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Slots retrieved succesfully",
            slots:slots.map(slot=>({
                patientId: slot.patientId,
                doctorId: slot.doctorId,
                date:slot.date,
                time:slot.time,
                status:slot.status
            }))           
            
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message
        })
    }
}

const cancelSlot = async(req,res)=>{
    // #swagger.tags=['Slots']
    try{
        const { patientId, doctorId, slotId } = req.body;

        if(req.user.role !=="receptionist"){
            return res.status(403).json({
                success:false,
                message:"Unauthorized token.Please enter a valid token"
            })
        }

        const slot = await Slot.findOne({ _id:slotId, doctorId, patientId});
        if(!slot){
            return res.status(404).json({
                success:false,
                message:"Slot not found"
            })
        }

        slot.status == "Cancelled";
        await Slot.findByIdAndDelete(slotId);

        return res.status(400).json({
            message:"Slot cancelled succcessfully"
        })


    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message
        })
    }
}

const completeSlot = async(req,res)=>{
    // #swagger.tags=['Slots']
    try{

        const { slotId,doctorId } = req.params;

        if(req.user.role !== "receptionist"){
            return res.status(403).json({
                success:false,
                message:"Access Denied.Please provide a receptionist token"
            })
        }

        const slot = await Slot.findOne({ _id:slotId, doctorId });
        if(!slot){
            return res.status(404).json({
                success:false,
                message:"There is not slots found for this doctor"
            })
        }

        if(slot.status == "Completed"){
            return res.status(400).json({
                success:false,
                message: "Your Slot is already completed"
            })
        }

        slot.status = "Completed";
        await slot.save();

        return res.status(200).json({
            success:true,
            message:"Slot completed successfully",
            slot
        })


    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message
        })
    }
}

module.exports = { createSlot, getSlotByDoctor, getSlotsByPatient, completeSlot, cancelSlot}