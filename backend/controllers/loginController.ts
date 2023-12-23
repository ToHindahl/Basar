import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

function generateAccessToken(userdata: {username: string}) {
    return jwt.sign(userdata, process.env.JWT_SECRET as string, { expiresIn: '86400s' });
}

const login = (req: Request, res: Response) => {
    const username = req.body.username;
    const password = req.body.password;

    if (password != process.env.APP_PASSWORD){
        console.log(password);
        return res.sendStatus(403);
    }

    const token = generateAccessToken({ username: username });
    res.json({token: token, username: username});
};

const getUser = (req: Request, res: Response) => {
    //@ts-ignore
    res.json({username: req.user.username});
};

export { login, getUser };