import joi from 'joi'
import { generalFields } from '../../utils/validationGeneralFields.js'

export const logoutSchema = {
    query: joi
        .object({
            userId: generalFields.userId.required(),
        })
        .required()
}

export const updateSchema = {
    body: joi
        .object({
            username: generalFields.username.optional(),

            password: generalFields.password.optional(),

            Cpassword: generalFields.password.valid(joi.ref('password')).optional(),

            oldpassword: generalFields.password.optional(),

            desc: joi.string().max(50).optional(),
            city: joi.string().min(3).max(25).optional(),
            from: joi.string().min(3).max(20).optional(),
            relationship: joi.string().valid('single', 'engaged', 'divorced').optional(),
            files: generalFields.files.optional()

        })
        .required()
}

export const getUserSchema = {
    query: joi.object({
        userId: generalFields.userId.required()
    }).required()
}

export const deleteUserSchema = {
    query: joi.object({
        userId: generalFields.userId.required()
    }).required()
}

export const followSchema = {
    query: joi.object({
        followedId: generalFields.userId.required()
    }).required()
}

export const unfollowSchema = {
    query: joi.object({
        unfollowedId: generalFields.userId.required()
    }).required()
}

export const forgetPasswordSchema = {
    body: joi
        .object({
            email: generalFields.email.required(),
        }).required()
}

export const resetPasswordSchema = {
    body: joi
        .object({
            password: generalFields.password.required(),
            Cpassword: generalFields.password.valid(joi.ref('password')).required(),

        }).required()
}
