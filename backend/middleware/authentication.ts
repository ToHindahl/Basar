//@ts-ignore
import jwt from 'jsonwebtoken';
import express, { Request, Response, NextFunction } from 'express';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    console.log(err)

    if (err) return res.sendStatus(403)

    //@ts-ignore
    req.user = user

    next()
  })
}