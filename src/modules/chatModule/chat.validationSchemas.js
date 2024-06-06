import joi from 'joi'
import { generalFields } from '../../utils/validationGeneralFields.js'

export const sendMessageSchema = {
    body: joi.object({
        destId: generalFields.userId.required(),
        message: joi.string().required()
    })
        .required()
}

export const getChatSchema = {
    params: joi.object({
        destId: generalFields.userId.required(),
    })
        .required()
}