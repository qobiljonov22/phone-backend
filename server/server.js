import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRoutes from './routes/users.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', usersRoutes);

app.get('/', (req, res) => {
  res.send('Phone Backend API - Users route available at /api/users');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
})
