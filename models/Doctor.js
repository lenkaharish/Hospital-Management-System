const mongoose = require("mongoose");
const { Schema } = mongoose;

const doctorSchema = new Schema({
    fullName: { type: String, required: true },
    specialization: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    experience: { type: Number, required: true },
    role: { type: String, enum: ["doctor"] },
    slots:{ type:Boolean }
}, { timestamps: true }); 

module.exports = mongoose.model("Doctor", doctorSchema);
