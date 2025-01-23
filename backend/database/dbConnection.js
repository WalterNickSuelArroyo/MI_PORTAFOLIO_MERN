import mongoose from "mongoose";

const dbCnnection = () => {
    mongoose.connect(process.env.MONGO_URI, {
        dbName: "PORTFOLIO"
    }).then(() => {
        console.log("Connected to the database");
    }).catch((err) => {
        console.log(`Some Error Ocurred While Connecting To DataBase: ${err}`);
    });
};

export default dbCnnection;