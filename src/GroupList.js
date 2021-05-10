import { NameList } from './NameList';

export const GroupList = (props) => (
    <NameList className="GroupList"
        type="Group"
        values={props.groups}
        createEnd={(name) => props.create(name)}
        read={(index) => props.read(index)}
        updateEnd={(index, name) => props.update(index, name)}
        delete={(index) => props.delete(index)}
        moveUp={(index) => props.moveUp(index)}
        moveDown={(index) => props.moveDown(index)}
    />
);