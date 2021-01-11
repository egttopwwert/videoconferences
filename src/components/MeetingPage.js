import React, { createRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { OpenVidu } from 'openvidu-browser';

import { PublisherVideoComponent, SubscriberVideoComponent } from './UserVideoComponent';

import './MeetingPage.css';

export default class MeetingPage extends React.Component {
    constructor(props) {
        super(props);

        this.OV = new OpenVidu();

        this.state = {
            session: undefined,
            publisher: undefined,
            subscribers: [],
            refs: new Map(),
        }

        this.joinSession = this.joinSession.bind(this);
        this.leaveSession = this.leaveSession.bind(this);
    }

    componentDidMount() {
        window.addEventListener('beforeunload', this.leaveSession);
        this.joinSession();
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.leaveSession);
        this.leaveSession();
    }

    joinSession() {
        console.warn('joinSession()');

        this.setState({ session: this.OV.initSession() }, () => {
            const session = this.state.session;

            session.on('streamCreated', event => {
                console.warn('Event: streamCreated');
    
                const subscriber = session.subscribe(event.stream, undefined);
                
                const subscribers = this.state.subscribers;
                subscribers.push(subscriber);
    
                const refs = this.state.refs;
                refs.set(subscriber.stream.connection.connectionId, createRef());

                this.setState({
                    subscribers: subscribers,
                    refs: refs,
                });
    
                console.log(this.state.subscribers, this.state.refs);
            });
    
            session.on('streamDestroyed', event => {
                console.warn('Event: streamDestroyed');
    
                let subscribers = this.state.subscribers;
                let index = subscribers.indexOf(event.stream.streamManager, 0);

                if (index > -1) {
                    const refs = this.state.refs;
                    refs.delete(subscribers[index].stream.connection.connectionId);

                    subscribers.splice(index, 1);
                    this.setState({
                        subscribers: subscribers,
                        refs: refs,
                    });
                }
    
                console.log(this.state.subscribers);
                console.log(this.state.refs);
            });

            session.on('publisherStartSpeaking', (event) => {
                console.log(this.state.publisher);
                console.log(this.state.subscribers);

                console.log('Publisher ' + event.connection.connectionId + ' start speaking');

                this.state.refs.get(event.connection.connectionId).current.querySelector('.speaking-indicator').classList.add('animated');
            });
            
            session.on('publisherStopSpeaking', (event) => {
                console.log('Publisher ' + event.connection.connectionId + ' stop speaking');

                this.state.refs.get(event.connection.connectionId).current.querySelector('.speaking-indicator').classList.remove('animated');
            });
    
            getToken(this.props.id).then(token => {
                session.connect(token, { username: this.props.username })
                    .then(() => {
                        let publisher = this.OV.initPublisher(undefined, {
                            audioSource: undefined,
                            videoSource: undefined,
                            publishAudio: true,
                            publishVideo: true,
                            resolution: '640x480',
                            frameRate: 30,
                            insertMode: 'APPEND',
                            mirror: true,
                        });
        
                        session.publish(publisher);
                        
                        this.setState({
                            publisher: publisher,
                        });
                    })
                    .catch(error => {
                        console.error('ERROR', error.code, error.message);
                    });
            });
        });        
    }

    leaveSession() {
        this.OV = null;

        if (this.state.session) this.state.session.disconnect();
        
        this.setState({
            session: undefined,
            publisher: undefined,
            subscribers: [],
            refs: undefined,
        }); 
    }

    render() {
        return (
            <div className="page" id="meeting">
                <div className="user-video-container">
                    { this.state.publisher ? <div ref={this.state.refs.get(this.state.publisher.stream.connection.connectionId)}><PublisherVideoComponent streamManager={ this.state.publisher } /></div> : null }
                    {
                        this.state.subscribers.map((sub, i) => {                            
                            return (
                                <div ref={this.state.refs.get(sub.stream.connection.connectionId)} key={i}>
                                    <SubscriberVideoComponent streamManager={sub} />
                                </div>
                            );
                        })
                    }
                </div>

                <ControlPanel publisher={this.state.publisher} />
            </div>
            
        );
    }
}

function ControlPanel(props) {
    let isMicroMuted = false;
    let isWebcamMuted = false;

    function toggleMicro() {
        console.warn('Micro toggled');
        isMicroMuted = !isMicroMuted;

        props.publisher.publishAudio(!isMicroMuted);
    }

    function toggleWebcam() {
        console.warn('Webcam toggled');

        isWebcamMuted = !isWebcamMuted;

        props.publisher.publishVideo(!isWebcamMuted);
    }

    return (
        <div id="control-panel">
            <MicroButton onClick={toggleMicro}/>
            <EndMeetingButton />
            <WebcamButton onClick={toggleWebcam}/>
        </div>
    );
}

function EndMeetingButton(props) {
    return (
        <Link to="/join">
            <ControlPanelButton 
                id="end-meeting-button"
                icon={
                    <svg width="24" height="9" viewBox="0 0 24 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C10.4 2 8.85 2.25 7.4 2.72V5.82C7.4 6.21 7.17 6.56 6.84 6.72C5.86 7.21 4.97 7.84 4.18 8.57C4 8.75 3.75 8.85 3.48 8.85C3.2 8.85 2.95 8.74 2.77 8.56L0.29 6.08C0.11 5.91 0 5.66 0 5.38C0 5.1 0.11 4.85 0.29 4.67C3.34 1.78 7.46 0 12 0C16.54 0 20.66 1.78 23.71 4.67C23.89 4.85 24 5.1 24 5.38C24 5.66 23.89 5.91 23.71 6.09L21.23 8.57C21.05 8.75 20.8 8.86 20.52 8.86C20.25 8.86 20 8.75 19.82 8.58C19.03 7.84 18.13 7.22 17.15 6.73C16.82 6.57 16.59 6.23 16.59 5.83V2.73C15.15 2.25 13.6 2 12 2Z" fill="#E74C3C"/>
                    </svg>
                }
            />
        </Link>
    );
}

function MicroButton(props) {
    return (
        <ControlPanelButton 
            id="microphone-button"
            onClick={props.onClick}
            mute={
                <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 9H14.3C14.3 9.74 14.14 10.43 13.87 11.05L15.1 12.28C15.66 11.3 16 10.19 16 9V9ZM11.98 9.17C11.98 9.11 12 9.06 12 9V3C12 1.34 10.66 0 9 0C7.34 0 6 1.34 6 3V3.18L11.98 9.17ZM1.27 1L0 2.27L6.01 8.28V9C6.01 10.66 7.34 12 9 12C9.22 12 9.44 11.97 9.65 11.92L11.31 13.58C10.6 13.91 9.81 14.1 9 14.1C6.24 14.1 3.7 12 3.7 9H2C2 12.41 4.72 15.23 8 15.72V19H10V15.72C10.91 15.59 11.77 15.27 12.54 14.82L16.73 19L18 17.73L1.27 1Z" fill="#808080"/>
                </svg>

            }
            unmute={
                <svg width="14" height="19" viewBox="0 0 14 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 12C8.66 12 9.99 10.66 9.99 9L10 3C10 1.34 8.66 0 7 0C5.34 0 4 1.34 4 3V9C4 10.66 5.34 12 7 12ZM12.3 9C12.3 12 9.76 14.1 7 14.1C4.24 14.1 1.7 12 1.7 9H0C0 12.41 2.72 15.23 6 15.72V19H8V15.72C11.28 15.24 14 12.42 14 9H12.3Z" fill="#808080"/>
                </svg>
            }
        />      
    );
}

function WebcamButton(props) {
    return (
        <ControlPanelButton 
            id="microphone-button"
            onClick={props.onClick}
            mute={
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 4.5L15 8.5V5C15 4.45 14.55 4 14 4H7.82L19 15.18V4.5ZM1.27 0L0 1.27L2.73 4H2C1.45 4 1 4.45 1 5V15C1 15.55 1.45 16 2 16H14C14.21 16 14.39 15.92 14.54 15.82L17.73 19L19 17.73L1.27 0Z" fill="#808080"/>
                </svg>
            }
            unmute={
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 4.5V1C14 0.45 13.55 0 13 0H1C0.45 0 0 0.45 0 1V11C0 11.55 0.45 12 1 12H13C13.55 12 14 11.55 14 11V7.5L18 11.5V0.5L14 4.5Z" fill="#808080"/>
                </svg>
            }
        />      
    );
}

function ControlPanelButton(props) {
    const button = React.createRef();
    let [isPressed, setIsPressed] = useState(false);

    function handleClick() {
        if (isPressed) {
            button.current.classList.remove('pressed');
            setIsPressed(false);
        }
        else {
            button.current.classList.add('pressed');
            setIsPressed(true);
        }

        if (props.onClick) props.onClick();
    }

    return (
        <div id={props.id} className="button" ref={button} onClick={handleClick}>
            { isPressed ? props.mute : props.unmute ? props.unmute : props.icon }
        </div>
    ); 
}

// function MicrophoneButton(props) {
//     const button = React.createRef();

//     function handleClick() {
//         if (button.current.classList.contains('pressed')) {
//             button.current.classList.remove('pressed');
//         }
//         else {
//             button.current.classList.add('pressed');
//         }
//     }

//     return (
//         <div className="button" ref={button} onClick={handleClick}>
//             <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M14 4.5V1C14 0.45 13.55 0 13 0H1C0.45 0 0 0.45 0 1V11C0 11.55 0.45 12 1 12H13C13.55 12 14 11.55 14 11V7.5L18 11.5V0.5L14 4.5Z" fill="#808080"/>
//             </svg>
//         </div>
//     );
// }


    
const OPENVIDU_SERVER_URL = 'https://127.0.0.1:4443';
const OPENVIDU_SERVER_SECRET = 'MY_SECRET';

function getToken(id) {
    return createSession(id).then((sessionId) => createToken(id));
}

function createSession(id) {
    return new Promise( async (resolve, reject) => {

        const response = await fetch(`${OPENVIDU_SERVER_URL}/openvidu/api/sessions`, {
            method: 'POST',
            headers: {
                Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + OPENVIDU_SERVER_SECRET),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ customSessionId: id }),
        });

        if (response.ok) {
            console.log('Creating session: ', response);

            const result = await response.json();

            console.log('IF 1');
            resolve(result.id);
        }
        else if (response.status === 409) {
            console.log('IF 2');
            resolve(id);
        }
        else {
                console.warn(
                    'No connection to OpenVidu Server. This may be a certificate error at ' +
                    OPENVIDU_SERVER_URL,
                );
                if (
                    window.confirm(
                        'No connection to OpenVidu Server. This may be a certificate error at "' +
                        OPENVIDU_SERVER_URL +
                        '"\n\nClick OK to navigate and accept it. ' +
                        'If no certificate warning is shown, then check that your OpenVidu Server is up and running at "' +
                        OPENVIDU_SERVER_URL +
                        '"',
                    )
                ) {
                    window.location.assign(OPENVIDU_SERVER_URL + '/accept-certificate');
                }
            }
    });
}

function createToken(id) {
    return new Promise(async (resolve, reject) => {
        const response = await fetch(`${OPENVIDU_SERVER_URL}/openvidu/api/sessions/${id}/connection`, {
            method: 'POST',
            headers: {
                Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + OPENVIDU_SERVER_SECRET),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('TOKEN', result);
            
            resolve(result.token);
        }
        else {
            reject('ERROR');
        }
    });
}