import { systemRoles } from '../../utils/systemRoles.js'

export const chatApisRole = {
    SEND_MESSAGE: [systemRoles.USER, systemRoles.ADMIN],
    GET_CHAT: [systemRoles.USER, systemRoles.ADMIN],
}