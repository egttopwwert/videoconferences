import React, { Component } from 'react';
import './UserVideoComponent.css';

class OpenViduVideoComponent extends Component {

    constructor(props) {
        super(props);
        this.videoRef = React.createRef();
    }

    componentDidUpdate(props) {
        if (props && this.videoRef) {
            this.props.streamManager.addVideoElement(this.videoRef.current);
        }
    }

    componentDidMount() {
        if (this.props && this.videoRef) {
            this.props.streamManager.addVideoElement(this.videoRef.current);
        }
    }

    render() {
        return <video autoPlay={true} ref={this.videoRef} />;
    }

}


export function SubscriberVideoComponent(props) {

    function getUsername() {
        return JSON.parse(props.streamManager.stream.connection.data).username;
    }

    return (
        <div className="user-video-component">
            <OpenViduVideoComponent streamManager={ props.streamManager } />
            <Username username={getUsername()} />
        </div>
    );
}

export function PublisherVideoComponent(props) {
    function getUsername() {
        return JSON.parse(props.streamManager.stream.connection.data).username;
    }

    return (
        <div className="user-video-component">
            <OpenViduVideoComponent streamManager={ props.streamManager } />
            <div className="username">{ `${getUsername()} (Ви)` }</div>
        </div>
    );
}

function Username(props) {
    return (
        <div className="username">
            <SpeakingIndicator />
            <p>{ props.username }</p>
        </div>
    );
}

function SpeakingIndicator() {
    // let [timer, setTimer] = useState(null);

    // const refs = [ createRef(), createRef(), createRef() ];

    // animation();

    return (
        <div className="speaking-indicator ">
            <span></span>
            <span></span>
            <span></span>
        </div>
    );
}