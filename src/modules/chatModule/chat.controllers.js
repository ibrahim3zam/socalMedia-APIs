import { userModel } from "../../../db/models/userModel.js"
import { chatModel } from "../../../db/models/chatModel.js"
import { getIO } from "../../utils/socketIo.js"

export const sendMessage = async (req, res, next) => {

    const { _id } = req.authUser
    const { message, destId } = req.body

    const destUser = await userModel.findById(destId)
    if (!destUser) {
        return next(new Error('In-valid destination user Id', { cause: 400 }))
    }

    const chat = await chatModel.findOne({
        $or: [
            { pOne: _id, pTwo: destId },
            { pOne: destId, pTwo: _id }
        ]
    }).populate([
        {
            path: 'pOne'
        },
        {
            path: 'pTwo'
        }
    ])

    if (!chat) {
        const newChat = await chatModel.create({
            pOne: _id,
            pTwo: destId,
            messages: {
                message,
                from: _id,
                to: destId
            }
        })

        // Socket emit receiveMessage (event) here
        getIO().to(destUser.socketId).emit('receiveMessage', message)

        return res.status(201).json({ message: "Done", newChat })
    }

    chat.messages.push({
        message,
        from: _id,
        to: destId
    })
    await chat.save()

    // Socket emit receiveMessage here
    getIO().to(destUser.socketId).emit('receiveMessage', message)

    res.status(201).json({ message: "Done", chat })
}

export const getChat = async (req, res, next) => {
    const { _id } = req.authUser
    const { destId } = req.params

    const chat = await chatModel.findOne({
        $or: [
            { pOne: _id, pTwo: destId },
            { pOne: destId, pTwo: _id }
        ]
    }).populate([
        {
            path: 'pOne'
        },
        {
            path: 'pTwo'
        }
    ])

    res.status(200).json({ message: "Done", chat })
}