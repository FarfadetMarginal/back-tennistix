const express = require('express')
const app = express()
const port = 3004
require('dotenv').config()
//pas oublier d'installer : npm i dotenv

const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')


const { pool, connectDB } = require('./config/db.js');
const startServer = async () =>{
    await connectDB()

    console.log("jusqu'ici tout va bien") 

}
startServer()

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')


app.use(express.json())
app.use(express.urlencoded({extended: true}))

const corsOption = {
    origin: ['http://localhost:3004']
}
app.use(cors(corsOption))

app.use(
    helmet({
        contentSecurityPolicy: false, //pour API JSON uniquement, désactive CSP
        crossOriginResourcePolicy: {policy: "cross-origin"}, 
    })
)

const limiter = rateLimit({
    windowMs : 15*60*1000, //fenetre de 15minutes
    limit : 100, //max 100 requêtes par IP sur ce creneau
    message : {status: 429, error: 'trop de requête'}
})
app.use(limiter)

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', userRoutes)

// l'URL ↓
app.get('/', (req, res) =>{
    res.send("jusqu'ici tout va bien")
}) 



app.listen(port, () =>{
    console.log(`serveur démarré sur http://localhost:${port}`)
})