import './Footer.css';

export const Footer = (props) => (
    <footer className="Footer">
        <span>GPS: <OnOffSpan
            on={props.gpsOn}
            onValue="ON"
            offValue="OFF"
        />
        </span>
        <OnOffSpan
            on={props.onLine}
            onValue="online"
            offValue="offline"
        />
    </footer>
);

const OnOffSpan = (props) => (
    <span className={onOffClassName(props.on)}>
        {
            props.on
                ? props.onValue
                : props.offValue
        }
    </span>
);

const onOffClassName = (value) => (
    value ? 'on' : 'off'
);