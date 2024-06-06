import joi from 'joi'
import { generalFields } from '../../utils/validationGeneralFields.js'

export const registerSchema = {
    body: joi
        .object({
            username: generalFields.username.required(),

            email: generalFields.email.required(),

            password: generalFields.password.required(),

            role: generalFields.role.optional()
        })
        .required()
}

export const loginSchema = {
    body: joi
        .object({
            email: generalFields.email.optional(),
            username: generalFields.username.optional(),
            password: generalFields.password.required(),
        })
        .required()
}

export const loginWithGoogleSchema = {
    body: joi
        .object({
            idToken: joi.string().required()
        })
        .required()
}