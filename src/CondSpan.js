export const CondSpan = (props) =>
    props.cond
        ? (<span title={props.title} onClick={props.onClick}>{props.value}</span>)
        : '';