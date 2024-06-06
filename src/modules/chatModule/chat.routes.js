import { Router } from "express";
import * as cc from './chat.controllers.js'
import { asyncHandler } from "../../utils/errorHandler.js";
import { isAuth } from '../../middlewares/auth.js'
import { chatApisRole } from './chat.endPoints.js'
import { validationFunction } from '../../middlewares/validation.js'
import * as validator from './chat.validationSchemas.js'
const router = Router()


router.post('/send',
    isAuth(chatApisRole.SEND_MESSAGE),
    validationFunction(validator.sendMessageSchema),
    asyncHandler(cc.sendMessage))

router.get('/:destId',
    isAuth(chatApisRole.GET_CHAT),
    validationFunction(validator.getChatSchema),
    asyncHandler(cc.getChat))



export default router