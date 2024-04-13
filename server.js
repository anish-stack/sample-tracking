const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser')
dotenv.config()
const ConnectDb= require('./database/db')
const userRoutes = require('./routes/routes')
const port = process.env.PORT

//db connection
ConnectDb()

// middleware
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())
app.use(cookieParser())

// listen app and routes
app.get('/',(req,res)=>{
    res.send('I am From Real Time Sample Tracking')
})
app.use('/api/v1',userRoutes)

// Error handler middleware
app.use((err,req,res,next)=>{
    console.log(err.stack)
    res.status(500).send('Something went wrong!');
    process.exit(1);
})


app.listen(port,()=>{
    console.log(`server is running on Port no ${port}`)
})

