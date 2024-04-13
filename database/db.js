const mongoose = require('mongoose');

const ConnectDb = async () => {
    try {
        console.log("i am hit")
        await mongoose.connect(process.env.MONGOURL);

        console.log("MongoDB is connected successfully");

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};


module.exports = ConnectDb