import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import authRoutes from './routes/auth.routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(json());

app.use('/auth', authRoutes);

app.use((
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  errorMiddleware(err, req, res, next);
});

export default app;