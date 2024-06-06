import { Server } from 'socket.io'

let io;

export function initiateIO(httpServer) {
    io = new Server(httpServer, {
        cors: '*'
    })
    return io;
}

export const getIO = () => {
    if (!io) {
        return new Error('can not get io', { cause: 500 })
    }
    return io
}

