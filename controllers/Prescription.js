const Prescription = require('../models/Prescription');
const Medication = require('../models/Medication');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Slot = require('../models/Slot');
const { generatePrescriptionPDF } = require('../utils/PdfGenerator');
const path = require('path');

const createPrescription = async (req, res) => {
    // #swagger.tags = ['Prescription']
    try {
        if (req.user.role !== "doctor") {
            return res.status(403).json({ success: false, message: "Access denied. Only doctors can create prescriptions." });
        }

        const { patientId, medications } = req.body;
        const doctorId = req.user.userId;

        if (!patientId || !medications || medications.length === 0) {
            return res.status(400).json({ success: false, message: "PatientID and medications are required." });
        }

        const completeSlot = await Slot.findOne({ doctorId, patientId, status: "Completed" });
        if (!completeSlot) {
            return res.status(400).json({ success: false, message: "Only Completed slots can create a prescription." });
        }

        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }

        const doctor = await Doctor.findById(doctorId);
        if(!doctor){
            return res.status(404).json({
                success:false,
                message:"Doctor not found"
            })
        }

        let totalPrice = 0;
        const prescriptionMedications = [];

        for (const med of medications) {
            const medication = await Medication.findById(med.medicationId);
            if (!medication) {
                return res.status(404).json({
                    success: false,
                    message: `Medication with ID ${med.medicationId} not found`
                });
            }

            const price = medication.price * med.tabletCount;
            totalPrice += price;

            prescriptionMedications.push({
                medicationId: medication._id,
                name: medication.name,
                mg: medication.mg,
                tabletCount: med.tabletCount,
                price
            });
        }

        const newPrescription = new Prescription({
            doctorId,
            patientId,
            medications: prescriptionMedications,
            totalPrice
        });

        await newPrescription.save();

        // Generate PDF
        const fileName = `prescription_${newPrescription._id}.pdf`;
        await generatePrescriptionPDF({
            doctorId,
            doctorName: doctor.fullName,
            patientName: patient.fullName,
            patientAge: patient.age,
            patientGender:patient.gender,
            medications: prescriptionMedications,
            totalPrice
        }, fileName);

        return res.status(200).json({
            success: true,
            message: "Prescription created successfully",
            Prescription: newPrescription,
            pdfDownloadUrl: `/Prescriptions/${fileName}`
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = { createPrescription };
