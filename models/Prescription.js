const mongoose = require('mongoose');

const { Schema } = mongoose;

const prescriptionSchema = new Schema({
    doctorId:{ type: mongoose.Schema.Types.ObjectId, ref:"Doctor", required: true},
    patientId:{ type: mongoose.Schema.Types.ObjectId, ref:"Patient", required:true},
    medications:[{
        medicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Medication", required: true },
        name:{ type:String, required:true},
        mg:{ type:Number, required:true},
        tabletCount:{ type:Number, required: true},
        price:{ type:Number, required: true},
    }],
    totalPrice:{ type:Number, required: true},
    date:{ type: Date, default: Date.now },


});

module.exports = mongoose.model('Prescription', prescriptionSchema ) 