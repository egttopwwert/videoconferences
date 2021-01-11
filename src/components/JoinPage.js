import React from 'react';
import { useHistory } from "react-router-dom";

import './JoinPage.css';

export default function JoinPage(props) {
    let username, id;
    
    const usernameInput = React.createRef();
    const idInput = React.createRef();

    const history = useHistory();

    function focusUsernameInput() {
        usernameInput.current.focus();
    }

    function focusIdInput() {
        idInput.current.focus();
    }

    function handleSubmit(event) {
        
        if (!usernameInput.current.value) {
            focusUsernameInput();
        }
        else if (!idInput.current.value) {
            focusIdInput();
        }
        else {
            props.updateState(username, id);
            history.replace('/meeting');
        }

        event.preventDefault();
    }

    function handleUsername(event) {
        username = event.target.value;
    }

    function handleId(event) {
        id = event.target.value;
    }

    return (
        <div className="page" id="join">
            <form onSubmit={ handleSubmit }>
                <h1>Ми раді Вас бачити!</h1>

                <label>Прізвище та ім'я</label>
                <input type="text" placeholder="Введіть Ваше прізвище та ім'я" ref={ usernameInput } onChange={ handleUsername }/>
                
                <label>Код зустрічі</label>
                <input type="text" placeholder="Введіть код зустрічі" ref={ idInput } onChange={ handleId }/>

                <button type="submit">Приєднатись</button>
            </form>
        </div>
    );
}
