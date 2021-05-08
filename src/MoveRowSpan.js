import React from 'react';

class MoveRowSpan extends React.Component {
    render() {
        let span;
        if (this.props.valid) {
            span = (<span title={this.props.title} onClick={this.props.onClick}>{this.props.value}</span>);
        }
        return (<div>{span}</div>);
    }
}

export default MoveRowSpan;