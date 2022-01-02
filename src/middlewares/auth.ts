import { Auth } from "@src/services/auth";
import { NextFunction, Request, Response } from "express";

export function authMiddleware(req: Partial<Request>, res: Partial<Response>, next: NextFunction): void {
  const token = req.headers?.["x-access-token"];
  try {
    const decoded = Auth.decodeToken(token as string);

  req.decoded = decoded;

  next();
  }catch(err: any) {
    res.status?.(401).send({ code: 401, error: err.message})
  }
}

