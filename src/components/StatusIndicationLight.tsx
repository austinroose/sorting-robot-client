import React from 'react';
import './StatusIndicationLight.css';


interface StatusIndicationLightProps {
    status: number
}

export const StatusIndicationLight: React.FC<StatusIndicationLightProps> = (props) => {
    return (
        <div className={props.status == 1 ? 'light working' : 'light error'}>
        </div>
    )
}