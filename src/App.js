import './App.css';
import { Groups } from './Groups';
import { Header } from './Header';
import { Settings, DefaultDistanceUnit } from './Settings';
import { About } from './About';
import { Help } from './Help';
import { NameList } from './NameList';
import { Item } from './Item';
import { useLocalStorage, clearLocalStorage } from './LocalStorage';

const DefaultView = 'groups';

export const App = () => {

  const [view, setView] = useLocalStorage('view', DefaultView);
  const [distanceUnit, setDistanceUnit] = useLocalStorage('distanceUnit', DefaultDistanceUnit);
  const [groupIndex, setGroupIndex] = useLocalStorage('groupIndex', 0);
  const [itemIndex, setItemIndex] = useLocalStorage('itemIndex', 0);
  const [groups, setGroups] = useLocalStorage('groups', []);

  const createGroupStart = (view) => {
    setView(view);
  };
  const createGroupEnd = (view, name) => {
    setView(view);
    setGroups(Groups.createGroup(groups, name));
  };
  const readGroup = (view, index) => {
    setView(view);
    setGroupIndex(index);
  };
  const updateGroupStart = (view, index) => {
    setView(view);
    setGroupIndex(index);
  };
  const updateGroupEnd = (view, index, name) => {
    setView(view);
    setGroupIndex(index);
    setGroups(Groups.updateGroup(groups, index, name));
  };
  const deleteGroupStart = (view, index) => {
    setView(view);
    setGroupIndex(index);
  };
  const deleteGroupEnd = (view, index) => {
    setView(view);
    setGroups(Groups.deleteGroup(groups, index));
  };
  const moveGroupUp = (view, index) => {
    setView(view);
    setGroups(Groups.moveGroupUp(groups, index));
  };
  const moveGroupDown = (view, index) => {
    setView(view);
    setGroups(Groups.moveGroupDown(groups, index));
  };

  const createItemStart = (view) => {
    setView(view);
    setItemIndex(groups[groupIndex].items.length);
  };
  const createItemEnd = (view, name, lat, lng) => {
    setView(view);
    setItemIndex(groups[groupIndex].items.length);
    setGroups(Groups.createItem(groups, groupIndex, name, lat, lng));
  };
  const readItem = (view, index) => {
    setView(view);
    setItemIndex(index);
  };
  const updateItemStart = (view, index) => {
    setView(view);
    setItemIndex(index);
  };
  const updateItemEnd = (view, index, name, lat, lng) => {
    setView(view);
    setItemIndex(index);
    setGroups(Groups.updateItem(groups, groupIndex, index, name, lat, lng));
  };
  const deleteItemStart = (view, index) => {
    setView(view);
    setItemIndex(index);
  };
  const deleteItemEnd = (view, index) => {
    setView(view);
    setGroups(Groups.deleteItem(groups, groupIndex, index));
  };
  const moveItemUp = (view, index) => {
    setView(view);
    setGroups(Groups.moveItemUp(groups, groupIndex, index));
  };
  const moveItemDown = (view, index) => {
    setView(view);
    setGroups(Groups.moveItemDown(groups, groupIndex, index));
  };

  const main = () => {
    switch (view) {
      case 'about':
        return (<About />);
      case 'help':
        return (<Help />);
      case 'settings':
        return (<Settings
          distanceUnit={distanceUnit}
          setDistanceUnit={setDistanceUnit}
          clearStorage={clearLocalStorage}
        />);
      default:
      case 'group-create':
      case 'groups-read':
      case 'group-update':
      case 'group-delete':
        return (
          <NameList className="GroupList"
            type="group"
            values={groups}
            index={groupIndex}
            view={view}
            createStart={() => createGroupStart('group-create')}
            createEnd={(name) => createGroupEnd('groups-read', name)}
            read={(index) => readGroup('items-read', index)}
            updateStart={(index) => updateGroupStart('group-update', index)}
            updateEnd={(index, name) => updateGroupEnd('groups-read', index, name)}
            deleteStart={(index) => deleteGroupStart('group-delete', index)}
            deleteEnd={(index) => deleteGroupEnd('groups-read', index)}
            moveUp={(index) => moveGroupUp('groups-read', index)}
            moveDown={(index) => moveGroupDown('groups-read', index)}
            cancel={() => setView('groups-read')}
          />
        );
      case 'items-read':
        return (
          <NameList className="ItemList"
            type="item"
            values={groups[groupIndex].items}
            index={itemIndex}
            view={view}
            createStart={() => createItemStart('item-create')}
            read={(index) => readItem('item-read', index)}
            updateStart={(index) => updateItemStart('item-update', index)}
            deleteStart={(index) => deleteItemStart('item-delete', index)}
            moveUp={(index) => moveItemUp('items-read', index)}
            moveDown={(index) => moveItemDown('items-read', index)}
          />
        );
      case 'item-create':
      case 'item-read':
      case 'item-update':
      case 'item-delete':
      case 'item-no-geo':
        return (<Item
          view={view}
          items={groups[groupIndex].items}
          index={itemIndex}
          distanceUnit={distanceUnit}
          createStart={() => createItemStart('item-create')}
          createEnd={(name, lat, lng) => createItemEnd('item-read', name, lat, lng)}
          read={(index) => readItem('item-read', index)}
          readItems={() => readGroup('items-read', groupIndex)}
          disableGeolocation={() => setView('item-no-geo')}
          updateStart={(index) => updateItemStart('item-update', index)}
          updateEnd={(index, name, lat, lng) => updateItemEnd('item-read', index, name, lat, lng)}
          deleteStart={(index) => deleteItemStart('item-delete', index)}
          deleteEnd={(index) => deleteItemEnd('items-read', index)}
        />);
    }
  }

  return (
    <div className="App">
      <Header
        view={view}
        groups={groups}
        groupIndex={groupIndex}
        setView={setView}
      />
      <main className="Main">
        {main()}
      </main>
    </div>
  );
};