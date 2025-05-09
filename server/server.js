require('dotenv').config({path:'./config/.env'});

const express =require('express');
const cors =require('cors');
const connectDB=require('./config/db.js')


const authRoutes = require('./routes/routes');  

const app =express();

const PORT =process.env.PORT || 5000;


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));


app.use(express.json());

connectDB();

app.use('/auth', authRoutes); 

app.listen(PORT, () => {

  console.log(`Server is running at http://localhost:${PORT}`)
});