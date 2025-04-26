const express = require('express');
const mongoose = require('mongoose');
const pollroutes = require('./routes/poll');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/polls', pollroutes);

app.get('/', (req, res) => {
res.send('Backend server is Live!');    
})
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log('MongoDB Connected'))
.catch((err) => console.error('MongoDB Connection Error', err));

app.listen(PORT, () => console.log(`Server is running on port: http://localhost:${PORT}`));
