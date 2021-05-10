import { NameList } from './NameList';

// props:
// items[]
// createStart()
// read()
// updateStart()
// delete(name)
// moveUp(name)
// moveDown(name)

export const ItemList = (props) => (
    <NameList className="ItemList"
        type="Item"
        values={props.items}
        createStart={() => props.createStart()}
        read={(index) => props.read(index)}
        updateStart={() => props.updateStart()}
        delete={(index) => props.delete(index)}
        moveUp={(index) => props.moveUp(index)}
        moveDown={(index) => props.moveDown(index)}
    />
);