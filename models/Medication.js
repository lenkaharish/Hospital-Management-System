const mongoose = require('mongoose');
const { Schema } = mongoose;

const medicationSchema = new Schema({
    name:{ type:String, required: true},
    mg:{ type: Number, required:true},
    tabletCount:{ type:Number, required: true},
    price:{ type:Number, required: true}
});

module.exports= mongoose.model('Medication', medicationSchema);