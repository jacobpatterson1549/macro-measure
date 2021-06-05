import './Footer.css';

export const Footer = ({ gpsOn, onLine }) => (
    <footer className="Footer">
        <span>GPS: <OnOffSpan
            on={gpsOn}
            onValue="ON"
            offValue="OFF"
        />
        </span>
        <OnOffSpan
            on={onLine}
            onValue="online"
            offValue="offline"
        />
    </footer>
);

const OnOffSpan = ({ on, onValue, offValue }) => (
    <span className={onOffClassName(on)}>
        {
            on
                ? onValue
                : offValue
        }
    </span>
);

const onOffClassName = (value) => (
    value ? 'on' : 'off'
);