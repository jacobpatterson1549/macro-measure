import { Label, NumberInput } from './Form';

export const MapCoordinatePixel = (props) => {
    return (
        <>
            <Label caption={props.coordinateName}>
                <NumberInput
                    value={props.coordinateValue}
                    min={props.coordinateMin}
                    max={props.coordinateMax}
                    onChange={props.setCoordinate}
                    validateFn={props.validateCoordinate}
                    invalidMessage="must valid latitude/longitude and not overlap the opposite side"
                />
            </Label>
            <Label caption={props.pixelName}>
                <NumberInput
                    value={props.pixelValue}
                    min={props.pixelMin}
                    max={props.pixelMax}
                    onChange={props.setPixel}
                    validateFn={props.validatePixel}
                    invalidMessage="must valid pixel and not overlap the opposite side"
                />
            </Label>
        </>
    );
};