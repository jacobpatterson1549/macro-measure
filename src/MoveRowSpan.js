export const MoveRowSpan = (props) =>
    props.valid
        ? (<span title={props.title} onClick={props.onClick}>{props.value}</span>)
        : '';