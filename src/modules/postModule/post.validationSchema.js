import joi from 'joi'
import { generalFields } from '../../utils/validationGeneralFields.js'

export const createSchema = {

    body: joi
        .object({
            desc: joi.string().max(200).optional(),
            likes: joi.array().items(generalFields.userId).optional(),
            files: generalFields.files.optional()

        }).optional(),
    query: joi.object({
        userId: generalFields.userId.required()
    }).required(),
}

export const updateSchema = {

    body: joi
        .object({
            desc: joi.string().max(200).optional(),
            files: generalFields.files.optional()

        }).required(),
    query: joi.object({
        postId: generalFields.userId.required(),
        userId: generalFields.userId.required()
    }).required(),
}

export const deleteSchema = {

    query: joi.object({
        postId: generalFields.userId.required(),
        userId: generalFields.userId.required()
    }).required(),
}

export const likeDislikeSchema = {

    query: joi.object({
        postId: generalFields.userId.required(),
        likedId: generalFields.userId.required(),
    }).required(),
}

export const timeLine = {

    query: joi.object({
        userId: generalFields.userId.required(),
    }).required(),
}
