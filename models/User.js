const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    role: {
        type: String,
        required: true,
        enum: ['donor', 'institute', 'shopkeeper']
    },
    totalDonations: {
        type: Number,
        default: 0 // Count of total donations made (for donors)
    },
    totalAmountDonated: {
        type: Number,
        default: 0 // Total amount donated (for donors)
    },
    totalOrders: {
        type: Number,
        default: 0 // Count of total orders handled (for shopkeepers)
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate JWT Token
userSchema.methods.getJwt = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id }, "rishex", {
        expiresIn: '1d', // 1 day expiration
    });
    return token;
};

// Validate Password
userSchema.methods.validatePassword = async function (inputPassword) {
    const user = this;
    const passwordHash = user.password;
    return await bcrypt.compare(inputPassword, passwordHash);
};

// Update donor's total donation count and amount
userSchema.methods.updateDonationStats = async function (amount) {
    if (this.role === 'donor') {
        this.totalDonations += 1;
        this.totalAmountDonated += amount;
        await this.save();
    }
};

// Creating the model
const User = mongoose.model('User', userSchema);

module.exports = { User };
