import { userModel } from '../../../db/models/userModel.js'
import { generateToken, verifyToken } from '../../utils/tokenFunctions.js'
import { sendEmailService } from '../../services/mailService.js'
import pkg from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import { providers, systemRoles } from '../../utils/systemRoles.js'
import { nanoid } from 'nanoid'

export const register = async (req, res, next) => {

    const {
        username,
        email,
        password,
        role
    } = req.body

    const isEmailDuplicate = await userModel.findOne({ email })
    if (isEmailDuplicate) {
        return next(new Error('email is already exist', { cause: 400 }))
    }


    // Generate Token
    const token = generateToken({
        payload: { email },
        signature: process.env.SIGNUP_CONFIRMATION_EMAIL_TOKEN,
        expiresIn: '6h',
    })

    // generate email

    // Generate Confirmation Link
    const conirmationlink = `${req.protocol}://${req.headers.host}/api/auth/confirmEmail/${token}`
    const isEmailSent = sendEmailService({
        to: email,
        subject: 'Confirmation Email',
        message: `<a href=${conirmationlink}>Click here to confirm </a>`,
    })

    if (!isEmailSent) {
        return next(new Error('fail to sent confirmation email', { cause: 400 }))
    }
    // hash password
    const hashedPassword = pkg.hashSync(password, +process.env.SALT_ROUNDS)

    // Initialize user object
    const user = new userModel({
        username,
        email,
        password: hashedPassword,
        role,
        provider: providers.SYSTEM
    })

    // save Query
    const savedUser = await user.save()
    req.failedDocument = {
        model: userModel,
        _id: user._id
    }


    res.status(201).json({ message: "user is created", userName: savedUser.username, Email: savedUser.email })
}

export const confirmEmail = async (req, res, next) => {

    const { token } = req.params
    const tokenData = verifyToken({
        token,
        signature: process.env.SIGNUP_CONFIRMATION_EMAIL_TOKEN
    })

    const user = await userModel.findOneAndUpdate(
        { email: tokenData?.email, isConfirmed: false },
        { isConfirmed: true },
        { new: true },
    )
    if (!user) {
        return next(new Error('this email is already confirmed', { cause: 400 }))
    }
    res.status(200).json({ messge: 'Confirmed done, please try to login' })
}

export const login = async (req, res, next) => {
    const { username, password, email } = req.body

    const user = await userModel.findOne({
        $or:
            [
                { email, isConfirmed: true },
                { username, isConfirmed: true }
            ]
    })

    if (!user) {
        return next(new Error("It seems like invalid credentials OR you didn't confirm your email", { cause: 400 }))
    }

    const isPasswordMatch = pkg.compareSync(password, user.password)
    if (!isPasswordMatch) {
        return next(new Error('invalid login credentials', { cause: 400 }))
    }

    //  generate Login token
    const token = generateToken({
        payload: {
            _id: user._id,
            email: user.email,
            role: user.role
        },
        signature: process.env.LOGIN_SIGN,
        expiresIn: '5d'
    })

    const logedInUser = await userModel.findOneAndUpdate(
        { $or: [{ email }, { username }] },
        { token },
        { new: true }
    )


    res.status(200).json({
        Message: "User loged in",
        userRole: logedInUser.role,
        userToken: logedInUser.token
    })
}

export const loginWithGmail = async (req, res, next) => {
    const client = new OAuth2Client()
    const { idToken } = req.body
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID,
        })
        const payload = ticket.getPayload()
        return payload
    }
    const { email_verified, email, name } = await verify()
    if (!email_verified) {
        return next(new Error('invalid email', { cause: 400 }))
    }
    const user = await userModel.findOne({ email, provider: providers.GOOGLE })
    //login
    if (user) {
        const token = generateToken({
            payload: {
                email,
                _id: user._id,
                role: user.role,
            },
            signature: process.env.LOGIN_SIGN,
            expiresIn: '5d',
        })

        const userUpdated = await userModel.findOneAndUpdate(
            { email },
            {
                token,
            },
            {
                new: true,
            },
        )
        const { username, role } = userUpdated
        return res.status(200).json({ messge: 'Login done', username, role, token })
    }

    // signUp
    const userObject = {
        username: name,
        email,
        password: pkg.hashSync(nanoid(6), +process.env.SALT_ROUNDS),
        provider: providers.GOOGLE,
        isConfirmed: true,
        role: systemRoles.USER,
    }
    const newUser = await userModel.create(userObject)
    const token = generateToken({
        payload: {
            email: newUser.email,
            _id: newUser._id,
            role: newUser.role,
        },
        signature: process.env.LOGIN_SIGN,
        expiresIn: '5d',
    })
    newUser.token = token
    await newUser.save()
    const { username, role } = newUser
    res.status(200).json({ message: 'Verified', username, role, Token: newUser.token })
}

