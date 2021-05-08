export default function MoveRowSpan(props) {
    return props.valid
        ? <span title={props.title} onClick={props.onClick}>{props.value}</span>
        : '';
}