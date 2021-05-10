import React from 'react';

import { NameTable } from './NameTable';

export class NameList extends React.Component {

    // Most all properties are required.  One one of createStart/createEnd and updateStart/updateEnd should be used.

    // props:
    // type: the display name of the type of value in the table
    // values[]: array of objects, each of which should have a 'name' attribute.  The names should be unique.
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
            view: '?',
            index: -1,
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
            this.setState({ view: 'create-form', name: '[New Value Name]' });
        }
    }

    updateStart(index) {
        if (this.props.updateStart) {
            this.props.updateStart();
        } else {
            this.setState({ view: 'update-form', index: index, name: this.props.values[index].name });
        }
    }

    deleteStart(index) {
        this.setState({ view: 'delete-form', index: index, name: this.props.values[index].name });
    }

    createEnd(event) {
        event.preventDefault();
        this.props.createEnd(this.state.name);
        this.setState({ view: "create-button" });
    }

    updateEnd(event) {
        event.preventDefault();
        this.props.updateEnd(this.state.index, this.state.name);
        this.setState({ view: "create-button" });
    }

    deleteEnd(event) {
        event.preventDefault();
        this.props.delete(this.state.index);
        this.setState({ view: "create-button" });
    }

    updateName(event) {
        const uniqueName = this.uniqueName(event.target.value);
        const nameInput = event.target;
        nameInput.setCustomValidity(uniqueName ? '' : 'duplicate name');
        this.setState({ name: event.target.value });
    }

    uniqueName(name) {
        for (let i = 0; i < this.props.values.length; i++) {
            const value = this.props.values[i]
            if (name === value.name && (this.state.view !== 'update-form' || i === this.state.index)) {
                return false;
            }
        }
        return true;
    }

    cancelButton() {
        return (<input type="button" value="cancel" onClick={() => this.setState({ view: "add-button" })} />);
    }

    getView() {
        switch (this.state.view) {
            case "create-form":
                return (
                    <form onSubmit={this.createEnd}>
                        <input type="text" value={this.state.name} required onChange={this.updateName} onFocus={(event) => event.target.select()} />
                        {this.cancelButton()}
                        <input type="submit" value={"Create " + this.props.type} />
                    </form>
                );
            case "update-form":
                return (
                    <form onSubmit={this.updateEnd}>
                        <input type="text" value={this.state.name} required onChange={this.updateName} onFocus={(event) => event.target.select()} />
                        {this.cancelButton()}
                        <input type="submit" value={"Rename " + this.props.type} />
                    </form>
                );
            case "delete-form":
                return (
                    <form onSubmit={this.deleteEnd}>
                        <span>Delete {this.state.name}?</span>
                        {this.cancelButton()}
                        <input type="submit" value={"Delete " + this.props.type} />
                    </form>
                );
            default: // "create-button"
                return (
                    <form onSubmit={this.createStart}>
                        <input type="submit" value={"Create " + this.props.type} />
                    </form>
                );
        }
    }

    render() {
        return (
            <div>
                <NameTable
                    type={this.props.type}
                    values={this.props.values}
                    read={this.props.read}
                    update={this.updateStart}
                    delete={this.deleteStart}
                    moveUp={this.props.moveUp}
                    moveDown={this.props.moveDown}
                />
                {this.getView()}
            </div>
        );
    }
}
