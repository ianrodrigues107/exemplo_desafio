import express from 'express';
import { authMiddleware } from './middlewares/auth.middleware';
import dotenv from 'dotenv';
import { UserController } from './controllers/user.controller';

dotenv.config();

const app = express();
const userController = new UserController();

app.use(express.json());

// Rota corretamente tipada
app.put('/api/user/update', 
  authMiddleware, 
  (req, res, next) => {
    userController.updateUser(req, res).catch(next);
  }
);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});