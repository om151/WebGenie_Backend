import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import blacklistTokenModel from '../models/blackListToken.js';

export async function authUser(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const isBlacklisted = await blacklistTokenModel.findOne({ token });

    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);

        const user = await userModel.findById(decoded._id);
        console.log(user);

        req.user = user;
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}
