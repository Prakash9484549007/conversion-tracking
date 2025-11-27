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

// --- NEW: GOOGLE LOGIN ROUTE ---
app.post('/api/auth/google', async (req, res) => {
    const { userData } = req.body; // Data sent from Frontend
    const { sub, email, name, picture } = userData;

    try {
        // Check if user already exists
        let user = await User.findOne({ googleId: sub });

        if (!user) {
            // IF NOT FOUND -> CREATE NEW USER
            user = new User({
                googleId: sub,
                email,
                name,
                picture
            });
            await user.save();
            console.log("New User Created:", name);
        } else {
            console.log("User Logged In:", name);
        }

        res.json({ success: true, user });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- DELETE ACCOUNT ROUTE ---
app.delete('/api/auth/delete/:googleId', async (req, res) => {
    const googleId = req.params.googleId;

    try {
        // 1. Delete User Profile
        const deletedUser = await User.findOneAndDelete({ googleId: googleId });
        
        // 2. Delete their Cart
        await Cart.findOneAndDelete({ userId: googleId });
        
        // 3. Delete their Wishlist
        await Wishlist.findOneAndDelete({ userId: googleId });

        if (deletedUser) {
            res.json({ success: true, message: "User deleted" });
            console.log("Deleted user:", googleId);
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// START SERVER
app.listen(5000, () => console.log("Server running on port 5000"));