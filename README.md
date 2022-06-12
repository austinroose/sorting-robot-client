# Sorting robot client app

## Description
Through the web app of the sorting robot, the number of disks being processed and number of disks being collected per color or type (black, white, other) can be seen. Also any of the errrors that robot encounters are being shown.

## Used tech stack
### React
This web app was built usin React framework [Create React App](https://github.com/facebook/create-react-app).
React is open-source JavaScript library for building frontend applications based on UI components

React was used due to the following reasons:
- App can be separated into reusable components that have their own state and props and can be imported anywhere inside app
- No hassle to deal with DOM manipulation as all of this comes with React
- Already lot of built-in functionality such as support for WebSockets
- Easy to develop while changes are updated real-time with hot-reloading
- Easily accessible documentation and lot of information online as it is popular framework


The app was bootsrapped with command ```npx create-react-app my-app --template typescript``` that enables to set up initial React project with TypeScript.

TypeScript was decided to be used over JavaScript in this application while it supports static type checking and thus enables 
to better avoid bugs during developement. This also ensures better production-grade quality of the code.

### WebSocket

WebSocket is a computer communications protocol, providing full-duplex communication channels over a single TCP connection [^1]
In our case we use WebSocket TypeScript interface that is API which provides us the functionality of establishing WebSocket connection 
with server for recieving and sending data real-time.

## Workflow
In React, we use functional components with hooks. Hooks are React feature that act as kind of functions and preserve the state 
and props of the component in themselves [^2]. This way we don't have to define any special classes for defining component states or props management etc.
1). App is initialized with default status of the robot. Collected black disks, white disks, other disks, disks being processed and error is set to 0. Error 0 means that robot is in working state and there are no errors.
2) useEffect hook in our main App.tsx file that is the entry component of our app is run. This initializes WebSocket connection with our server by assigning to one variable a WebSocket object. Initial state of the robot is fetched from the server to populate app with number of black disks and white disks that the robot has already collected and if there is currently any of the errros. Default robot state of app is replaced with this new recieved robot state.
3) If new WebSocket message is recieved and 'data.event' attribute of WebSocket response recieved corresponds to any of the DISK_COLLECTED event codes that are in the range 100 - 199, then corresponding attribute (nr_black_disks, nr_white_disks, nr_other_disks, nr_of_disks_being_processed) in the robot state is increased by 1 and number of disks being processed value in the state is also set to the value recieved with WebSocket message.
4) If new WebSocket message is recieved and 'data.event' attribute of WebSocket response recieved corresponds to none of the DISK_COLLECTED event codes, meaning that this code isn't in the range 100 - 199, then the error attribute of the robot is set to recieved event code.
5). On the frontend side, we show in separate sections the number corresponding to the number of white disks collected and number corresponding to the number of black disks collected. On top of the app, we indicate if robot is in the working state or in the error state and also on the error we show the corresponding error message. When collected disk number is updated in the robot state, then thanks to React, it also gets automatically updated in the corresponding location on the frontend template. Therefore we can as well conditionally render the error state and error message of the robot. If no error event is recieved, then we show normal status and when we encounter error, updating the state also automatically updates the view to show the error.

# Constants

## EventCodes
| value         | event                    |
| ------------- | -------------            |
| 100           | black disk collected     |
| 101           | white disk collected     |
| 102           | other disk collected     |
| 110           | new disk being processed |

## ErrorEventCodes
| value         | event                |
| ------------- | -------------        |
| 0 | robot in working state (no errors)       |
| 200           | disk collected from main belt, but did not get into its container |
| 201           | jammed motor |
| 202           | blocked motor |

# Requests

## GET request for robot status

| response body        | description               | values |
| ------------- | -------------        | --------- |
|     ```{nr_black_disks: integer, nr_white_disks: integer, nr_other_disks: integer, nr_of_disks_being_processed: integer, error: $error}```       | get the current status of the robot | error(integer): number representing error (see constants) |

## WebSocket message

| message body        | description               | values |
| ------------- | -------------        | --------- |
|  ```{"data": {"event": $eventCode}}``` | recieve events from robot about errors or disks | eventCode(integer) - code representing either disk or error event, see constants |
|  ```{"data": {"event": $eventCode, "nr_of_disks_being_processed": $nr_of_disks_being_processed}}``` | events of new disk recieved from main belt or events of disks being sorted to containers | eventCode(integer) - code representing the processing new disk event or code representing the color of the disk that has been sorted (see constants, EventCodes), nr_of_disks_being_processed(integer): number of disks being processed after that action by the robot|

## Available Scripts

For running this app, npm, that is node package manager, needs to be installed on local machiene. To install all necessery packages for this project, `npm install` needs be run in project root folder.
  
In the project directory, you can then run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## References
[^1]: https://en.wikipedia.org/wiki/WebSocket.
[^2]: https://reactjs.org/docs/hooks-overview.html
