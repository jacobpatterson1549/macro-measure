import { useState, useEffect } from 'react';

import { MapImg } from './MapImg';
import { MapForm } from './MapForm';

import { useLocalStorage } from '../hooks/LocalStorage';

import { createURL, revokeURL } from '../utils/Global';

export const Map = (props) => {
    const [file, setFile] = useState(null);
    const [fileInput, setFileInput] = useState(null);
    const [nameInput, setNameInput] = useLocalStorage(`${props.type}InputName`, '?');
    const [latNorthInput, setLatNorthInput] = useLocalStorage(`${props.type}InputLatNorth`, 0);
    const [lngEastInput, setLngEastInput] = useLocalStorage(`${props.type}InputLngEast`, 0);
    const [latSouthInput, setLatSouthInput] = useLocalStorage(`${props.type}InputLatSouth`, 0);
    const [lngWestInput, setLngWestInput] = useLocalStorage(`${props.type}InputLngWest`, 0);
    const [pixelTopInput, setPixelTopInput] = useLocalStorage(`${props.type}InputPixelTop`, 0);
    const [pixelRightInput, setPixelRightInput] = useLocalStorage(`${props.type}InputPixelRight`, 0);
    const [pixelBottomInput, setPixelBottomInput] = useLocalStorage(`${props.type}InputPixelBottom`, 0);
    const [pixelLeftInput, setPixelLeftInput] = useLocalStorage(`${props.type}InputPixelLeft`, 0);
    const [moveAmountInput, setMoveAmountInput] = useLocalStorage('moveAmountInput', 1);
    useEffect(() => {
        revokeFileURL();
        if (fileInput) {
            const url = createURL(fileInput);
            const img = new Image();
            img.onload = function() {
                const file2 = {
                    url: url,
                    width: this.width,
                    height: this.height,
                }
                setFile(file2);
            };
            img.src = url;
        }
    }, [fileInput, setFileInput, setFile]);
    useEffect(() => {
        return () => revokeFileURL(file?.url);
    }, [file]);
    useEffect(() => {
        setFile(null)
    }, [props.itemID, setFile]);
    useEffect(() => {
        if (props.item) {
            console.log(props.item);
            setFileInput(props.item.file)
            setNameInput(props.item.name);
            setLatNorthInput(props.item.latNorth);
            setLngEastInput(props.item.lngEast);
            setLatSouthInput(props.item.latSouth);
            setLngWestInput(props.item.lngWest);
            setPixelTopInput(props.item.pixelTop);
            setPixelRightInput(props.item.pixelRight);
            setPixelBottomInput(props.item.pixelBottom);
            setPixelLeftInput(props.item.pixelLeft);
        }
    }, [props.item,
        setFileInput, setNameInput,
        setLatNorthInput, setLngEastInput, setLatSouthInput, setLngWestInput,
        setPixelTopInput, setPixelRightInput, setPixelBottomInput, setPixelLeftInput,
    ]);
    const state = {
        file,
        fileInput, setFileInput,
        nameInput, setNameInput,
        latNorthInput, setLatNorthInput,
        lngEastInput, setLngEastInput,
        latSouthInput, setLatSouthInput,
        lngWestInput, setLngWestInput,
        pixelTopInput, setPixelTopInput,
        pixelRightInput, setPixelRightInput,
        pixelBottomInput, setPixelBottomInput,
        pixelLeftInput, setPixelLeftInput,
        moveAmountInput, setMoveAmountInput,
    };
    return render({ ...props, ...state });
};

const render = (props) => (
    <>
        <MapImg
            itemID={props.itemID}
            file={props.file}
            latNorth={props.latNorthInput}
            lngEast={props.lngEastInput}
            latSouth={props.latSouthInput}
            lngWest={props.lngWestInput}
            pixelTop={props.pixelTopInput}
            pixelRight={props.pixelRightInput}
            pixelBottom={props.pixelBottomInput}
            pixelLeft={props.pixelLeftInput}
        />
        <MapForm
            view={props.view}
            type={props.type}
            item={props.item}
            file={props.file}
            nameInput={props.nameInput}
            fileInput={props.fileInput}
            latNorthInput={props.latNorthInput}
            lngEastInput={props.lngEastInput}
            latSouthInput={props.latSouthInput}
            lngWestInput={props.lngWestInput}
            pixelTopInput={props.pixelTopInput}
            pixelRightInput={props.pixelRightInput}
            pixelBottomInput={props.pixelBottomInput}
            pixelLeftInput={props.pixelLeftInput}
            moveAmountInput={props.moveAmountInput}
            createEnd={props.createEnd}
            read={props.read}
            list={props.list}
            updateEnd={props.updateEnd}
            deleteEnd={props.deleteEnd}
            setNameInput={props.setNameInput}
            setFileInput={props.setFileInput}
            setLatNorthInput={props.setLatNorthInput}
            setLngEastInput={props.setLngEastInput}
            setLatSouthInput={props.setLatSouthInput}
            setLngWestInput={props.setLngWestInput}
            setPixelTopInput={props.setPixelTopInput}
            setPixelRightInput={props.setPixelRightInput}
            setPixelBottomInput={props.setPixelBottomInput}
            setPixelLeftInput={props.setPixelLeftInput}
            setMoveAmountInput={props.setMoveAmountInput}
            reloadItems={props.reloadItems}
        />
    </>
);

const revokeFileURL = (url) => { // TODO: This logic is also in storageSettings.  Move it to shared location.
    if (url) {
        revokeURL(url);
    }
};