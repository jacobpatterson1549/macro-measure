import React from 'react';

import { Map } from './Map'
import { getCurrentLatLng } from './LocationUtils'
import { CondSpan } from './CondSpan';

export class Item extends React.Component {

    // props:
    // item{name,lat,lng}: the item to read/update
    // index: the index of the item being shown
    // numItems: the number of existing items
    // createStart(): function called to create a new item
    // createEnd(name, lat, lng): function called to create an item
    // updateEnd(index, name, lat, lng): function called to update an item
    // delete(index): function called to delete the item
    constructor(props) {
        super(props);
        let item
        if (!item) {
            const position = getCurrentLatLng();
            item = {
                name: '[New Item]',
                lat: position.lat,
                lng: position.lng
            };
        }
        this.setState({
            item: item,
        });
        this.createItem = this.createItem.bind(this);
    }

    createItem(event) {
        event.preventDefault();
    }

    readItem(delta) {
        this.props.read(this.props.index + delta);
    }

    updateItem(event) {
        event.preventDefault();
        this.props.updateItem(this.state.item.name, this.state.item.lat, this.state.item.lng);
    }

    deleteItem(event) {
        event.preventDefault();
        this.props.deleteItem();
    }

    getHeader() {
        return (
            <div className="Item-header">
                <button
                    disabled={this.props.index <= 0}
                    onClick={() => this.readItem(-1)}
                    title="previous item"
                >
                    <span>◀</span>
                </button>
                <CondSpan
                    cond={this.props.index < this.props.items.length}
                    onClick={() => this.props.updateStart()}
                    title="edit item"
                    value="Edit"
                />
                <CondSpan
                    cond={this.props.index < this.props.items.length}
                    onClick={() => this.props.delete()}
                    title="delete item"
                    value="Delete"
                />
                <CondSpan
                    cond={this.props.view !== 'item-create'}
                    onClick={() => this.props.createStart()}
                    title="create item"
                    value="Add"
                />
                {<span>{this.props.view === 'item-create' ? '[Add Item]' : this.props.items[this.props.index].name}</span>}
                <button
                    disabled={this.props.index >= this.props.items.length}
                    onClick={() => this.readItem(+1)}
                    title="next item"
                >
                    <span>▶</span>
                </button>
            </div>
        );
    }

    getAction() {
        return (
            <p>TODO: action div with distance in {this.props.distanceUnit}</p>
        );
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