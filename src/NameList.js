import React from 'react';

import { NameTable } from './NameTable';

export default class NameList extends React.Component {

    // Most all properties are required.  One one of createStart/createEnd and updateStart/updateEnd should be used.

    // props:
    // values[]: array of objects, each of which should have a 'name' attrtibute.  The names should be unique.
    // moveUp(value): function to decrease the index of the value
    // moveDown(value): function to increase the index of the value
    // createStart(): function to begin creating a value, called when the add button is clicked
    // createEnd(name): function called by the inner form to finish creating a value
    // read(value): function that is called when a value's name is clicked
    // updateStart(value): function to begin updating a value, called when the edit button is clicked for a value
    // updateEnd(oldValue, name): function to finish updating a value, changing the name
    // delete(value): function to delete a value

    constructor(props) {
        super(props);
        this.state = {
            action: '?',
            value: {},
            name: '?'
        };
        this.createStart = this.createStart.bind(this);
        this.createEnd = this.createEnd.bind(this);
        this.updateStart = this.updateStart.bind(this);
        this.updateEnd = this.updateEnd.bind(this);
        this.deleteStart = this.deleteStart.bind(this);
        this.deleteEnd = this.deleteEnd.bind(this);
        this.updateName = this.updateName.bind(this);
    }

    createStart(event) {
        event.preventDefault();
        if (this.props.createStart) {
            this.props.createStart();
        } else {
            this.setState({ action: 'create-form', name: '[New Value Name]' });
        }
    }

    updateStart(value) {
        if (this.props.updateStart) {
            this.props.updateStart();
        } else {
            this.setState({ action: 'update-form', value: value, name: value.name });
        }
    }

    deleteStart(value) {
        this.setState({ action: 'delete-form', value: value });
    }

    createEnd(event) {
        event.preventDefault();
        this.props.createEnd(this.state.name);
        this.setState({ action: "create-button" });
    }

    updateEnd(event) {
        event.preventDefault();
        this.props.updateEnd(this.state.value, this.state.name);
        this.setState({ action: "create-button" });
    }

    deleteEnd(event) {
        event.preventDefault();
        this.props.delete(this.state.value);
        this.setState({ action: "create-button" });
    }

    updateName(event) {
        const uniqueName = this.uniqueName(event.target.value);
        const nameInput = event.target;
        nameInput.setCustomValidity(uniqueName ? '' : 'duplicate name');
        this.setState({ name: event.target.value });
    }

    uniqueName(name) {
        for (const value of this.props.values) {
            const existingName = value.name;
            if (existingName === name && (this.state.action !== 'update-form' || name !== this.state.oldName)) {
                return false;
            }
        }
        return true;
    }

    cancelButton() {
        return (<input type="button" value="cancel" onClick={() => this.setState({ action: "add-button" })} />);
    }

    getAction() {
        switch (this.state.action) {
            case "create-form":
                return (
                    <form onSubmit={this.createEnd}>
                        <input type="text" value={this.state.name} required onChange={this.updateName} onFocus={(event) => event.target.select()} />
                        {this.cancelButton()}
                        <input type="submit" />
                    </form>
                );
            case "update-form":
                return (
                    <form onSubmit={this.updateEnd}>
                        <input type="text" value={this.state.name} required onChange={this.updateName} onFocus={(event) => event.target.select()} />
                        {this.cancelButton()}
                        <input type="submit" />
                    </form>
                );
            case "delete-form":
                return (
                    <form onSubmit={this.deleteEnd}>
                        <span>Delete {this.state.value.name}?</span>
                        {this.cancelButton()}
                        <input type="submit" />
                    </form>
                );
            default: // "create-button"
                return (
                    <form onSubmit={this.createStart}>
                        <input type="submit" value="Create Value" />
                    </form>
                );
        }
    }

    render() {
        return (
            <div>
                <NameTable
                    values={this.props.values}
                    read={this.props.read}
                    update={this.updateStart}
                    delete={this.deleteStart}
                    moveUp={this.props.moveUp}
                    moveDown={this.props.moveDown}
                />
                {this.getAction()}
            </div>
        );
    }
}
