const express = require('express');
const router = express.Router();
const  authMiddleware  = require('../middleware/authMiddleware');
const { registerPatient,  getPatientProfile, updatePatientProfile, searchPatients, deletePatientProfile } = require('../controllers/Patient');
const {  registerDoctor,  getDoctorProfile, updateDoctorProfile, searchDoctors, deleteDoctorProfile } = require('../controllers/Doctor');
const {  login, registerReceptionist,  getReceptionistProfile, updateReceptionistProfile, deleteReceptionistProfile } = require('../controllers/Receptionist');
const { createSlot, getSlotByDoctor, getSlotsByPatient, completeSlot, cancelSlot } = require('../controllers/Slot');
const { createMedication, updateMedication, deleteMedication, getMedications } = require('../controllers/Medication');
const { createPrescription } = require('../controllers/Prescription');
 


// doctor
router.post('/api/Doctor-register',registerDoctor);
router.get('/api/Doctor',authMiddleware, getDoctorProfile);
router.put('/api/Doctor-update', authMiddleware, updateDoctorProfile);
router.post('/api/Doctor-search',  authMiddleware, searchDoctors);
router.delete('/api/Doctor-delete', authMiddleware, deleteDoctorProfile);


//patient
router.post('/api/Patient-register',registerPatient);
router.get('/api/Patient', authMiddleware, getPatientProfile);
router.put('/api/Patient-update', authMiddleware, updatePatientProfile);
router.delete('/api/Patient-delete', authMiddleware, deletePatientProfile);
router.post('/api/Patient-search', authMiddleware, searchPatients);


//receptionist
router.post('/api/Receptionist-register',registerReceptionist);
router.get('/api/Receptionist', authMiddleware, getReceptionistProfile);
router.put('/api/Receptionist-update', authMiddleware, updateReceptionistProfile);
router.delete('/api/Receptionist-delete', authMiddleware, deleteReceptionistProfile);

//login
router.post('/api/login',login);

//slot 
router.post('/api/Slot-create', authMiddleware, createSlot);
router.post('/api/Slots-Doctor/:doctorId', authMiddleware, getSlotByDoctor);
router.post('/api/Slots-Patient/:patientId', authMiddleware, getSlotsByPatient);
router.delete('/api/Slot-Cancel', authMiddleware, cancelSlot);
router.post('/api/Slot-Complete/:slotId/:doctorId', authMiddleware, completeSlot);


// Medication
router.post('/api/Medication-create', authMiddleware,createMedication);
router.put('/api/Medication-update',authMiddleware,updateMedication);
router.delete('/api/Medication-delete/:medicationId', authMiddleware, deleteMedication);
router.get('/api/Medication-getall', authMiddleware, getMedications);

//Prescription
router.post('/api/Prescription-create', authMiddleware, createPrescription);

module.exports = router;