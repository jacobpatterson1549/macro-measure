import React from 'react';

import MoveRowSpan from './MoveRowSpan';

export default class Groups extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            action: ""
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

    getItems() {
        const items = this.props.groups.map((group, index, groups) => (
            <tr key={group.name}>
                <td onClick={() => this.props.setCurrentGroup(group.name)}>{group.name}</td>
                <td><MoveRowSpan valid={index > 0} onClick={() => this.props.moveGroupUp(group.name)} title="move up" value="▲" /></td>
                <td><MoveRowSpan valid={index + 1 < groups.length} onClick={() => this.props.moveGroupDown(group.name)} title="move down" value="▼" /></td>
                <td onClick={() => this.setState({ name: group.name, action: 'rename-form', oldName: group.name })}>Edit</td>
                <td onClick={() => this.setState({ name: group.name, action: 'delete-form' })}>Delete</td>
            </tr>
        ));
        if (items.length === 0) {
            items.push(<tr key="no-groups"><td colSpan="4">No groups exist.  Create one.</td></tr>);
        }
        return items;
    }

    groupsTable() {
        return (
            <table>
                <caption>groups</caption>
                <thead>
                    <tr>
                        <th scope="col" title="name of group">Name</th>
                        <th scope="col" title="Move Group Up"></th>
                        <th scope="col" title="Move Group Down"></th>
                        <th scope="col" title="Rename group">✎</th>
                        <th scope="col" title="Delete group">␡</th>
                    </tr>
                </thead>
                <tbody>{this.getItems()}</tbody>
            </table>
        );
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
                {this.groupsTable()}
                {this.getAction()}
            </div>
        );
    }
}