import React from 'react';

function MoveRowSpan(props) {
    return (
        <div>
            {
                props.valid
                    ? <span title={props.title} onClick={props.onClick}>{props.value}</span>
                    : ''
            }
        </div>
    );
}

export default MoveRowSpan;