import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/apiError';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

export class AuthService {
  async register(name: string, email: string, cpf: string, password: string) {
    const userExists = await prisma.user.findFirst({
      where: { OR: [{ cpf }, { email }] }
    });
  
    if (userExists) {
      if (userExists.cpf === cpf) throw new ApiError(409, 'CPF já cadastrado');
      if (userExists.email === email) throw new ApiError(409, 'Email já cadastrado');
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return prisma.user.create({
      data: { name, email, cpf, password: hashedPassword }
    });
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: { 
        id: true,
        name: true,
        email: true,
        password: true
      }
    });
  
    if (!user) throw new ApiError(404, 'Usuário não encontrado');
  
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new ApiError(401, 'Credenciais inválidas');
  
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );
  
    return { 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  }
}