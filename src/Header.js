import React from 'react';

class Header extends React.Component {

    constructor(props) {
        super(props);
        this.setView = this.setView.bind(this);
    }

    setView(event) {
        event.preventDefault()
        this.props.setView("groups")
    }

    headerItem(name, title, view) {
        return <span onClick={() => this.props.setView(view)} title={title}>{name}</span>
    }

    render() {
        const groupListName = !['items', 'map'].includes(this.props.view) ? '[Groups]' : this.props.currentGroup || '[Add Group]';
        return (
            <header className="Header">
                <a href="/" onClick={this.setView} title="group list">{groupListName}</a>
                {this.headerItem('ⓘ', 'about page', 'about')}
                {this.headerItem('?', 'help page', 'help')}
                {this.headerItem('⚙', 'edit settings', 'settings')}
            </header>
        );
    }
}

export default Header;