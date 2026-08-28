const express = require('express')
const app = express()
const port = 3004
require('dotenv').config()
//pas oublier d'installer : npm i dotenv

const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')





const puppeteer = require('puppeteer')

let browser;
let sofascorePage;

const initBrowser = async () => {
  browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.NODE_ENV === 'production' 
      ? '/opt/render/project/src/.chrome/chrome/linux-152.0.7977.54/chrome-linux64/chrome'
      : undefined, // Puppeteer utilise son Chrome embarqué en local
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Crée une page dédiée à Sofascore et la garde ouverte
  sofascorePage = await browser.newPage();
  await sofascorePage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await sofascorePage.goto('https://www.sofascore.com/tennis', { 
    waitUntil: 'domcontentloaded',
    timeout: 60000 
  });
  console.log('Browser et page Sofascore initialisés ✓');
};





const { pool, connectDB } = require('./config/db.js');
const startServer = async () =>{
    await connectDB()
    await initBrowser();
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


// Route live — réutilise la page existante
app.get('/api/v1/tennis/live', async (req, res) => {
  try {
    const response = await sofascorePage.evaluate(async () => {
      const res = await fetch('https://api.sofascore.com/api/v1/sport/tennis/events/live', {
        headers: { 'Accept': 'application/json' }
      });
      return await res.text();
    });

    const data = JSON.parse(response);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(port, () =>{
    console.log(`serveur démarré sur http://localhost:${port}`)
})