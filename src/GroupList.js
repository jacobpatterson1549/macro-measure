import NameList from './NameList';

export const GroupList = props => (
    <NameList className="Groups"
        values={props.groups}
        createEnd={(name) => props.createGroup(name)}
        read={(group) => props.readGroup(group.name)}
        updateEnd={(group, name) => props.updateGroup(group.name, name)}
        delete={(group) => props.deleteGroup(group.name)}
        moveUp={(group) => props.moveGroupUp(group.name)}
        moveDown={(group) => props.moveGroupDown(group.name)}
    />
);