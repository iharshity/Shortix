require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');
const port = process.env.PORT || 5000;


async function StartServer(){
    try{
        await connectDB();
    }catch(err){
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    }

    try{
        await connectRedis();
    }catch(err){
        console.warn('Redis is unavailable, continuing without cache:', err.message);
    }

    app.listen(port, () =>{
        console.log(`Server is running at http://localhost:${port}`);
    })
}


StartServer();
