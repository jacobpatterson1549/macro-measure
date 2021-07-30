
import { Fieldset, Label, ButtonInput } from './Form';

import { View } from '../utils/View';

export const MapSettings = (props) => (
    <Fieldset caption="Map Settings">
        <Label caption="Update maps for waypoints">
            <ButtonInput
                value="Maps"
                onClick={handleViewMapList(props)}
            />
        </Label>
    </Fieldset>
);

const handleViewMapList = ({ setView }) => () => {
    setView(View.Map_List);
};