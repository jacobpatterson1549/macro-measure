import React from 'react';

import NameTable from './NameTable';

export default class Groups extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            action: ''
        };

        this.setName = this.setName.bind(this);
        this.createGroup = this.createGroup.bind(this);
        this.renameGroup = this.renameGroup.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
    }


    createGroup(event) {
        event.preventDefault();
        this.props.createGroup(this.state.name);
        this.setState({ action: "add-button" });
    }

    renameGroup(event) {
        event.preventDefault();
        this.props.renameGroup(this.state.oldName, this.state.name);
        this.setState({ action: "add-button" });
    }

    deleteGroup(event) {
        event.preventDefault();
        this.props.deleteGroup(this.state.name);
        this.setState({ action: "add-button" });
    }

    setName(event) {
        const uniqueName = this.uniqueName(event.target.value);
        const nameInput = event.target;
        nameInput.setCustomValidity(uniqueName ? '' : 'duplicate name');
        this.setState({ name: event.target.value });
    }

    uniqueName(name) {
        for (const group of this.props.groups) {
            const existingName = group.name;
            if (existingName === name && (this.state.action !== 'rename-form' || name !== this.state.oldName)) {
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
            case "add-form":
                return (
                    <form onSubmit={this.createGroup}>
                        <input type="text" value={this.state.name} required onChange={this.setName} onFocus={(event) => event.target.select()} />
                        {this.cancelButton()}
                        <input type="submit" />
                    </form>
                );
            case "rename-form":
                return (
                    <form onSubmit={this.renameGroup}>
                        <input type="text" value={this.state.name} required onChange={this.setName} onFocus={(event) => event.target.select()} />
                        {this.cancelButton()}
                        <input type="submit" />
                    </form>
                );
            case "delete-form":
                return (
                    <form onSubmit={this.deleteGroup}>
                        <span>Delete {this.state.name}?</span>
                        {this.cancelButton()}
                        <input type="submit" />
                    </form>
                );
            default:
                return (
                    <input type="button" value="Add Group" onClick={() => this.setState({ name: '[New Group Name]', action: 'add-form' })} onFocus={(event) => event.target.select()} />
                );
        }
    }

    render() {
        return (
            <div className="Groups">
                <NameTable
                    values={this.props.groups}
                    select={(group) => this.props.setCurrentGroup(group.name)}
                    moveUp={(group) => this.props.moveGroupUp(group.name)}
                    moveDown={(group) => this.props.moveGroupDown(group.name)}
                    edit={(group) => this.setState({ name: group.name, action: 'rename-form', oldName: group.name })}
                    delete={(group) => this.setState({ name: group.name, action: 'delete-form' })}
                />
                {this.getAction()}
            </div>
        );
    }
}