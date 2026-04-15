// Load dotenv first thing
require('dotenv').config({ path: process.cwd() + '/src/server/.env' })

import express, {Request, Response, Router, Express} from 'express'
import bodyParser from 'body-parser'
import http, { Server } from "http"
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import router from './route'
import initializeSocketIO from "./socket"

// call express
const app: Express = express() // define our app using express

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false  // Disable CSP initially (Three.js needs inline scripts)
}))

app.use(cors({
  origin: process.env.CLIENT_BASE_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', apiLimiter)

// configure app to use bodyParser for
// Getting data from body of requests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const port: number            = Number(process.env.PORT) || 8050 // set our port

// Connect Server with express app
const server: Server          = new http.Server(app)

// Setup websocket
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.CLIENT_BASE_URL,
  }
})

// Setup socket
initializeSocketIO(io)

// Send index.html on root request
app.use(express.static('dist'))
app.get('/', (req:Request, res:Response) => {
    console.log('sending index.html')
    res.sendFile('/dist/index.html')
})

// REGISTER ROUTES
// all of the routes will be prefixed with /api
const routes: Router[] = Object.values(router)
app.use('/api', routes)

app.get('*', function(req, res) {
  console.log('UNKOWN ROUTE: req.path = ', req.path)
})

// START THE SERVER
// =============================================================================
server.listen(port)
console.log(`App listening on ${port}`)
