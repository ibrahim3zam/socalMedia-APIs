import { Router } from "express";
import { asyncHandler } from "../../utils/errorHandler.js";
import * as ac from './auth.controller.js'
import { validationFunction } from '../../middlewares/validation.js'
import * as validator from './auth.validationSchema.js'

const router = Router()

router.post('/register', validationFunction(validator.registerSchema), asyncHandler(ac.register))
router.get('/confirmEmail/:token', asyncHandler(ac.confirmEmail))

router.post('/login', validationFunction(validator.loginSchema), asyncHandler(ac.login))
router.post('/googleAuth',
    validationFunction(validator.loginWithGoogleSchema),
    asyncHandler(ac.loginWithGmail))

export default router