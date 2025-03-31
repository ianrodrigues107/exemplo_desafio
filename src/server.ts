import express from 'express';
import dotenv from 'dotenv';
import { authenticate } from "./middlewares/auth.middleware"; // Importe como authenticate
import userController from "./controllers/user.controller"; // Já é uma instância

dotenv.config();

const app = express();

app.use(express.json());

// Rota corretamente tipada
app.put('/api/user/update', 
  authenticate, // Use o middleware importado
  (req, res, next) => {
    userController.updateUser(req, res).catch(next);
  }
);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});