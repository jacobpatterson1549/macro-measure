import React from 'react';

import './Item.css'
import { Map } from './Map'
import { GetDistanceHeading, MoveTo, Heading } from './LocationUtils'

export class Item extends React.Component {

    // props:
    // item{name,lat,lng}: the item to read/update
    // index: the index of the item being shown
    // numItems: the number of existing items
    // createStart(): function called to create a new item
    // createEnd(name, lat, lng): function called to create an item
    // read(delta): function called to read the item at the offset from the index
    // readItems(): function called to go back to the item list
    // disableGeolocation(): a callback to indicate that the device does not support gps location
    // updateEnd(index, name, lat, lng): function called to update an item
    // delete(index): function called to delete the item
    constructor(props) {
        super(props);
        const geolocation = Item.needsLocation(props.view) && navigator.geolocation;
        const current = props.current || null;
        const item = props.view === 'item-create' ? Item.newItem(current) : props.items[props.index];
        this.state = {
            geolocation: geolocation,
            item: item,
            delta: 1, // TODO: store this in local storage
            current: current,
        };
        this.getCurrentLatLng = this.getCurrentLatLng.bind(this);
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

    static newItem = (current) => {
        const lat = current ? current.lat : 0;
        const lng = current ? current.lng : 0;
        const item = {
            name: '[New Item]',
            lat: lat,
            lng: lng,
        };
        return item;
    };

    static needsLocation = (view) => {
        return ['item-read', 'item-create'].includes(view);
    }

    startGeoTimer(force) {
        if (Item.needsLocation(this.props.view)) {
            this.stopGeoTimer();
            this.getCurrentLatLng();
            if (force || this.props.view === 'item-read') {
                this.timerID = setInterval(() => this.getCurrentLatLng(), 1000);
            }
        }
    }

    stopGeoTimer() {
        clearInterval(this.timerID);
    }

    // https://reactjs.org/docs/state-and-lifecycle.html#adding-lifecycle-methods-to-a-class
    componentDidMount() {
        this.startGeoTimer();
        if (Item.needsLocation(this.props.view) && !this.state.geolocation) {
            this.props.disableGeolocation();
        }
    }
    componentWillUnmount() {
        this.stopGeoTimer()
    }

    getCurrentLatLng() {
        if (!this.state.geolocation) {
            return;
        }
        const success = (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const latLng = { lat: latitude, lng: longitude };
            const state = {
                current: latLng,
            };
            if (this.props.view === 'item-create' && this.state.item.lat === 0 && this.state.item.lng === 0) { // TODO: hack
                // TODO: enable create Item button (disable it initially)
                state.item = Item.newItem(latLng);
            }
            this.setState(state);
        };
        const error = () => {
            this.props.disableGeolocation();
        };
        const options = {
            enableHighAccuracy: false, // TODO: allow this to be a setting
        };
        // TODO: use navigator.Geolocation.watchPosition():
        navigator.geolocation.getCurrentPosition(success, error, options);
    }

    createStart() {
        this.startGeoTimer();
        this.setState({
            item: Item.newItem(this.state.current),
        });
        this.props.createStart();
    }

    createEnd(event) {
        event.preventDefault();
        this.props.createEnd(this.state.item.name, this.state.item.lat, this.state.item.lng);
        this.startGeoTimer();
    }

    read(delta) {
        this.startGeoTimer(true); // force because view will not change until props.read() returns
        const index = this.props.index + delta;
        this.props.read(index);
    }

    updateStart() {
        this.stopGeoTimer();
        this.setState({
            item: this.props.items[this.props.index],
        });
        this.props.updateStart(this.props.index);
    }

    updateEnd(event) {
        event.preventDefault();
        this.startGeoTimer();
        this.props.updateEnd(this.props.index, this.state.item.name, this.state.item.lat, this.state.item.lng);
    }

    deleteStart() {
        this.stopGeoTimer();
        this.setState({
            item: this.props.items[this.props.index],
        });
        this.props.deleteStart(this.props.index);
    }

    deleteEnd(event) {
        event.preventDefault();
        this.startGeoTimer();
        this.props.deleteEnd(this.props.index);
    }

    getHeader() {
        return (
            <div className="Item-Header">
                <div className="row">
                    <button className="left arrow"
                        disabled={this.props.index <= 0}
                        onClick={() => this.read(-1)}
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
                        onClick={() => this.read(+1)}
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
                            disabled={this.state.current === null}
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

    updateLatLng(event, heading) {
        event.preventDefault(); // do not submit form
        const item2 = MoveTo(this.state.item, this.state.delta, this.props.distanceUnit, heading);
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
        const onClick = this.props.view === 'item-create' ? this.props.readItems : () => this.read(0);
        return (<input type="button" value="cancel" onClick={onClick} />);
    }

    getAction() {
        switch (this.props.view) {
            case "item-no-geo":
                return (
                    <span>Cannot get location</span>
                );
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
                                <input type="text" value={this.state.item ? this.state.item.name : '?'} onChange={this.updateName} onFocus={(event) => event.target.select()} />
                            </label>
                            <label>
                                <span>Latitude</span>
                                <button onClick={(event) => this.updateLatLng(event, Heading.N)}>+(N)</button>
                                <button onClick={(event) => this.updateLatLng(event, Heading.S)}>-(S)</button>
                                <input type="number" value={this.state.item ? this.state.item.lat : 0} disabled />
                            </label>
                            <label>
                                <span>Longitude</span>
                                <button onClick={(event) => this.updateLatLng(event, Heading.W)}>-(W)</button>
                                <button onClick={(event) => this.updateLatLng(event, Heading.E)}>+(E)</button>
                                <input type="number" value={this.state.item ? this.state.item.lng : 0} disabled />
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
                if (this.state.current == null) {
                    return (
                        <span>Getting location...</span>
                    )
                }
                const distanceHeading = GetDistanceHeading(this.state.item, this.state.current, this.props.distanceUnit);
                return (
                    <div className="distance">
                        <span>{distanceHeading.distance}</span>
                        <span> {this.props.distanceUnit}</span>
                    </div>
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