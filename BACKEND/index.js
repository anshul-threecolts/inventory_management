const express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const winston = require('winston');
const userController = require('./routers/user-controller.js');
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
require('dotenv').config({ path: envFile });


const bcrypt = require('bcryptjs');
require('dotenv').config();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');



// Configure winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
    ),
    transports: [
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console()
    ]
});

const app = express();
app.use(bodyParser.json());

const wss = new WebSocket.Server({ port: 8088 });

let corsOptions = {
    origin: ['http://localhost:4201', 'http://localhost:4202'],
}
const cors = require('cors');
const { queryObjects } = require('v8');
app.use(cors(corsOptions));


// MySQL Database Connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'inventory_management'
});

// const db = mysql.createConnection({
//     host: 'sphinxtestdb.cv6m20ys2d00.us-east-1.rds.amazonaws.com',
//     port: 3306,
//     user: 'puneteam',
//     password: 'Anhdzj!23h!hdbx!!',
//     database: 'ocpp'
// });

db.connect((err) => {
    if (err) throw err;
    logger.info('Connected to MySQL Database.');
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Handle WebSocket connections
wss.on('connection', (ws) => {
    logger.info('New connection established');

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        logger.info(`MSG Received >> ${JSON.stringify(parsedMessage)}`);

        try {
            logMessage(parsedMessage, 'incoming');
            handleOcppMessage(ws, parsedMessage);
        } catch (e) {
            logger.error(e.toString());
        }
    });

    ws.on('close', () => {
        logger.info('Connection closed');
    });
});

function logMessage(message, direction) {
    db.query(
        'INSERT INTO message_logs (direction, message, timestamp) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [direction, JSON.stringify(message)],
        (err) => {
            if (err) logger.error(err.toString());
        }
    );
}

app.post('/register', (req, res) => {
    const { email, password, first_name, last_name } = req.body;

    const checkQuery = 'SELECT email FROM users WHERE email = ?';
    db.execute(checkQuery, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = bcrypt.hashSync(password, 8);

        const query = 'INSERT INTO users (email, password, status,first_name,last_name) VALUES (?, ?, ?,?,?)';
        db.execute(query, [email, hashedPassword, 'ACTIVE', first_name, last_name], (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error registering user' });
            }
            res.status(201).json({ success: true, message: 'User registered successfully' });
        });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.execute(query, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching user' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = results[0];

        if (user.status !== 'ACTIVE') {
            return res.status(403).json({ success: false, message: 'User account is not active' });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(404).json({ success: false, message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ token });
    });
});


// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Token required' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid token' });

        req.user = user;
        next();
    });
};



app.post('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ success: true, message: 'Access granted to protected route', userId: req.user.userId });
});



app.get('/me', (req, res) => {
    const authHeader = req.headers['authorization'];
    
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: 'Token required' });
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
        
        let query = "SELECT email, created_at,first_name,last_name, isCustomer, customerId, role, permission FROM users WHERE id= ? ";
        db.execute(query, [user.userId], (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database query error' });
            }
            res.status(200).json({
                success: true,
                user: results
            })
        })
    });
});



//User API 
app.post('/add-user', authenticateToken, userController.addUser);
app.get('/users', authenticateToken, userController.getUserList);
app.put('/update-user/:userId', authenticateToken, userController.updateUser);
app.delete('/delete-user/:userId', authenticateToken, userController.deletUser);




app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Inventory Management 1.6 server listening on port ${PORT}`);
});

