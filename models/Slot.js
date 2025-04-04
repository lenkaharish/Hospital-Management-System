const mongoose = require("mongoose");
const { Schema } = mongoose;

const slotSchema = new Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    time: { type: String, required: true }, // Format: HH:MM
    status:{ type:String, enum:["Booked","Cancelled", "Completed"]}
});

const Slot = mongoose.model("Slot", slotSchema);
module.exports = Slot;
