// defining response model of request
export interface RobotInfoResponseModel {
    nr_black_disks: number;
    nr_white_disks: number;
    nr_other_disks: number;
    status: number;
    nr_disks_processing: number;
}

export interface WebSocketRecieve {
    event: number
}

export interface WebSocketRecieveDiskCollected {
    event: number
    nr_of_disks_being_processed: number
}