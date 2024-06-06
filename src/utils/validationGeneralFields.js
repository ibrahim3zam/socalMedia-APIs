import joi from 'joi'
import { Types } from 'mongoose'
import { systemRoles } from './systemRoles.js'

// ======= custome validation for object-Id ========
const validationObjectId = (value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message('invalid id')
}

// ======= fields are used more than once ========
export const generalFields = {

    userId: joi.string().custom(validationObjectId),

    username: joi.string().min(3).max(20).regex(/^[a-zA-Z_-\s]*$/).trim()
        .messages({ 'any.required': 'userName is required', }),

    email: joi.string().email({ tlds: { allow: ['com', 'net', 'org'] } })
        .regex(/^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+(com|org|net)$/).trim(),

    password: joi.string().min(6).regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{5,}$/)
        .messages({ 'string.pattern.base': 'Password regex fail', }),

    role: joi.string().valid(systemRoles.USER, systemRoles.ADMIN),

    files: joi.array().items(
        joi.object({
            size: joi.number().positive().required(),
            path: joi.string().required(),
            filename: joi.string().required(),
            destination: joi.string().required(),
            mimetype: joi.string().required(),
            encoding: joi.string().required(),
            originalname: joi.string().required(),
            fieldname: joi.string().required()
        })
    )

}