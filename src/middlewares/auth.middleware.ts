import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../orm/prisma";

// Interface para o payload do token JWT
interface JwtPayload {
  id: string;
}

// Extendendo a interface Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        // Adicione outras propriedades do usuário conforme necessário
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      res.status(401).json({ error: "Token ausente" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.id },
      select: {
        id: true,
        // Adicione outros campos que você queira disponíveis em req.user
      }
    });

    if (!user) {
      res.status(401).json({ error: "Usuário não encontrado" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Token expirado" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Token inválido" });
    } else {
      console.error("Erro na autenticação:", error);
      res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
};