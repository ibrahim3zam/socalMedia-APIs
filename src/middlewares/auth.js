import { verifyToken, generateToken } from "../utils/tokenFunctions.js"
import { userModel } from '../../db/models/userModel.js'
import { getIO } from "../utils/socketIo.js"

export const isAuth = (roles) => {
    return async (req, res, next) => {

        const { authorization } = req.headers

        if (!authorization) {
            return next(new Error("Please Login first", { cause: 400 }))
        }

        if (!authorization.startsWith(process.env.TOKEN_PREFIX)) {
            return next(new Error("invalid token prefix", { cause: 400 }))
        }

        // Geting the token without a prefix word
        const splittedToken = authorization.split(' ')[1]

        // Phase refresh token
        try {
            const decodedData = verifyToken({ token: splittedToken, signature: process.env.LOGIN_SIGN })

            const findUser = await userModel.findById(
                decodedData._id,
                'email username role')
            if (!findUser) {
                return res.status(400).json({ message: 'Please SignUp' })
            }
            // / ============================= Authorization ===================
            if (!roles.includes(findUser.role)) {
                return next(
                    new Error('Unauthorized to access this API', { cause: 401 }),
                )
            }

            req.authUser = findUser
            next()
        } catch (error) {

            if (error == 'TokenExpiredError: jwt expired') {

                const user = await userModel.findOne({ token: splittedToken })

                if (!user) {
                    return res.status(400).json({ Message: "In valid user related to this token" })
                }

                // NOTE : this generation must looks like the token is generated in Login API
                const userToken = generateToken({
                    payload: { _id: user._id, role: user.role, email: user.email },
                    signature: process.env.LOGIN_SIGN,
                    expiresIn: "2d",
                })

                if (!userToken) {
                    return next(
                        new Error('token generation fail try again', {
                            cause: 400,
                        }),
                    )
                }

                await userModel.findOneAndUpdate(
                    { token: splittedToken },
                    { token: userToken },
                    { new: true }
                )
                return res.status(201).json({ Message: "Token is refreshed", newToken: userToken })
            }
            return next(new Error("In-valid Token", { cause: 400 }))
        }

    }
}

export const socketAuth = async (authorization, roles, socketId) => {

    if (!authorization) {
        getIO().to(socketId).emit('authSocket', 'Please Login first , send token')
        return false
    }

    if (!authorization.startsWith(process.env.TOKEN_PREFIX)) {
        getIO().to(socketId).emit('authSocket', 'invalid token prefix')
        return false
    }

    // Geting the token without a prefix word
    const splittedToken = authorization.split(' ')[1]

    // Phase refresh token
    try {
        const decodedData = verifyToken({ token: splittedToken, signature: process.env.LOGIN_SIGN })

        const findUser = await userModel.findById(
            decodedData._id,
            '_id email role socketId')
        if (!findUser) {
            getIO().to(socketId).emit('authSocket', 'Please SignUp ')
            return false
        }
        // / ============================= Authorization ===================
        if (!roles.includes(findUser.role)) {
            getIO().to(socketId).emit('authSocket', 'Unauthorized to access this API')
            return false
        }

        return findUser
    } catch (error) {

        if (error == 'TokenExpiredError: jwt expired') {

            const user = await userModel.findOne({ token: splittedToken })

            if (!user) {
                getIO().to(socketId).emit('authSocket', 'In valid user related to this token')
                return false
            }

            // NOTE : this generation must looks like the token is generated in Login API
            const userToken = generateToken({
                payload: { _id: user._id, role: user.role, email: user.email },
                signature: process.env.LOGIN_SIGN,
                expiresIn: "2d",
            })

            if (!userToken) {
                getIO().to(socketId).emit('authSocket', 'token generation fail try again')
                return false
            }

            await userModel.findOneAndUpdate(
                { token: splittedToken },
                { token: userToken },
                { new: true }
            )
            getIO().to(socketId).emit('authSocket', () => {
                return { message: "Token is refreshed", newToken: userToken }
            })
            return false
        }
        getIO().to(socketId).emit('authSocket', 'In-valid Token')
        return false
    }
}