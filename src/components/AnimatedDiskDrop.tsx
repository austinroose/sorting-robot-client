import React, { useEffect, useRef, useState } from 'react';
import { DiskColor } from '../model/Disk';
import {ReactComponent as WhiteDisk} from '../icons/white-disk.svg';
import {ReactComponent as ProcessingDisk} from '../icons/processing-disk.svg';
import {ReactComponent as OtherDisk} from '../icons/other-disk.svg';
import BlackDisk3 from '../icons/black-disk.svg';

import './AnimatedDiskDrop.css';

export interface AnimatedDiskDropProps {
    disk: DiskColor;
    animationTrigger: number; // we can trigger animation with increasing this prop of component
}

export const AnimatedDiskDrop: React.FC<AnimatedDiskDropProps> = (props) => {
    // useRef hook gets the reference to the html element, so that we can change its style through javascript
    const diskRef = useRef<any>(null);
    // for sanity, clear setTimout functions after component dismount. So store these in some variable to able to clear them later
    const [timeOutObjects, setTimeOutObjects] = useState<any[]>([]);

    // animate dropdown 
    useEffect(() => {
        // prop animationTrigger must be 0 on initial don't want to trigger animation on first page load as useEffect hook will still run on first page load
        if (props.animationTrigger > 0) {
            animateDiskDroppingDown();
        }
        return function cleanUp() {
            // on component dismount from the view, clear all timeout objects
            for (let timeOutobj of timeOutObjects) {
                clearTimeout(timeOutobj);
            }
        }
    }, [props.animationTrigger]) // by increasing animationTrigger prop in the parent view, we can evoke useEffect function and so trigger the animation

    // animate disk dropping down and at the same down fading out
    function animateDiskDroppingDown() {
        clearAllTimeouts(); // on new animation, clear all timeouts and set the timeout state value to be empty array
        setTimeOutObjects([]);
        diskRef.current.style.zIndex = '1'; // set the disk to be in the topmost layer in the view
        diskRef.current.style.transitionProperty = "margin, opacity" // we are aimating opacity and position of the disk
        diskRef.current.style.transitionDuration = '0ms'; // change initially transition duration to 0 as we don't want to animate the disk moving up
        diskRef.current.style.marginTop = '-60px'; // initially we set the disk to be higher than its original position
        diskRef.current.style.opacity = '100%'; // disk is visible
        const timeOut = setTimeout(() => { // delay function, function body will be run after mentioned ms
            const transitionTime = 1000; // how fast we want the transition to be
            diskRef.current.style.transitionDuration = "" + transitionTime + "ms"; // set animation duration
            diskRef.current.style.opacity = '0%'; // finally set the disk to be invisible
            diskRef.current.style.marginTop = "0px"; // to make the disk to fall down so set its final positon to be the original positon
            const timeOut2 = setTimeout(() => {
                diskRef.current.style.zIndex = '-100'; // set the disk to be the most bottom element in the view so that it doesn't stop clicking any buttons etc that could be behind it
            }, transitionTime) 
            setTimeOutObjects((prevState) => [...prevState, timeOut2]);    
        }, 50)
        setTimeOutObjects((prevState) => [...prevState, timeOut]);
    }

    // function that stops all currently actiave timeouts
    function clearAllTimeouts() {
        for (let timeOutobj of timeOutObjects) {
            clearTimeout(timeOutobj);
        }
    }

    // depending on prop disk color value, we add the correct component to the view
    return (
        <div>
            <div className='disk'>
                {
                    props.disk.color == 'black' &&
                    <img className='banner' src={BlackDisk3} ref={diskRef}/>
                }
                {
                    props.disk.color == 'white' &&
                    <WhiteDisk className={`banner`} ref={diskRef}></WhiteDisk>
                }
                {
                    props.disk.color == 'other' &&
                    <OtherDisk className={`banner`} ref={diskRef}></OtherDisk>
                }
                {
                    props.disk.color == 'processing' &&
                    <ProcessingDisk className={`banner`} ref={diskRef}></ProcessingDisk>
                }
            </div>
        </div>
    )
}