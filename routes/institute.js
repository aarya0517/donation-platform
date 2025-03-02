const express = require("express");
const {userAuth} = require("../middlewares/auth");
const instituteRouter = express.Router();
const { Request } = require("../models/Request");
const { User } = require("../models/User");


instituteRouter.get("/request",userAuth,  (req, res) => {
    const user = req.user;
    
    const {fullname,email} = user;
    res.render("instituteRequest.ejs",{fullname,email});

})
instituteRouter.get("/dashboard", userAuth, async (req, res) => {
    try {
        const user = req.user; // Authenticated institute user

        // Fetch all requests belonging to the logged-in institute
        const requests = await Request.find({ instituteId: user._id });

        res.render("instituteDashboard.ejs", { requests });
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).send("Server Error");
    }
});

instituteRouter.get("/approved", userAuth, async (req, res) => {
    try {
        const user = req.user; // Get the logged-in institute
        const approvedRequests = await Request.find({ 
            instituteId: user._id, 
            status: "completed" 
        });

        res.render("instituteApproved.ejs", { requests: approvedRequests });
    } catch (error) {
        console.error("Error fetching approved requests:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
});

instituteRouter.post("/request", userAuth, async (req, res) => {
    try {
        const user = req.user; // Extract logged-in user's details
        const { item_name, quantity, unit, reason } = req.body;

        // Validate required fields
        if (!item_name || !quantity || !unit || !reason) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Ensure item_name and unit are valid
        const allowedItems = ["Rice", "Wheat", "Dal", "Sugar", "Milk", "Oil"];
        const allowedUnits = ["kg", "liters"];

        if (!allowedItems.includes(item_name)) {
            return res.status(400).json({ message: "Invalid item selected" });
        }
        if (!allowedUnits.includes(unit)) {
            return res.status(400).json({ message: "Invalid unit selected" });
        }

        // Define prices per unit for each item (in rupees)
        const prices = {
            Rice: 50,
            Wheat: 40,
            Dal: 80,
            Sugar: 60,
            Milk: 70,
            Oil: 100
        };

        // Calculate total amount (convert quantity to Number)
        const qty = Number(quantity);
        const calculatedAmount = qty * prices[item_name];

        // Create a new request in the database (ensure your Request schema supports the 'amount' field)
        const newRequest = new Request({
            instituteId: user._id, // The requesting institute's ID
            items: [{ itemName: item_name, quantity: qty, unit }],
            amount: calculatedAmount, // Added calculated amount
            status: "pending",
            reason: reason
        });

        await newRequest.save();
        res.redirect("/institute/dashboard");
    } catch (error) {
        console.error("Error submitting request:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
});



module.exports = { instituteRouter };