export enum ErrorCodes {
    DISK_COLLECTED_BUT_DID_NOT_GET_TO_CONTAINER = 200,
    JAMMED_MOTOR,
    BLOCKED_SENSOR
}

export enum DiskEventCodes {
    BLACK_DISK_COLLECTED = 100,
    WHITE_DISK_COLLECTED,
    OTHER_DISK_COLLECTED,
    NEW_DISK_BEING_PROCESSED = 110
}

// we associate human-readable text with each error code constant as well as robot event constant
export const RobotEvents: {[key in ErrorCodes | DiskEventCodes]: string} = {
    [ErrorCodes.DISK_COLLECTED_BUT_DID_NOT_GET_TO_CONTAINER]: "Disk was collected from main belt, but didn't get put to container",
    [ErrorCodes.JAMMED_MOTOR]: 'Jammed motor',
    [ErrorCodes.BLOCKED_SENSOR]: 'Blocked sensor',
    [DiskEventCodes.BLACK_DISK_COLLECTED]: 'Black disk collected',
    [DiskEventCodes.WHITE_DISK_COLLECTED]: 'White disk collected',
    [DiskEventCodes.OTHER_DISK_COLLECTED]: 'Other color disk collected',
    [DiskEventCodes.NEW_DISK_BEING_PROCESSED]: 'New disk is being processed',
}