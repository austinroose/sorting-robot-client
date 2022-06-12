// import { ReactComponent as WhiteDisk } from './icons/white-disk.svg';
import WhiteDisk2 from '../icons/white-disk.svg';
// import { ReactComponent as BlackDisk } from './icons/black-disk.svg';
import BlackDisk2 from '../icons/black-disk.svg';
import React, { ElementRef, useEffect, useRef, useState } from 'react';
import './AnimatedDisks.css'

interface AnimatedDisksProps {
    screenWidthIsMobile: boolean
}

export const AnimatedDisks: React.FC<AnimatedDisksProps> = (props) => {
    const whiteDisk = useRef<any | null>(null)
    const blackDisk = useRef<any | null>(null)

    useEffect(() => {
        let blackMarginLeft = 70;
        let whiteMarginLeft = 0;

        const intervalObj = setInterval(() => {
             if (blackMarginLeft == 100) {
                 blackMarginLeft = 0;
             }
             if (whiteMarginLeft == 100) {
                 whiteMarginLeft = 0;
             }
             blackMarginLeft += 10;
             whiteMarginLeft += 10;
             whiteDisk.current.style.marginLeft = whiteMarginLeft + "%"; // margin-left property increases until the element is totally out of the 
             blackDisk.current.style.marginLeft = blackMarginLeft + "%";
        }, 500)

        return function cleanUp() {
            clearInterval(intervalObj)
        }
    }, [])

    return (
        <div className="animatedDisksContainer">
            <img ref={whiteDisk} src={WhiteDisk2} height={props.screenWidthIsMobile ? "40px" : "60px"} width={props.screenWidthIsMobile ? "40px" : "60px"}></img>
            <img ref={blackDisk} src={BlackDisk2} height={props.screenWidthIsMobile ? "40px" : "60px"} width={props.screenWidthIsMobile ? "40px" : "60px"}></img>
        </div>
    )
}