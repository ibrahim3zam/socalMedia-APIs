import { Router } from "express";
import { multerCloudFunction } from '../../services/multerCloudService.js'
import * as pc from './post.controller.js'
import { asyncHandler } from "../../utils/errorHandler.js";
import { allowedExtensions } from '../../utils/multerAllowedExtensions.js'
import { isAuth } from '../../middlewares/auth.js'
import { userApisRole } from './post.endPoints.js'
import { validationFunction } from '../../middlewares/validation.js'
import * as validator from './post.validationSchema.js'
const router = Router()


router.post('/create',
    multerCloudFunction([...allowedExtensions.Image, ...allowedExtensions.Videos])
        .array("postMedia", { maxCount: 2 }),
    isAuth(userApisRole.CREATE),
    validationFunction(validator.createSchema),
    asyncHandler(pc.create))


router.put('/update',
    multerCloudFunction([...allowedExtensions.Image, ...allowedExtensions.Videos])
        .array("postMedia", { maxCount: 2 }),
    isAuth(userApisRole.UPDATE),
    validationFunction(validator.updateSchema),
    asyncHandler(pc.update))


router.delete('/delete',
    isAuth(userApisRole.DELETE),
    validationFunction(validator.deleteSchema),
    asyncHandler(pc.deletePost))

router.patch('/like',
    isAuth(userApisRole.LIKE_DISLIKE),
    validationFunction(validator.likeDislikeSchema),
    asyncHandler(pc.like_Dislike))

router.get('/timeline',
    isAuth(userApisRole.TIMELINE),
    validationFunction(validator.timeLine),
    asyncHandler(pc.timeLine)
)
export default router