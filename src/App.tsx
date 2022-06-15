import React, {useEffect, useState} from 'react';
import './App.css';
import axios, { AxiosResponse } from 'axios';
import { RobotInfoResponseModel } from './model/RobotResponse';
import { RobotState } from './model/RobotStatus';
import { AnimatedDisks } from './components/AnimatedDisks';
import { StatusIndicationLight } from './components/StatusIndicationLight';
import { ErrorCodes, DiskEventCodes, RobotEvents } from './data/EventCodes';
import { AnimatedDiskDrop } from './components/AnimatedDiskDrop';
import { DiskColor } from './model/Disk';
import { io } from 'socket.io-client'

function App() {

  // default robot state has mostly 0s as values
  const initialDefaultRobotState: RobotState = {
    status: 0,
    nr_black_disks: 0,
    nr_white_disks: 0,
    nr_other_disks: 0,
    nr_disks_processing: 0
  } 

  const [robotState, setRobotState] = useState<RobotState>(initialDefaultRobotState);
  const [screenWidthIsMobile, setScreenWidthIsMobile] = useState<boolean>(false);
  // increasing these state variables would trigger disk dropdown animation to the corresponding disk container
  const [blackDiskAdd, setBlackDiskAdd] = useState(0);
  const [whiteDiskAdd, setWhiteDiskAdd] = useState(0);
  const [otherDiskAdd, setOtherDiskAdd] = useState(0);
  const [processingDiskAdd, setProcessingDiskAdd] = useState(0);
  const [loadingApp, setLoadingApp] = useState(false)
  const productionProcessEnv: any = process.env.REACT_APP_PRODUCTION; // environment variable that tells if app is production or not

  useEffect(() => {
    // set the loading status of the app as true while we are initializing app with data that we are fetching and request takes some time
    setLoadingApp(true)
    // get initial status of the robot: number of collected disks and error status
    // use REACT_APP_SERVER_URL from environment variables as base url for server requests
    axios.get(process.env.REACT_APP_SERVER_URL + '/robot/status')
        .then((res: AxiosResponse<RobotInfoResponseModel>) => {
      setRobotState(res.data as RobotState);
      setLoadingApp(false)
    })
    const windowWidth = window.innerWidth;
    setScreenWidthIsMobile(windowWidth < 530);
    // our app is responsive, so we change the screen size state variable value depending on the screen width
    window.addEventListener('resize', (e) => windowResize(e))

    console.log('PROD', process.env.REACT_APP_PRODUCTION)

    if (process.env.REACT_APP_PRODUCTION == 'true') { // if our REACT_APP_PRODUCTION is set to false, socket won't be initialized, good for local development on http
      // initialize new websocket with socket.io-client library. We set up secure websocket connection. We use url from environment variable to set up this connection
      const socketIo = io(process.env.REACT_APP_SERVER_WS_URL!, {transports: ['websocket'], withCredentials: true})

      //  new socket message about errors
      socketIo.on('errorUpdate', (event: number) => {
        setRobotState((prevState) => {
          let newRobotState: RobotState = {...prevState};
          newRobotState.status = event;
          return newRobotState;
        })
      })

      // disk events are associated with socketIo event code 'diskEvent'
      socketIo.on('diskEvent', (event: number, nrOfDisksBeingProcessed: number) => {
        console.log('event received from WS:', event, nrOfDisksBeingProcessed)
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
    }
    }, []);

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
    return RobotEvents[code as ErrorCodes];
  }

  /* These methods are for testing the UI */
  //
  const setLoadingStateOfApp = (loading: boolean) => {
    setLoadingApp(loading)
  }

  const setError = (error: number) => {
    setRobotState((prevState) => {
      return {...prevState, status: error}
    })
  }
  /* ===================================== */

  return (
    <div>
      {
        loadingApp ?
            <div className='app-loading-container'>
              <div className="loader"></div>
              <h1>Loading app</h1>
            </div> // we are loading app, show spinning icon
            :
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
                <div className='disksCollected'>
                  <AnimatedDiskDrop disk={{color: "other"}} animationTrigger={otherDiskAdd}></AnimatedDiskDrop>
                  <h1>Nr of other color disks collected</h1>
                  <p className='nrOfDisks'>{robotState.nr_other_disks}</p>
                </div>
              </div>
              <div className='disksCollectedContainers'>
                <div className='disksCollected processing'>
                  <AnimatedDiskDrop disk={{color: "processing"}} animationTrigger={processingDiskAdd}></AnimatedDiskDrop>
                  <h1 className='processingDisksText'>Nr of disks being processed</h1>
                  <p className='nrOfDisks processingDisksText'>{robotState.nr_disks_processing}</p>
                </div>
              </div>
            </div>
      }
      {
        productionProcessEnv == 'false' &&
        <div>
          <button onClick={() => setError(ErrorCodes.BLOCKED_SENSOR)}>Set error test</button>
          <button onClick={() => setError(ErrorCodes.NO_ERROR)}>Clear errors</button>
          <button onClick={() => setLoadingApp(true)}>Loading true</button>
          <button onClick={() => setLoadingApp(false)}>Loading false</button>
        </div>
      }
    </div>
  );
}

export default App;
