require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// CONNECT TO LOCAL MONGODB
// Use the Cloud URL if available, otherwise use Local
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopDB";
mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// --- SCHEMAS ---
const productSchema = new mongoose.Schema({
    id: Number, name: String, price: Number, category: String, img: String
});
const cartSchema = new mongoose.Schema({
    userId: String, // Tracks specific guest user
    items: Array    // Stores product objects
});
const wishlistSchema = new mongoose.Schema({
    userId: String,
    items: Array
});

const Product = mongoose.model('Product', productSchema);
const Cart = mongoose.model('Cart', cartSchema);
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// --- ROUTES ---

// 1. Get Products
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// 2. Sync Cart (Add/Remove items)
app.post('/api/cart', async (req, res) => {
    const { userId, items } = req.body;
    // Find cart for this user and update it, or create new if not exists
    await Cart.findOneAndUpdate({ userId }, { items }, { upsert: true });
    res.json({ success: true, message: "Cart Synced to DB" });
});

// 3. Get User's Cart
app.get('/api/cart/:userId', async (req, res) => {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.json(cart ? cart.items : []);
});

// 4. Sync Wishlist
app.post('/api/wishlist', async (req, res) => {
    const { userId, items } = req.body;
    await Wishlist.findOneAndUpdate({ userId }, { items }, { upsert: true });
    res.json({ success: true, message: "Wishlist Synced to DB" });
});

app.listen(5000, () => console.log("Server running on port 5000"));