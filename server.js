const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')

const app = express()
const http = require('http').createServer(app)

// Express App Config
app.use(cookieParser())
// app.use(express.json())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.static('public'))

if (process.env.NODE_ENV === 'production') {
  // Express serve static files on production environment
  app.use(express.static(path.resolve(__dirname, 'public')))
} else {
  // Configuring CORS
  const corsOptions = {
    // Make sure origin contains the url your frontend is running on
    origin: ['http://127.0.0.1:8080', 'http://localhost:8080', 'http://127.0.0.1:3000', 'http://localhost:3000'],
    credentials: true,
  }
  app.use(cors(corsOptions))
}

const authRoutes = require('./api/auth/auth.routes')
const googleAuthRoutes = require('./api/google-auth/google-auth.routes')
const userRoutes = require('./api/user/user.routes')
const boardRoutes = require('./api/board/board.routes')
const { setupSocketAPI } = require('./services/socket.service')

// routes
const setupAsyncLocalStorage = require('./middlewares/setupAls.middleware')
app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/google-auth', googleAuthRoutes)
app.use('/api/user', userRoutes)
app.use('/api/board', boardRoutes)
setupSocketAPI(http)

// Make every server-side-route to match the index.html
// so when requesting http://localhost:3030/index.html/board/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue-router to take it from there
const port = process.env.PORT || 3030
app.get('/**', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const logger = require('./services/logger.service')
http.listen(port, () => {
  logger.info('Server is running on port: ' + port)
})
