import React from 'react';

class Settings extends React.Component {

    static DefaultDistanceUnit = 'm';

    static distanceUnits = [
        'm',
        'km',
        'ft',
        'yd',
        'mi'
    ];

    render() {
        const distanceUnitOptions = Settings.distanceUnits.map(unit =>
            <option key={unit}>{unit}</option>
        );
        return (
            <div>
                <h1>Macro Measure Settings</h1>
                <form>
                    <label>
                        <span>Distance Unit:</span>
                        <select value={this.props.distanceUnit} onChange={event => this.props.setDistanceUnit(event.target.value)}>
                            {distanceUnitOptions}
                        </select>
                    </label>
                    <label>
                        <span>Clear ALL Saved Data:</span>
                        <input type="button" value="Clear" onClick={this.props.clearStorage} />
                    </label>
                </form>
            </div>
        );
    }
}

export default Settings;