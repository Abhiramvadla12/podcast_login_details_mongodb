// const express = require("express");
// const mongoose = require("mongoose");
// const {dbConnect} = require("./db.js");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// const port = process.env.PORT || 3001;

// app.use(express.json());
// app.use(cors())
// dbConnect();

// mongoose.connection.once("open", () => {
//     console.log(`✅ Connected to database: ${mongoose.connection.name}`);
// });


// const detailsSchema = new mongoose.Schema({
//     username : String,
//     password : String,
//     email : String
// });

// const detailsModel = mongoose.model("login_details",detailsSchema);

// //get login details

// app.get("/login",async(req,res)=>{
//         try{
//             let data = await detailsModel.find();
//             console.log(data);
//             res.send(data);
//         }
//         catch(err){
//             console.error("❌ Error fetching data:", err);
//             res.status(500).send({ error: "Internal Server Error" });
//         }
// });


// app.post("/register",async(req,res)=>{
//     try{
//         const data = req.body;
//         console.log(data);
//         let post = await detailsModel.create(data);
//         res.send({
//             message: "✅ Data inserted successfully into login_details",
//             user: post
//         });
//     }
//     catch (error) {
//         console.error("❌ Error inserting data into marustunna:", error);
//         res.status(500).send({ error: "Internal Server Error" });
//     }
// })
// app.listen(port,()=>{
//     console.log(`🚀 Server running at http://localhost:${port}`);
// })

const express = require("express");
const mongoose = require("mongoose");
const { dbConnect } = require("./db.js");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
dbConnect();

mongoose.connection.once("open", () => {
    console.log(`✅ Connected to database: ${mongoose.connection.name}`);
});

// Schema and Model
const detailsSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: { type: String, unique: true }
});

const detailsModel = mongoose.model("login_details", detailsSchema);

// Registration (Hashing password before saving)
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await detailsModel.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ error: "Email already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await detailsModel.create({
            username,
            email,
            password: hashedPassword
        });

        res.send({
            message: "✅ User registered successfully",
            user: { id: newUser._id, username: newUser.username, email: newUser.email }
        });
    } catch (error) {
        console.error("❌ Error registering user:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

// Login (Verifying user credentials)
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by email
        const user = await detailsModel.findOne({ username });
        if (!user) {
            return res.status(400).send({ error: "Invalid email or password" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ error: "Invalid email or password" });
        }

        res.send({
            message: "✅ Login successful",
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (error) {
        console.error("❌ Error during login:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
