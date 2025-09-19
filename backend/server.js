import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';

//Routes
import tvShowsRoutes from './src/routes/tvShowsRoutes.js';
import actorsRoutes from './src/routes/actorsRoutes.js';
import favoritesRoutes from './src/routes/favoritesRoutes.js';
import jwtAuthRoutes from './src/routes/jwtAuthRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

export default app;

// Middleware
app.use(express.json()); // to parse JSON request bodies
app.use(cors()); // no cors problems
app.use(helmet()); // to protect app by setting various HTTP headers
app.use(morgan('dev')); // to log HTTP requests



app.use('/api/tv-shows', tvShowsRoutes);

app.use('/api/actors', actorsRoutes);

app.use('/api/favorites', favoritesRoutes);

app.use('/auth', jwtAuthRoutes);


// Dashboard route
app.use('/dashboard', dashboardRoutes);




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

