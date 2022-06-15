import React, {useEffect, useState} from 'react';
import './App.css';
import axios, { AxiosResponse } from 'axios';
import { RobotInfoResponseModel, WebSocketRecieveDiskCollected } from './model/RobotResponse';
import { RobotState } from './model/RobotStatus';
import { AnimatedDisks } from './components/AnimatedDisks';
import { StatusIndicationLight } from './components/StatusIndicationLight';
import { ErrorCodes, DiskEventCodes, RobotEvents } from './data/EventCodes';
import { ifDiskEvent } from './util';
import { AnimatedDiskDrop } from './components/AnimatedDiskDrop';
import { DiskColor } from './model/Disk';
import { io } from 'socket.io-client'

function App() {

  const initialDefaultRobotState: RobotState = {
    status: 0,
    nr_black_disks: 0,
    nr_white_disks: 0,
    nr_other_disks: 0,
    nr_disks_processing: 0
  } 

  const [websocket, setWebSocket] = useState<WebSocket>();
  const [robotState, setRobotState] = useState<RobotState>(initialDefaultRobotState);
  const [screenWidthIsMobile, setScreenWidthIsMobile] = useState<boolean>(false);
  // increasing these state variables would trigger disk dropdown animation to the corresponding disk container
  const [blackDiskAdd, setBlackDiskAdd] = useState(0);
  const [whiteDiskAdd, setWhiteDiskAdd] = useState(0);
  const [otherDiskAdd, setOtherDiskAdd] = useState(0);
  const [processingDiskAdd, setProcessingDiskAdd] = useState(0);

  useEffect(() => {
    console.log(process.env.REACT_APP_SERVER_WS_URL)
    // get initial status of the robot: number of collected disks and error status
    // use REACT_APP_SERVER_URL from environment variables as base url for server requests
    axios.get(process.env.REACT_APP_SERVER_URL + '/robot/status')
        .then((res: AxiosResponse<RobotInfoResponseModel>) => {
      setRobotState(res.data as RobotState);
    })
    const windowWidth = window.innerWidth;
    setScreenWidthIsMobile(windowWidth < 530);
    // window.addEventListener('resize', (e) => windowResize(e))
    // // initialize websocket connection with the server over protocolOne protocol
    // // we start either normal websocket connection over ws protocol or secure websocket connection over wss protocol if we are in production environment
    // const loc = window.location;
    // let wsStart = 'ws://';
    // let endpoint = wsStart + '127.0.0.1:8000' + '/';
    // if (true) {
    //   wsStart = 'wss://'
    //   endpoint = wsStart + 'localhost:443' + '/';
    // }
    // // const robotWebSocket = new WebSocket(process.env.REACT_APP_SERVER_WS_URL!, "protocolOne");
    // const robotWebSocket = new WebSocket("wss://localhost:8000/", "protocolOne");
    // // @ts-ignore
    // robotWebSocket.onerror = (error) => {
    //   console.log('error', error)
    // }
    // setWebSocket(robotWebSocket);
    const socketIo = io(process.env.REACT_APP_SERVER_WS_URL!, {transports: ['websocket'], withCredentials: true})

    socketIo.on('errorUpdate', (event) => {
      setRobotState((prevState) => {
        let newRobotState: RobotState = {...prevState};
        newRobotState.status = event;
        return newRobotState;
      })
    })

    // disk events are associated with socketIo event code 'diskEvent'
    socketIo.on('diskEvent', (event, nrOfDisksBeingProcessed) => {
        if (event == DiskEventCodes.NEW_DISK_BEING_PROCESSED) {
          // new disk is being processed event
          setRobotState((prevState) => {
            let newRobotState: RobotState = {...prevState};
            newRobotState.nr_disks_processing = nrOfDisksBeingProcessed; // only update number of disks being processed
            diskAddAnimation({color: 'processing'});
            return newRobotState;
          })
        } else {
          // new disk was recieved and we need to update the collected disks number
          setRobotState((prevState) => {
            let newRobotState: RobotState = {...prevState};
            newRobotState.nr_disks_processing = nrOfDisksBeingProcessed;
            switch(event) {
              case DiskEventCodes.BLACK_DISK_COLLECTED:
                newRobotState.nr_black_disks = newRobotState.nr_black_disks + 1; // increase number of disks collected state variable
                diskAddAnimation({color: 'black'}); // add disk animation
                break
              case DiskEventCodes.WHITE_DISK_COLLECTED:
                newRobotState.nr_white_disks = newRobotState.nr_white_disks + 1;
                diskAddAnimation({color: 'white'});
                break
              case DiskEventCodes.OTHER_DISK_COLLECTED:
                newRobotState.nr_other_disks = newRobotState.nr_other_disks + 1;
                diskAddAnimation({color: 'other'});
                break
            }
            return newRobotState
          })
        }
      })
    }, [])
    // robotWebSocket.onmessage = (e: any) => {
    //   console.log("WS receive: ", JSON.parse(e.data).id)
    //   const reqData = JSON.parse(e.data);
    //   const eventCode: number = reqData.event // recieved event code
    //   // if we have disk event or error event
    //   const ifDiskRecieved = ifDiskEvent(eventCode);
    //   if (ifDiskRecieved) { // event code in the range of 100 - 199
    //     const wsData: WebSocketRecieveDiskCollected = reqData // cast WebSocket data to valid type
    //     if (wsData.event == DiskEventCodes.NEW_DISK_BEING_PROCESSED) {
    //       // new disk is being processed event
    //       setRobotState((prevState) => {
    //         let newRobotState: RobotState = {...prevState};
    //         newRobotState.nr_of_disks_being_processed = wsData.nr_of_disks_being_processed; // only update number of disks being processed
    //         diskAddAnimation({color: 'processing'});
    //         return newRobotState;
    //       })
    //     } else {
    //       // new disk was recieved and we need to update the collected disks number
    //       setRobotState((prevState) => {
    //         let newRobotState: RobotState = {...prevState};
    //         newRobotState.nr_of_disks_being_processed = wsData.nr_of_disks_being_processed;
    //         switch(reqData.event) {
    //           case DiskEventCodes.BLACK_DISK_COLLECTED:
    //             newRobotState.nr_black_disks = newRobotState.nr_black_disks + 1; // increase number of disks collected state variable
    //             diskAddAnimation({color: 'black'}); // add disk animation
    //             break
    //           case DiskEventCodes.WHITE_DISK_COLLECTED:
    //             newRobotState.nr_white_disks = newRobotState.nr_white_disks + 1;
    //             diskAddAnimation({color: 'white'});
    //             break
    //           case DiskEventCodes.OTHER_DISK_COLLECTED:
    //             newRobotState.nr_other_disks = newRobotState.nr_other_disks + 1;
    //             diskAddAnimation({color: 'other'});
    //             break
    //         }
    //         return newRobotState
    //       })
    //     }
    //   } else {
    //     // we got error event
    //     setRobotState((prevState) => {
    //       let newRobotState: RobotState = {...prevState};
    //       newRobotState.error = reqData.event;
    //       return newRobotState;
    //     })
    //   }
    // }

  const windowResize = (e: UIEvent) => {
    const windowWidth = window.innerWidth;
    setScreenWidthIsMobile(windowWidth < 530);
  }

  const diskAddAnimation = (disk: DiskColor) => {
    switch (disk.color) {
      case 'black':
        setBlackDiskAdd((prevState) => prevState + 1);
        break
      case 'white':
        setWhiteDiskAdd((prevState) => prevState + 1);
        break
      case 'processing':
        setProcessingDiskAdd((prevState) => prevState + 1);
        break
      case 'other':
        setOtherDiskAdd((prevState) => prevState + 1);

    }
  }

  const convertErrorCodeToErrorMessage = (code: number) => {
    console.log('error', code)
    return RobotEvents[code as ErrorCodes];
  }

  return (
    <div>
      <div className='statusContainer'>
        <div className='statusContainerContent'>
          <h1>App status:</h1>
          {
            robotState.status == 0 ?
            <div>
              <div className='statusText'><p>Fully functional</p> 
                <StatusIndicationLight status={1}></StatusIndicationLight>
              </div>
              <div className='animationContainer'>
                <AnimatedDisks screenWidthIsMobile={screenWidthIsMobile}></AnimatedDisks>
              </div>
            </div>
            :
            <div>
              <div className='statusText error'><p>Error mode</p>
                <StatusIndicationLight status={0}></StatusIndicationLight>
              </div>
              <p>Error message: {convertErrorCodeToErrorMessage(robotState.status as number)}</p>
            </div>
          }
        </div>
      </div>
      <div className='disksCollectedContainers'>
        <div className='disksCollected'>
          <AnimatedDiskDrop disk={{color: "black"}} animationTrigger={blackDiskAdd}></AnimatedDiskDrop>
          <h1>Black disks</h1>
          <p className='nrOfDisks'>{robotState.nr_black_disks}</p>
        </div>
        <div className='disksCollected right'>
          <AnimatedDiskDrop disk={{color: "white"}} animationTrigger={whiteDiskAdd}></AnimatedDiskDrop>
          <h1>White disks</h1>
          <p className='nrOfDisks'>{robotState.nr_white_disks}</p>
        </div>
      </div>
      <div className='disksCollectedContainers'>
        <div className='disksCollected processing'>
          <AnimatedDiskDrop disk={{color: "processing"}} animationTrigger={processingDiskAdd}></AnimatedDiskDrop>
          <h1 className='processingDisksText'>Nr of disks being processed</h1>
          <p className='nrOfDisks processingDisksText'>{robotState.nr_disks_processing}</p>
        </div>
      </div>
      <button>error</button>
      <button onClick={() => diskAddAnimation({color: 'processing'})}>Processing disk add animation</button>
    </div>
  );
}

export default App;
