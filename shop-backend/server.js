require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// CONNECT TO MONGODB
// const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopDB";
const mongoURI = "mongodb+srv://lalchandanip595_db_user:exEwIO9gNb2EhgLm@conversiontrackingclust.ywngtsn.mongodb.net/shopDB?appName=conversiontrackingcluster";
mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// ==========================================
// 1. DATABASE SCHEMAS
// ==========================================

// Product Schema
const productSchema = new mongoose.Schema({
    id: Number, name: String, price: Number, category: String, img: String
});

// Cart & Wishlist Schemas
const cartSchema = new mongoose.Schema({ userId: String, items: Array });
const wishlistSchema = new mongoose.Schema({ userId: String, items: Array });

// --- NEW: USER SCHEMA (For Google Login) ---
const userSchema = new mongoose.Schema({
    googleId: String,
    email: String,
    name: String,
    picture: String,
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const Cart = mongoose.model('Cart', cartSchema);
const Wishlist = mongoose.model('Wishlist', wishlistSchema);
const User = mongoose.model('User', userSchema); // <--- Create the Model

// ==========================================
// 2. API ROUTES
// ==========================================

// Get Products
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// Sync Cart
app.post('/api/cart', async (req, res) => {
    const { userId, items } = req.body;
    await Cart.findOneAndUpdate({ userId }, { items }, { upsert: true });
    res.json({ success: true });
});

// Get Cart
app.get('/api/cart/:userId', async (req, res) => {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.json(cart ? cart.items : []);
});

// Sync Wishlist
app.post('/api/wishlist', async (req, res) => {
    const { userId, items } = req.body;
    await Wishlist.findOneAndUpdate({ userId }, { items }, { upsert: true });
    res.json({ success: true });
});

// Get Wishlist
app.get('/api/wishlist/:userId', async (req, res) => {
    const list = await Wishlist.findOne({ userId: req.params.userId });
    res.json(list ? list.items : []);
});

// GOOGLE LOGIN & MERGE ROUTE
app.post('/api/auth/google', async (req, res) => {
    const { userData, guestId } = req.body; // <--- Receive guestId from frontend
    const { sub, email, name, picture } = userData;

    try {
        // 1. Create or Find User
        let user = await User.findOne({ googleId: sub });
        if (!user) {
            user = new User({ googleId: sub, email, name, picture });
            await user.save();
            console.log("New User Created:", name);
        }

        // 2. THE MERGE LOGIC: Transfer Guest Data to Google ID
        if (guestId) {
            console.log(`Transferring data from Guest (${guestId}) to User (${sub})...`);
            
            // Transfer Cart
            const guestCart = await Cart.findOne({ userId: guestId });
            if (guestCart) {
                // If user already has a cart, we might overwrite or merge. 
                // For simplicity, we overwrite with the fresh guest session or update the ID.
                await Cart.findOneAndUpdate(
                    { userId: guestId }, 
                    { userId: sub }, 
                    { new: true }
                );
            }

            // Transfer Wishlist
            const guestWishlist = await Wishlist.findOne({ userId: guestId });
            if (guestWishlist) {
                await Wishlist.findOneAndUpdate(
                    { userId: guestId }, 
                    { userId: sub }, 
                    { new: true }
                );
            }
        }

        res.json({ success: true, user });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE ACCOUNT ROUTE
app.delete('/api/auth/delete/:googleId', async (req, res) => {
    const googleId = req.params.googleId;

    try {
        // 1. Delete User Profile
        await User.findOneAndDelete({ googleId: googleId });
        
        // 2. Delete Cart
        await Cart.findOneAndDelete({ userId: googleId });
        
        // 3. Delete Wishlist
        await Wishlist.findOneAndDelete({ userId: googleId });

        res.json({ success: true, message: "All user data permanently deleted." });
        console.log("Deleted all data for:", googleId);

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const axios = require('axios');

// --- GETRESPONSE CONFIGURATION ---
const GR_API_KEY = "eydxdrs9p3bd317190y1nbjs0g7sdsl6"; 
const GR_CAMPAIGN_ID = "fVYmT"; 

// ROUTE: Handle VIP Form Submission
app.post('/api/marketing/subscribe', async (req, res) => {
    const { name, email, phone, gender, interest, budget, city } = req.body;

    try {
        // 1. Prepare Data for GetResponse
        const grData = {
            name: name,
            email: email,
            campaign: {
                campaignId: GR_CAMPAIGN_ID // <--- Uses the constant variable now
            },
            customFieldValues: [
                { customFieldId: "nKG8Qu", value: [phone] },
                { customFieldId: "nKG8Jk", value: [city] },
                { customFieldId: "nKGKET", value: [budget] },
                { customFieldId: "nKG8xT", value: [gender] },
                { customFieldId: "nKG8S2", value: [interest] }
            ]
        };

        // 2. Send to GetResponse API
        await axios.post('https://api.getresponse.com/v3/contacts', grData, {
            headers: {
                // FIXED LINE BELOW:
                'X-Auth-Token': `api-key ${GR_API_KEY}`, 
                'Content-Type': 'application/json'
            }
        });

        res.json({ success: true, message: "Added to GetResponse!" });

    } catch (error) {
        console.error("GetResponse Error:", error.response?.data || error.message);
        res.status(500).json({ success: false, error: "Failed to subscribe." });
    }
});

// START SERVER
app.listen(5000, () => console.log("Server running on port 5000"));