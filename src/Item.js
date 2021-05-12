import React from 'react';

import './Item.css'
import { Map } from './Map'
import { GetCurrentLatLng, UpdateLatLng } from './LocationUtils'

export class Item extends React.Component {

    // props:
    // item{name,lat,lng}: the item to read/update
    // index: the index of the item being shown
    // numItems: the number of existing items
    // createStart(): function called to create a new item
    // createEnd(name, lat, lng): function called to create an item
    // read(index): function called to read the item at index
    // readItems(): function called to go back to the item list
    // updateEnd(index, name, lat, lng): function called to update an item
    // delete(index): function called to delete the item
    constructor(props) {
        super(props);
        const item = (props.index >= 0 && props.index < props.items.length)
            ? props.items[props.index]
            : this.newItem();
        this.state = {
            item: item,
            delta: 1 // TODO: store this in local storage
        };
        this.createStart = this.createStart.bind(this);
        this.createEnd = this.createEnd.bind(this);
        this.updateStart = this.updateStart.bind(this);
        this.updateEnd = this.updateEnd.bind(this);
        this.deleteStart = this.deleteStart.bind(this);
        this.deleteEnd = this.deleteEnd.bind(this);
        this.updateName = this.updateName.bind(this);
        this.updateLatLng = this.updateLatLng.bind(this);
        this.updateDelta = this.updateDelta.bind(this);
    }

    newItem() {
        const position = GetCurrentLatLng();
        const item = {
            name: '[New Item]',
            lat: position.lat,
            lng: position.lng
        };
        return item;
    }

    createStart() {
        this.setState({
            item: this.newItem(),
        });
        this.props.createStart();
    }

    createEnd(event) {
        event.preventDefault();
        this.props.createEnd(this.state.item.name, this.state.item.lat, this.state.item.lng);
    }

    readItem(delta) {
        const index = this.props.index + delta;
        this.props.read(index);
    }

    updateStart() {
        this.setState({
            item: this.props.items[this.props.index],
        });
        this.props.updateStart(this.props.index);
    }

    updateEnd(event) {
        event.preventDefault();
        this.props.updateEnd(this.props.index, this.state.item.name, this.state.item.lat, this.state.item.lng);
    }

    deleteStart() {
        this.setState({
            item: this.props.items[this.props.index],
        });
        this.props.deleteStart(this.props.index);
    }

    deleteEnd(event) {
        event.preventDefault();
        this.props.deleteEnd(this.props.index);
    }

    getHeader() {
        return (
            <div className="Item-Header">
                <div className="row">
                    <button className="left arrow"
                        disabled={this.props.index <= 0}
                        onClick={() => this.readItem(-1)}
                        title="previous item"
                    >
                        <span>◀</span>
                    </button>
                    <button onClick={() => this.props.readItems()} title="items list" className="name">
                        <span>
                            {
                                this.props.view === 'item-create'
                                    ? '[Add Item]'
                                    : this.props.index >= 0 && this.props.index < this.props.items.length
                                        ? this.props.items[this.props.index].name
                                        : '?'
                            }
                        </span>
                    </button>
                    <button className="right arrow"
                        disabled={this.props.index + 1 >= this.props.items.length}
                        onClick={() => this.readItem(+1)}
                        title="next item"
                    >
                        <span>▶</span>
                    </button>
                </div>
                {
                    this.props.view === 'item-read' &&
                    <div className="row">
                        <button
                            onClick={() => this.updateStart()}
                            title="edit item"
                        >
                            <span>Edit...</span>
                        </button>
                        <button
                            onClick={() => this.deleteStart()}
                            title="delete item"
                        >
                            <span>Delete...</span>
                        </button>
                        <button
                            onClick={() => this.createStart()}
                            title="create item"
                        >
                            <span>Add...</span>
                        </button>
                    </div>
                }
            </div>
        );
    }


    // TODO: much of this is duplicated in NameTable.js
    updateName(event) {
        const name = event.target.value;
        const uniqueName = this.uniqueName(name);
        const nameInput = event.target;
        const item = Object.assign({}, this.state.item, { name: name })
        nameInput.setCustomValidity(uniqueName ? '' : 'duplicate name');
        this.setState({ item: item });
    }

    updateLatLng(lat, lng) {
        const item2 = UpdateLatLng(this.state.item, lat, lng, this.state.delta)
        const item3 = Object.assign({}, this.state.item, item2); // overwrite lat and lng with item2
        this.setState({ item: item3 });
    }

    updateDelta(event) {
        const delta = event.target.value;
        this.setState({ delta: delta });
    }

    uniqueName(name) {
        for (let i = 0; i < this.props.items.length; i++) {
            const item = this.props.items[i]
            if (name === item.name && (this.props.view !== 'item-update' || i === this.props.index)) {
                return false;
            }
        }
        return true;
    }

    cancelButton() {
        const onClick = this.props.view === 'item-create' ? this.props.readItems : () => this.props.read(this.props.index);
        return (<input type="button" value="cancel" onClick={onClick} />);
    }

    getAction() {
        switch (this.props.view) {
            case "item-create":
            case "item-update":
                return (
                    <form onSubmit={(this.props.view === 'item-create' ? this.createEnd : this.updateEnd)}>
                        <fieldset>
                            <legend>
                                {(this.props.view === 'item-create' ? 'Create Item' : 'Update ' + this.props.items[this.props.index].name)}
                            </legend>
                            <label>
                                <span>Name</span>
                                <input type="text" value={this.state.item.name} onChange={this.updateName} onFocus={(event) => event.target.select()} />
                            </label>
                            <label>
                                <span>Latitude</span>
                                <button onClick={() => this.updateLatLng(+1, 0)}>+(N)</button>
                                <button onClick={() => this.updateLatLng(-1, 0)}>-(S)</button>
                                <input type="number" value={this.state.item.lat} disabled />
                            </label>
                            <label>
                                <span>Longitude</span>
                                <button onClick={() => this.updateLatLng(0, -1)}>-(W)</button>
                                <button onClick={() => this.updateLatLng(0, +1)}>+(E)</button>
                                <input type="number" value={this.state.item.lng} disabled />
                            </label>
                            <label>
                                <span>Move Amount ({this.props.distanceUnit})</span>
                                <input type="number" value={this.state.delta} onChange={this.updateDelta} min="0" max="1000" onFocus={(event) => event.target.select()} />
                            </label>
                            <div>
                                {this.cancelButton()}
                                <input type="submit" value={this.props.view === 'item-create' ? 'Create Item' : 'Update Item'} />
                            </div>
                        </fieldset>
                    </form>
                );
            case "item-delete":
                return (
                    <form onSubmit={this.deleteEnd}>
                        <fieldset>
                            <legend>Delete {this.state.item.name}</legend>
                            <div>
                                {this.cancelButton()}
                                <input type="submit" value={"Delete " + this.props.type} />
                            </div>
                        </fieldset>
                    </form>
                );
            default:
            case "item-read":
                return (
                    <p>TODO: show distance to [{this.state.item.lat},{this.state.item.lng}]</p>
                );
        }
    }

    render() {
        return (
            <div className="Item">
                {this.getHeader()}
                <Map />
                {this.getAction()}
            </div>
        );
    }
}