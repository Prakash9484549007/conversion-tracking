const mongoose = require('mongoose');

// NEW CLOUD CONNECTION STRING
// const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopDB";
const mongoURI = "mongodb+srv://lalchandanip595_db_user:exEwIO9gNb2EhgLm@conversiontrackingclust.ywngtsn.mongodb.net/shopDB?appName=conversiontrackingcluster";

mongoose.connect(mongoURI).then(() => console.log("Connected"));

const productSchema = new mongoose.Schema({
    id: Number, name: String, price: Number, category: String, img: String
});
const Product = mongoose.model('Product', productSchema);

const products = [
    { id: 101, name: "SEO Audit Pro", price: 4999, category: "Service", img: "https://placehold.co/300x200?text=SEO+Audit" },
            { id: 102, name: "Google Ads Setup", price: 2500, category: "Service", img: "https://placehold.co/300x200?text=Google+Ads" },
            { id: 103, name: "React Course", price: 999, category: "Education", img: "https://placehold.co/300x200?text=React+Course" },
            { id: 104, name: "Consulting Hour", price: 1500, category: "Service", img: "https://placehold.co/300x200?text=Consulting" },
            { id: 105, name: "Email Template", price: 499, category: "Digital", img: "https://placehold.co/300x200?text=Email+Pack" },
            { id: 106, name: "Logo Design", price: 3000, category: "Design", img: "https://placehold.co/300x200?text=Logo+Design" },
            { id: 107, name: "Python Script", price: 750, category: "Code", img: "https://placehold.co/300x200?text=Python+Bot" },
            { id: 108, name: "Landing Page", price: 5000, category: "Development", img: "https://placehold.co/300x200?text=Landing+Page" },
            { id: 109, name: "Analytics Report", price: 1200, category: "Service", img: "https://placehold.co/300x200?text=Analytics" },
            { id: 110, name: "E-book: Marketing", price: 299, category: "Education", img: "https://placehold.co/300x200?text=E-Book" },
            { id: 111, name: "Video Edit", price: 2000, category: "Service", img: "https://placehold.co/300x200?text=Video+Edit" },
            { id: 112, name: "Hosting Setup", price: 10, category: "Tech", img: "https://placehold.co/300x200?text=Server+Setup" }
];

const seedDB = async () => {
    await Product.deleteMany({}); // Clears old data
    await Product.insertMany(products); // Inserts new data
    console.log("Database Seeded!");
    mongoose.connection.close();
};

seedDB();