import React from 'react';

import { NameTable } from './NameTable';

export class NameList extends React.Component {

    // props:
    // type: the display name of the type of value in the table
    // values[]: array of objects, each of which should have a 'name' attribute.  The names should be unique.
    // index: the index of the value being edited
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
            name: '?',
        };
        this.createStart = this.createStart.bind(this);
        this.createEnd = this.createEnd.bind(this);
        this.updateStart = this.updateStart.bind(this);
        this.updateEnd = this.updateEnd.bind(this);
        this.deleteStart = this.deleteStart.bind(this);
        this.deleteEnd = this.deleteEnd.bind(this);
        this.updateName = this.updateName.bind(this);
        if (this.props.cancel) {
            this.cancel = this.props.cancel.bind(this);
        }
    }

    createStart(event) {
        event.preventDefault();
        this.props.createStart();
        this.setState({
            name: '[New Value Name]',
        });
    }

    createEnd(event) {
        event.preventDefault();
        this.props.createEnd(this.state.name);
    }

    updateStart(index) {
        const name = this.props.values[index].name;
        this.setState({
            index: index,
            name: name,
        });
        this.props.updateStart(index);
    }

    updateEnd(event) {
        event.preventDefault();
        this.props.updateEnd(this.props.index, this.state.name);
    }

    deleteStart(index) {
        const name = this.props.values[index].name;
        this.setState({
            index: index,
            name: name,
        });
        this.props.deleteStart(index);
    }

    deleteEnd(event) {
        event.preventDefault();
        this.props.deleteEnd(this.props.index);
    }

    updateName(event) {
        const nameInput = event.target;
        const name = nameInput.value;
        const uniqueName = this.uniqueName(name);
        nameInput.setCustomValidity(uniqueName ? '' : 'duplicate name');
        this.setState({
            name: name,
        });
    }

    cancel() {
        this.props.cancel();
    }

    uniqueName(name) {
        for (let i = 0; i < this.props.values.length; i++) {
            const value = this.props.values[i]
            if (name === value.name && (this.props.view !== (this.props.type + '-update') || i === this.props.index)) {
                return false;
            }
        }
        return true;
    }

    cancelButton() {
        return (
            <button type="button" onClick={() => this.cancel()}>
                <span>Cancel</span>
            </button>
        );
    }

    getView() {
        switch (this.props.view) {
            case (this.props.type + "-create"):
            case (this.props.type + "-update"):
                return (
                    <form onSubmit={(this.props.view === (this.props.type + '-create') ? this.createEnd : this.updateEnd)}>
                        <fieldset>
                            <legend>
                                {(this.props.view === (this.props.type + '-create') ? 'Create ' + this.props.type : 'Update ' + this.props.values[this.props.index].name)}
                            </legend>
                            <label>
                                <span>Name:</span>
                                <input type="text" value={this.state.name} required onChange={this.updateName} onFocus={(event) => event.target.select()} />
                            </label>
                            <div>
                                {this.cancelButton()}
                                <input type="submit" value={(this.props.view === (this.props.type + '-create') ? 'Create ' : 'Update ') + this.props.type} />
                            </div>
                        </fieldset>
                    </form>
                );
            case (this.props.type + '-delete'):
                return (
                    <form onSubmit={this.deleteEnd}>
                        <fieldset>
                            <legend>Delete {this.props.values[this.props.index].name}?</legend>
                            <div>
                                {this.cancelButton()}
                                <input type="submit" value={"Delete " + this.props.type} />
                            </div>
                        </fieldset>
                    </form>
                );
            default:
            case (this.props.type + '-read'):
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
