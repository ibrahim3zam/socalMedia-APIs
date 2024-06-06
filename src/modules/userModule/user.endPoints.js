import { systemRoles } from '../../utils/systemRoles.js'

export const userApisRole = {
    LOGOUT: [systemRoles.USER, systemRoles.ADMIN],
    RESET_PASSWORD: [systemRoles.USER, systemRoles.ADMIN],
    UPDATE: [systemRoles.USER],
    GET_A_USER: [systemRoles.USER, systemRoles.ADMIN],
    DELETE_A_USER: [systemRoles.USER, systemRoles.ADMIN],
    FOLLOW: [systemRoles.USER],
    UNFOLLOW: [systemRoles.USER]
}