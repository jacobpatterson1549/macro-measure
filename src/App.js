import './App.css';
import { Groups } from './Groups';
import { Header } from './Header';
import { Settings, DefaultDistanceUnit } from './Settings';
import { About } from './About';
import { Help } from './Help';
import { NameList } from './NameList';
import { Item } from './Item';
import { useLocalStorage, clearLocalStorage } from './LocalStorage';
import { View } from './View';

const DefaultView = 'groups';

export const App = () => {

  const [view, setView] = useLocalStorage('view', DefaultView);
  const [distanceUnit, setDistanceUnit] = useLocalStorage('distanceUnit', DefaultDistanceUnit);
  const [highAccuracyGPS, setHighAccuracyGPS] = useLocalStorage('highAccuracyGPS', false);
  const [groupIndex, setGroupIndex] = useLocalStorage('groupIndex', 0);
  const [itemIndex, setItemIndex] = useLocalStorage('itemIndex', 0);
  const [groups, setGroups] = useLocalStorage('groups', []);

  const createGroupStart = () => {
    setView(View.Group_Create);
  };
  const createGroupEnd = (name) => {
    setView(View.Groups_Read);
    setGroups(Groups.createGroup(groups, name));
  };
  const readGroup = (index) => {
    setView(View.Items_Read);
    setGroupIndex(index);
  };
  const updateGroupStart = (index) => {
    setView(View.Group_Update);
    setGroupIndex(index);
  };
  const updateGroupEnd = (index, name) => {
    setView(View.Groups_Read);
    setGroups(Groups.updateGroup(groups, index, name));
  };
  const deleteGroupStart = (index) => {
    setView(View.Group_Delete);
    setGroupIndex(index);
  };
  const deleteGroupEnd = (index) => {
    setView(View.Groups_Read);
    setGroups(Groups.deleteGroup(groups, index));
  };
  const moveGroupUp = (index) => {
    setView(View.Groups_Read);
    setGroups(Groups.moveGroupUp(groups, index));
  };
  const moveGroupDown = (index) => {
    setView(View.Groups_Read);
    setGroups(Groups.moveGroupDown(groups, index));
  };

  const createItemStart = () => {
    setView(View.Item_Create);
    setItemIndex(groups[groupIndex].items.length);
  };
  const createItemEnd = (name, lat, lng) => {
    setView(View.Item_Read);
    setGroups(Groups.createItem(groups, groupIndex, name, lat, lng));
  };
  const readItem = (index) => {
    setView(View.Item_Read);
    setItemIndex(index);
  };
  const updateItemStart = (index) => {
    setView(View.Item_Update);
    setItemIndex(index);
  };
  const updateItemEnd = (index, name, lat, lng) => {
    setView(View.Item_Read);
    setGroups(Groups.updateItem(groups, groupIndex, index, name, lat, lng));
  };
  const deleteItemStart = (index) => {
    setView(View.Item_Delete);
    setItemIndex(index);
  };
  const deleteItemEnd = (index) => {
    setView(View.Items_Read); // TODO: read to previous or next group
    setGroups(Groups.deleteItem(groups, groupIndex, index));
  };
  const moveItemUp = (index) => {
    setView(View.Items_Read);
    setGroups(Groups.moveItemUp(groups, groupIndex, index));
  };
  const moveItemDown = (index) => {
    setView(View.Items_Read);
    setGroups(Groups.moveItemDown(groups, groupIndex, index));
  };

  const main = () => {
    switch (view) {
      case View.About:
        return (<About />);
      case View.Help:
        return (<Help />);
      case View.Settings:
        return (<Settings
          distanceUnit={distanceUnit}
          setDistanceUnit={setDistanceUnit}
          highAccuracyGPS={highAccuracyGPS}
          setHighAccuracyGPS={setHighAccuracyGPS}
          clearStorage={clearLocalStorage}
        />);
      case View.Item_Create:
      case View.Item_Read:
      case View.Item_Update:
      case View.Item_Delete:
      case View.Item_No_Geolocation:
        return (<Item
          view={view}
          items={groups[groupIndex].items}
          index={itemIndex}
          distanceUnit={distanceUnit}
          highAccuracyGPS={highAccuracyGPS}
          createStart={createItemStart}
          createEnd={createItemEnd}
          read={readItem}
          readItems={() => setView(View.Items_Read)}
          disableGeolocation={() => setView(View.Item_No_Geolocation)}
          updateStart={updateItemStart}
          updateEnd={updateItemEnd}
          deleteStart={deleteItemStart}
          deleteEnd={deleteItemEnd}
        />);
      case View.Items_Read:
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
      case View.Group_Create:
      case View.Group_Update:
      case View.Group_Delete:
      case View.Groups_Read:
      default:
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
            cancel={() => setView(View.Groups_Read)}
          />
        );
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