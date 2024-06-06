import { Router } from "express";
import * as uc from './user.controller.js'
import { asyncHandler } from "../../utils/errorHandler.js";
import { multerCloudFunction } from '../../services/multerCloudService.js'
import { allowedExtensions } from '../../utils/multerAllowedExtensions.js'
import { isAuth } from '../../middlewares/auth.js'
import { userApisRole } from './user.endPoints.js'
import { validationFunction } from '../../middlewares/validation.js'
import * as validator from './user.validationSchema.js'
const router = Router()


router.post('/logout',
    isAuth(userApisRole.LOGOUT),
    validationFunction(validator.logoutSchema),
    asyncHandler(uc.logout)
)

router.put('/update',
    multerCloudFunction(allowedExtensions.Image)
        .fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'coverPicture', maxCount: 1 }]),
    isAuth(userApisRole.UPDATE),
    validationFunction(validator.updateSchema),
    asyncHandler(uc.update))


router.get('/get',
    isAuth(userApisRole.GET_A_USER),
    validationFunction(validator.getUserSchema),
    asyncHandler(uc.getUser))

router.delete('/delete',
    isAuth(userApisRole.DELETE_A_USER),
    validationFunction(validator.deleteUserSchema),
    asyncHandler(uc.deleteUser))

router.patch('/follow',
    isAuth(userApisRole.FOLLOW),
    validationFunction(validator.followSchema),
    asyncHandler(uc.follow))


router.patch('/unfollow',
    isAuth(userApisRole.UNFOLLOW),
    validationFunction(validator.unfollowSchema),
    asyncHandler(uc.unfollow))

router.post('/forget',
    isAuth(userApisRole.RESET_PASSWORD),
    validationFunction(validator.forgetPasswordSchema),
    asyncHandler(uc.forgetPassword))

router.post('/reset/:token',
    validationFunction(validator.resetPasswordSchema),
    asyncHandler(uc.resetPassword))

export default router