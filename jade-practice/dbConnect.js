const mongoose = require('mongoose');
const config = require('./config/default.json');

async function dbConnect() {
    try {
        const mongoURI = config.MONGO_URI;
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex : true});
        console.log("Database connected successfully");
    }
    catch(err) {
        console.log("Database not connected successfully");
        console.error("Error: " + err);
    }
}

dbConnect();