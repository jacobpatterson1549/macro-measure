import './Footer.css';

export const Footer = (props) => (
    <footer className="Footer">
        <div>
            <span>GPS: </span>
            <OnOffSpan
                on={props.gpsOn}
                onValue="ON"
                offValue="OFF"
            />
        </div>
        <OnOffSpan
            on={props.onLine}
            onValue="online"
            offValue="offline"
        />
    </footer >
);

const OnOffSpan = (props) => (
    <span className={onOffClassName(props)}>
        {onOffValue(props)}
    </span>
);

const onOffClassName = ({ on }) => (
    on ? 'on' : 'off'
);

const onOffValue = ({ on, onValue, offValue }) => (
    on ? onValue : offValue
);