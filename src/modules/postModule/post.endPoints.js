import { systemRoles } from '../../utils/systemRoles.js'

export const userApisRole = {
    CREATE: [systemRoles.USER],
    UPDATE: [systemRoles.USER],
    DELETE: [systemRoles.USER],
    LIKE_DISLIKE: [systemRoles.USER],
    TIMELINE: [systemRoles.USER]
}