import './Root.css';

import { Groups } from '../utils/Groups';
import { Header } from './Header';
import { Settings } from './Settings';
import { DefaultDistanceUnit } from './GPSSettings';
import { About } from './About';
import { Help } from './Help';
import { NameList } from './NameList';
import { Item, newItem } from './Item';

import { useLocalStorage } from '../utils/LocalStorage';
import { View } from '../utils/View';

export const Root = ({
  fullscreen,
  onLine,
  installPromptEvent,
}) => {

  const [view, setView] = useLocalStorage('view', View.Groups_Read);
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
  const readGroups = () => {
    setView(View.Groups_Read);
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
  const readItems = () => {
    setView(View.Items_Read);
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
    const numItems = groups[groupIndex].items.length;
    if (numItems === 1) {
      setView(View.Items_Read);
    } else {
      if (index + 1 === numItems) {
        // read previous item if currently reading last item
        setItemIndex(index - 1);
      }
      setView(View.Item_Read);
    }
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
          fullscreen={fullscreen}
          onLine={onLine}
          installPromptEvent={installPromptEvent}
        />);
      case View.Item_Create:
      case View.Item_Read:
      case View.Item_Update:
      case View.Item_Delete:
        const items = (groups.length !== 0) ? groups[groupIndex].items : [];
        const item = (view === View.Item_Create || items.length === 0) ? newItem(null) : items[itemIndex];
        return (<Item key={itemIndex}
          view={view}
          items={items}
          index={itemIndex}
          name={item.name}
          lat={item.lat}
          lng={item.lng}
          distanceUnit={distanceUnit}
          highAccuracyGPS={highAccuracyGPS}
          createStart={createItemStart}
          createEnd={createItemEnd}
          read={readItem}
          readItems={readItems}
          updateStart={updateItemStart}
          updateEnd={updateItemEnd}
          deleteStart={deleteItemStart}
          deleteEnd={deleteItemEnd}
        />);
      case View.Items_Read:
        const values = (groups.length !== 0) ? groups[groupIndex].items : [];
        return (
          <NameList
            type="item"
            values={values}
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
          <NameList
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
            cancel={readGroups}
          />
        );
    }
  };

  return (
    <div className="Root">
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