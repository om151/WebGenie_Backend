import userModel from '../models/userModel.js';
import * as userService from '../Services/userServices.js';
import { validationResult } from 'express-validator';
import blacklistTokenModel from '../models/blackListToken.js';

export async function registerUser(req, res, next) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }

    const { username, email, password } = req.body;

    const isUserAlreadyExist = await userModel.findOne({ email });

    if (isUserAlreadyExist) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({
        username,
        email,
        password: hashPassword,
    });

    const token = user.generateAuthToken();

    res.status(201).json({ token, user });
}

export async function loginUser(req, res, next) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }

    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = user.generateAuthToken();
    res.cookie('token', token);
    res.status(200).json({ token, user });
}

export async function getUserProfile(req, res, next) {
    const user = await userModel.findById(req.user._id);
    res.status(200).json({ user });
}

export async function logoutUser(req, res, next) {
    res.clearCookie('token');
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (token) {
        await blacklistTokenModel.create({ token });
    }

    res.status(200).json({ message: 'Logout successfully' });
}
