import React from 'react';

import { Map } from './Map'
import { getCurrentLatLng } from './LocationUtils'

export class Item extends React.Component {

    // props:
    // item{name,lat,lng}: the item to read/update
    // index: the index of the item being shown
    // count: the number of existing items
    // create(name, lat, lng): function called to create an item
    // update(index, name, lat, lng): function called to update an item
    constructor(props) {
        super(props);
        let item = this.props.item;
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
            index: props.index,
            count: props.count
        });
        this.createItem = this.createItem.bind(this);
    }

    createItem(event) {
        event.preventDefault();
        // TODO
    }

    readItem(index) {
        // TODO
    }

    updateItem(event) {
        event.preventDefault();
        // TODO
    }

    deleteItem(event) {
        event.preventDefault();
        // TODO
    }

    getAction() {
        return (
            <p>TODO: action div with distance in {this.props.distanceUnit}</p>
        );
    }

    render() {
        return (
            <div>
                <Map />
                {this.getAction()}
            </div>
        );
    }
}