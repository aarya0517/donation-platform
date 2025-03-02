const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User collection (since institutes are also users)
        required: true
    },
    items: [
        {
            itemName: { 
                type: String, 
                required: true, 
                enum: ['Rice', 'Wheat', 'Dal', 'Sugar', 'Milk', 'Oil'] 
            },
            quantity: { type: Number, required: true, min: 1 },
            unit: { 
                type: String, 
                required: true, 
                enum: ['kg', 'liters'] 
            }
        }
    ],
    reason: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'partially fulfilled', 'completed'],
        default: 'pending'
    },
    amount :{
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Creating the model
const Request = mongoose.model('Request', requestSchema);

module.exports = { Request };
