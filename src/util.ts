// returns true if disk event (events in the range 100 - 199) or error event (events starting with codes 200) 
export const ifDiskEvent = (eventCode: number): boolean => {
    if (eventCode - 100 < 99) {
        return true;
    }
    return false;
}