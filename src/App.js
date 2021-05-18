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

  const createGroupStart = () => {
    setView('groups-create');
  };
  const createGroupEnd = (name) => {
    setView('groups-read');
    setGroups(Groups.createGroup(groups, name));
  };
  const readGroup = (index) => {
    setView('items-read');
    setGroupIndex(index);
  };
  const updateGroupStart = (index) => {
    setView('group-update');
    setGroupIndex(index);
  };
  const updateGroupEnd = (index, name) => {
    setView('groups-read');
    setGroups(Groups.updateGroup(groups, index, name));
  };
  const deleteGroupStart = (index) => {
    setView('group-delete');
    setGroupIndex(index);
  };
  const deleteGroupEnd = (index) => {
    setView('groups-read');
    setGroups(Groups.deleteGroup(groups, index));
  };
  const moveGroupUp = (index) => {
    setView('groups-read');
    setGroups(Groups.moveGroupUp(groups, index));
  };
  const moveGroupDown = (index) => {
    setView('groups-read');
    setGroups(Groups.moveGroupDown(groups, index));
  };

  const createItemStart = () => {
    setView('item-create');
    setItemIndex(groups[groupIndex].items.length);
  };
  const createItemEnd = (name, lat, lng) => {
    setView('item-read');
    setGroups(Groups.createItem(groups, groupIndex, name, lat, lng));
  };
  const readItem = (index) => {
    setView('item-read');
    setItemIndex(index);
  };
  const updateItemStart = (index) => {
    setView('item-update');
    setItemIndex(index);
  };
  const updateItemEnd = (index, name, lat, lng) => {
    setView('item-read');
    setGroups(Groups.updateItem(groups, groupIndex, index, name, lat, lng));
  };
  const deleteItemStart = (index) => {
    setView('item-delete');
    setItemIndex(index);
  };
  const deleteItemEnd = (index) => {
    setView('items-read');
    setGroups(Groups.deleteItem(groups, groupIndex, index));
  };
  const moveItemUp = (index) => {
    setView('items-read');
    setGroups(Groups.moveItemUp(groups, groupIndex, index));
  };
  const moveItemDown = (index) => {
    setView('items-read');
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
            createStart={createGroupStart}
            createEnd={createGroupEnd}
            read={readGroup}
            updateStart={updateGroupStart}
            updateEnd={updateGroupEnd}
            deleteStart={deleteGroupStart}
            deleteEnd={deleteGroupEnd}
            moveUp={moveGroupUp}
            moveDown={moveGroupDown}
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
            createStart={createItemStart}
            read={readItem}
            updateStart={updateItemStart}
            deleteStart={deleteItemStart}
            moveUp={moveItemUp}
            moveDown={moveItemDown}
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
          createStart={createItemStart}
          createEnd={createItemEnd}
          read={readItem}
          readItems={() => setView('items-read')}
          disableGeolocation={() => setView('item-no-geo')}
          updateStart={updateItemStart}
          updateEnd={updateItemEnd}
          deleteStart={deleteItemStart}
          deleteEnd={deleteItemEnd}
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