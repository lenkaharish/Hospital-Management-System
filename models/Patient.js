const mongoose = require("mongoose");
const { Schema } = mongoose;

const patientSchema = new Schema({
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, unique: true },
    address: { type: String, required: true },
    role: { type: String, enum: ["patient"] },
    problems: [{ type: String, required: true }]
},  { timestamps: true});

module.exports = mongoose.model("Patient", patientSchema);
