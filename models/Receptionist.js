const mongoose = require("mongoose");
const { Schema } = mongoose;

const receptionistSchema = new Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["receptionist"] }
},    { timestamps: true });

module.exports = mongoose.model("Receptionist", receptionistSchema);
