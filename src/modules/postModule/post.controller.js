import { postModel } from '../../../db/models/postModel.js'
import { userModel } from '../../../db/models/userModel.js'
import cloudinary from '../../utils/mediaCloudConfig.js'


export const create = async (req, res, next) => {

    const { _id } = req.authUser
    const { userId } = req.query
    const { desc } = req.body


    if (_id.toString() !== userId.toString()) {
        return next(new Error("there is a conflict between token's id and sent id", { cause: 400 }))
    }
    const user = await userModel.findById(_id).select('token')
    if (!user.token) {
        return next(new Error("this user is logged out ,log in to continue process", { cause: 400 }))
    }

    let description
    if (desc) description = desc

    let mediasArr = []
    if (req.files) {
        for (let index = 0; index < req.files.length; index++) {
            const { path, fieldname } = req.files[index]
            if (fieldname == "postMedia") {
                const { secure_url, public_id } = await cloudinary.uploader.upload(path,
                    {
                        folder: `${process.env.POSTS_FOLDER_ROOT}/${_id}`
                    }
                )
                mediasArr.push({ secure_url, public_id })
            }
        }
    }

    const postInstance = new postModel({
        userId,
        desc: description ? description : desc,
        medias: mediasArr ? mediasArr : medias
    })

    const savedPost = await postInstance.save()
    res.status(201).json({ message: "post has been created", savedPost })

}

export const update = async (req, res, next) => {
    const { _id } = req.authUser
    const { userId, postId } = req.query
    const { desc } = req.body

    if (_id.toString() !== userId.toString()) {
        return next(new Error("there is a conflict between token's id and sent id", { cause: 400 }))
    }
    const user = await userModel.findById(_id).select('token')
    if (!user.token) {
        return next(new Error("this user is logged out ,log in to continue process", { cause: 400 }))
    }

    const isPostExist = await postModel.findById(postId)
    if (!isPostExist) {
        return next(new Error("It seems like that post might be deleted", { cause: 400 }))
    }

    const postCheck = await postModel.hydrate(isPostExist)

    if (desc) postCheck.desc = desc

    if (req.files) {
        let publicIds = []
        let mediasArr = []

        for (let index = 0; index < req.files.length; index++) {
            const { path, fieldname } = req.files[index]
            if (fieldname == "postMedia") {
                const { secure_url, public_id } = await cloudinary.uploader.upload(path,
                    {
                        folder: `${process.env.POSTS_FOLDER_ROOT}/${_id}`
                    }
                )
                mediasArr.push({ secure_url, public_id })
            }
        }

        if (postCheck.medias.length) {

            for (let index = 0; index < postCheck.medias.length; index++) {
                const { public_id } = postCheck.medias[index];
                publicIds.push(public_id)
            }
            await cloudinary.api.delete_resources(publicIds)
        }
        postCheck.medias = mediasArr
    }
    const updatedPost = await postCheck.save()
    if (!updatedPost) {
        return next(new Error("Fail to update", { cause: 400 }))
    }

    res.status(200).json({ message: "post has been updated successfully", updatedPost })
}

export const deletePost = async (req, res, next) => {
    const { _id } = req.authUser
    const { userId, postId } = req.query

    if (_id.toString() !== userId.toString()) {
        return next(new Error("there is a conflict between token's id and sent id", { cause: 400 }))
    }
    const user = await userModel.findById(_id).select('token')
    if (!user.token) {
        return next(new Error("this user is logged out ,log in to continue process", { cause: 400 }))
    }
    const isPostExist = await postModel.findById(postId)
    if (!isPostExist) {
        return next(new Error("It seems like that post might be deleted", { cause: 400 }))

    }

    // delete from cloud
    let publicIds = []
    for (let index = 0; index < isPostExist.medias.length; index++) {
        const { public_id } = isPostExist.medias[index];
        publicIds.push(public_id)
    }
    await cloudinary.api.delete_resources(publicIds)

    // Delete from DB
    const deletedPost = await postModel.findByIdAndDelete(postId)

    res.status(200).json({ message: "deleted is done", deletedPost })
}

export const like_Dislike = async (req, res, next) => {

    const { token } = req.authUser
    const { likedId, postId } = req.query

    if (!token) {
        return next(new Error("this user is logged out ,log in to continue process", { cause: 400 }))
    }
    const post = await postModel.findById(postId)
    if (!post) {
        return next(new Error("It seems like that post might be deleted", { cause: 400 }))
    }

    let postResult
    if (!post.likes.includes(likedId)) {
        postResult = await postModel.findByIdAndUpdate(postId, { $push: { likes: likedId } }, { new: true })

    } else {
        postResult = await postModel.findByIdAndUpdate(postId, { $pull: { likes: likedId } }, { new: true })

    }

    const { likes, ...others } = postResult._doc

    res.status(200).json({ message: "Done", likes })
}

export const timeLine = async (req, res, next) => {
    const { _id, token } = req.authUser
    const { userId } = req.query


    if (_id.toString() !== userId.toString()) {
        return next(new Error("there is a conflict between token's id and sent id", { cause: 400 }))
    }
    if (!token) {
        return next(new Error("this user is logged out ,log in to continue process", { cause: 400 }))
    }

    const currentUser = await userModel.findById(userId)
    const userPost = await postModel.find({ userId })

    const friendPosts = await Promise.all(
        currentUser.following.map((friendId) => {
            return postModel.find({ userId: friendId })
        })
    )

    if (!userPost && !friendPosts) {
        return next(new Error("There are no posts and timeline yet", { cause: 400 }))
    }

    const timeline = userPost.concat(...friendPosts)
    res.status(200).json({ message: "Timeline Live...", timeline })
}