const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // The institute is stored in the User collection
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // The donor's user ID
        required: true
    },
    amount: {
        type: Number, // Add this field if needed
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Donation = mongoose.model('Donation', donationSchema);
module.exports = { Donation };
