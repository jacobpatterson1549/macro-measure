import './Footer.css';

import { useOnLine } from '../hooks/Window';

export const Footer = (props) => {
    const onLine = useOnLine();
    return (
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
                on={onLine}
                onValue="online"
                offValue="offline"
            />
        </footer >
    );
};

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