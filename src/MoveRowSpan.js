import React from 'react';

function MoveRowSpan(props) {
    return props.valid
        ? <span title={props.title} onClick={props.onClick}>{props.value}</span>
        : '';
}

export default MoveRowSpan;