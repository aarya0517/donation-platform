const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shopkeeperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Creating the model
const Order = mongoose.model('Order', orderSchema);

module.exports = { Order };
