const express = require('express')

const shopkeeperRouter = express.Router()


const { Order } = require('../models/Order');
const { userAuth } = require('../middlewares/auth'); // Ensure user authentication middleware

// Get available orders for the current shopkeeper
shopkeeperRouter.get('/dashboard', userAuth, async (req, res) => {
    try {
        const shopkeeperId = req.user._id;

        const orders = await Order.find({
            shopkeeperId: req.user._id,
            status: 'pending'
        })
        .populate({ path: 'donorId', select: 'fullname' })  
        .populate({ path: 'instituteId', select: 'fullname' })
        .lean(); // Convert Mongoose objects to plain JSON
        
        

        console.log(orders); // Debugging: Check if orders contain donor and institute details

        res.render('shopkeeperDashboard', { pendingOrders: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

shopkeeperRouter.post('/approved/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: 'accepted' }, { new: true });
        if (!order) {
            return res.status(404).send("Order not found");
        }
        res.redirect('/shopkeeper/approved'); // Redirect to the approved orders page
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Get Approved Orders Page
shopkeeperRouter.get('/approved', async (req, res) => {
    try {
        const approvedOrders = await Order.find({ status: 'accepted' })
            .populate('donorId', 'fullname') 
            .populate('instituteId', 'fullname');

        res.render('shopkeeperApproved', { approvedOrders });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

shopkeeperRouter.post('/reject/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).send("Order not found");
        }

        // Get the current shopkeeper's ID who is rejecting the order
        const currentShopkeeperId = order.shopkeeperId;

        // Find another shopkeeper who is NOT the current one
        const newShopkeeper = await User.findOne({
            role: 'shopkeeper',  // Assuming shopkeepers have a 'role' field
            _id: { $ne: currentShopkeeperId }  // Exclude the rejecting shopkeeper
        });

        if (!newShopkeeper) {
            return res.status(400).send("No available shopkeeper to reassign the order");
        }

        // Update the order with the new shopkeeper
        order.shopkeeperId = newShopkeeper._id;
        order.status = 'pending'; // Mark as pending again
        await order.save();

        res.redirect('/shopkeeper/pending'); // Redirect to pending orders page
    } catch (err) {
        console.error("Error rejecting order:", err);
        res.status(500).send("Server Error");
    }
});


module.exports = {shopkeeperRouter}