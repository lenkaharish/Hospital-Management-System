const Medication = require('../models/Medication');
const Receptionist = require('../models/Receptionist');


const createMedication = async(req,res)=>{
    // #swagger.tags=['Medication']
    try{

        const { name, mg, tabletCount, price } = req.body;

        if(req.user.role !=="receptionist"){
            return res.status(403).json({
                message:"Access Denied.Only receptionists can create medications"
            })
        }

        const newMedication = new Medication({ name, mg, tabletCount, price});
        await newMedication.save();

        return res.status(200).json({
            success:true,
            message:"Medication created successfully",
            medication: newMedication
        });

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message
        })
    }
}


const updateMedication = async(req,res)=>{
    // #swagger.tags= ['Medication']
    try{    
        const { medicationId, mg, tabletCount, price } = req.body;

        if(req.user.role !=="receptionist"){
            return res.status(403).json({
                success:false,
                message:"Access Denied.Only receptionists can update medications"
            })
        }
        
        const medication = await Medication.findById(medicationId);
        if(!medication){
            return res.status(404).json({
                success:false,
                message:"Medication not found"
            })
        }

        if(mg) medication.mg = mg;
        if(tabletCount) medication.tabletCount = tabletCount;
        if(price) medication.price = price;

        await medication.save();

        return res.status(200).json({
            success:true,
            message:"Medication updated successfuly",
            medication
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message
        })
    }
}

const deleteMedication = async(req,res)=>{
    // #swagger.tags=['Medication']
    try{

        const  { medicationId }  = req.params;

        if(req.user.role !=="receptionist"){
            return res.status(403).json({
                success:false,
                message:"Access Denied.Only receptionist can delete the medications."
            })
        }

        const medication = await Medication.findById(medicationId);
        if(!medication){
            return res.status(404).json({
                success:false,
                message:"Medication not found"
            })
        }

        await Medication.findByIdAndDelete(medicationId);

        return res.status(200).json({
            success:true,
            message:"Medication deleted successfully",
            medication
        })

    }catch(error){
        res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message
        })
    }
}

const getMedications = async(req,res)=>{
    // #swagger.tags=['Medication']
    try{

        if(req.user.role !=="receptionist"){
            return res.status(403).json({
                success:false,
                message:"Access Denied.Please provide a receptionist token"
            })
        }

        const medications = await Medication.find();
        if(!medications){
            return res.status(404).json({
                success:false,
                message:"Medications not found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Medications fetched successfully",
            medications
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message
        })
    }
}


module.exports = { createMedication, updateMedication, deleteMedication, getMedications }