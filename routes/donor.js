const express = require("express");
const {userAuth} = require("../middlewares/auth");
const { User } = require('../models/User');
const { Donation } = require('../models/Donation'); // Assuming you have a Donation model
const { Request } = require('../models/Request'); // Assuming you have a Request model
const { Order } = require('../models/Order'); // Assuming you have an Order model
const donorRouter = express.Router();

donorRouter.get("/dashboard", userAuth, async (req, res) => {
    try {
        const user = req.user;

        // Fetch recent donations made by the donor
        const donations = await Donation.find({ donor: user._id })
            .sort({ date: -1 }) // Sort by latest first
            .limit(5); // Show last 5 donations

        res.render("donorDashboard", { user, donations });
    } catch (error) {
        console.error("Error loading donor dashboard:", error);
        res.status(500).send("Server Error");
    }
});

donorRouter.get("/donate", userAuth, async (req, res) => {
    try {
        const user = req.user;

        // Fetch only pending or partially fulfilled requests (excluding completed)
        const requests = await Request.find({ status: { $ne: "completed" } })
            .populate("instituteId", "fullname");

        // Fetch all donation records where the donor has donated to a specific request
        const donationRecords = await Donation.find({ userId: user._id, requestId: { $exists: true } });

        // Convert requestId to string to ensure correct comparison
        const donatedRequestIds = donationRecords.map(record => record.requestId.toString());

        // Debugging Logs

        res.render("donorDonate", { user, requests, donatedRequestIds });
    } catch (error) {
        console.error("Error loading donor donation page:", error);
        res.status(500).send("Server Error");
    }
});

donorRouter.get("/history", userAuth, async (req, res) => { 
    res.render("donorHistory");
})


donorRouter.post("/donate/request/:id", userAuth, async (req, res) => {
    try {
        const requestId = req.params.id;
        const donationRequest = await Request.findById(requestId);
        if (!donationRequest) {
            return res.status(404).json({ message: "Donation request not found" });
        }

        if (!donationRequest.items || donationRequest.items.length === 0) {
            return res.status(400).json({ message: "No items found in donation request" });
        }

        const instituteId = donationRequest.instituteId;
        const donorId = req.user._id;
        const amount = donationRequest.amount;

        const newDonation = new Donation({
            instituteId,
            userId: donorId,
            amount
        });
        
        const shopkeepers = await User.find({ role: "shopkeeper" });
        if (shopkeepers.length === 0) {
            return res.status(400).json({ message: "No shopkeepers available" });
        }

        const randomShopkeeper = shopkeepers[Math.floor(Math.random() * shopkeepers.length)];
        console.log("Random Shopkeeper:", randomShopkeeper);
        console.log("Donation Request:", donationRequest.items);


        const newOrder = new Order({
            donorId,
            shopkeeperId: randomShopkeeper._id,
            instituteId,
            items: donationRequest.items.map(item => ({
                itemName: item.itemName,
                quantity: item.quantity,
                unit: item.unit
            })),
            totalAmount: amount,
            status: "pending"
        });

        await newOrder.save();






        await newDonation.save();

        const donor = req.user;
        donor.totalDonations = (donor.totalDonations || 0) + 1;
        donor.totalAmountDonated = (donor.totalAmountDonated || 0) + donationRequest.amount;
        await donor.save();
        donationRequest.status = "completed";
        await donationRequest.save();

        res.redirect("/donor/dashboard");
    } catch (error) {
        console.error("Error processing donation:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
});




module.exports = {donorRouter};