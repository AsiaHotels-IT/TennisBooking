const express = require('express');
const { readdirSync } = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

const app = express();

// เชื่อมต่อฐานข้อมูล
connectDB();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// เสิร์ฟไฟล์ frontend build
app.use(express.static(path.join(__dirname, 'build')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// โหลด routes ทั้งหมดจากโฟลเดอร์ Routes
readdirSync('./Routes').map((r) => app.use('/api', require('./Routes/' + r)));

// Start server ใช้แค่ app.listen
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server is running on port ${PORT}`));
