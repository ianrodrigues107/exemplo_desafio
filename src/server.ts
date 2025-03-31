import express from 'express';
import dotenv from 'dotenv';
import { authenticate } from "./middlewares/auth.middleware";
import userController from "./controllers/user.controller";

dotenv.config();

const app = express();

app.use(express.json());

app.put('/api/user/update', 
  authenticate,
  (req, res, next) => {
    userController.updateUser(req, res).catch(next);
  }
);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});