import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiError } from '../utils/apiError';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  async register(req: Request, res: Response) {
    try {
      const { name, email, cpf, password } = req.body;
      
      if (!name || !email || !cpf || !password) {
        throw new ApiError(400, 'Todos os campos são obrigatórios');
      }

      const user = await this.authService.register(name, email, cpf, password);
      
      res.status(201).json({
        status: 'success',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: user.cpf 
        }
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        throw new ApiError(400, 'Email e senha são obrigatórios');
      }

      const { token, user } = await this.authService.login(email, password);
      
      res.json({
        status: 'success',
        data: {
          token,
          user: { 
            id: user.id,
            name: user.name,
            email: user.email
          }
        }
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private handleError(res: Response, error: unknown) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
        code: error.statusCode 
      });
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro não tratado:', error);
    
    res.status(500).json({
      status: 'error',
      message: errorMessage,
      code: 500
    });
  }
}