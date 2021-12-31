const express = require('express')
const cors = require('cors');
const app = express()
require("dotenv").config()
const mongoose = require('./server/config/mongoose')
const userRouter = require('./server/routes/user')
const propertyRouter = require('./server/routes/property')

app.use(express.json())
const corsOptions = {
    origin: '*',
}
app.use(cors(corsOptions))
app.use(propertyRouter)
app.use(userRouter)

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`app is listining on post ${port}`)
})

app.get('/', (req, res)=> {
  res.send('server is working')
})
