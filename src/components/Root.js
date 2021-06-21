import { useEffect, useState } from 'react';

import './Root.css';

import { Groups } from './Groups';
import { Header } from './Header';
import { Main } from './Main';
import { Footer } from './Footer';

import { useLocalStorage } from '../utils/LocalStorage';
import { View } from '../utils/View';
import { readItems, GROUPS, WAYPOINTS } from '../utils/db';

export const Root = (props) => {
  const [view, setView] = useLocalStorage('view', View.Group_List);
  const [groupKey, setGroupKey] = useLocalStorage('groupKey', 0);
  const [itemKey, setItemKey] = useLocalStorage('itemKey', 0);
  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [gpsOn, setGPSOn] = useState(false);
  useEffect(() => {
    const loadFromDb = async () => {
      const dbGroups = await readItems(GROUPS);
      const dbWaypoints = dbGroups.length ? await readItems(WAYPOINTS, dbGroups[groupIndex].key) : [];
      setGroups(dbGroups);
      setItems(dbWaypoints);
      // TODO: do not render until leaded
      // TODO: load groups/items in sub-components, group name in settings
    };
    loadFromDb();
  }, [groupIndex, itemIndex, setGroups, setItems]);
  const state = {
    view, setView,
    groupIndex, setGroupIndex,
    itemIndex, setItemIndex,
    groups, setGroups,
    items, setItems,
    gpsOn, setGPSOn,
  };
  return render({ ...props, ...state });
};

const render = (props) => (
  <Groups
    groups={props.groups}
    groupIndex={props.groupIndex}
    setView={props.setView}
    setGroups={props.setGroups}
    setWaypoints={props.setItems}
    setGroupIndex={props.setGroupIndex}
    setItemIndex={props.setItemIndex}
    render={groupUtils => (
      <div className="Root">
        <Header
          view={props.view}
          setView={props.setView}
          groups={props.groups}
          groupIndex={props.groupIndex}
        />
        <Main
          fullscreen={props.fullscreen}
          onLine={props.onLine}
          installPromptEvent={props.installPromptEvent}
          view={props.view}
          groups={props.groups}
          items={props.items}
          groupIndex={props.groupIndex}
          itemIndex={props.itemIndex}
          setGPSOn={props.setGPSOn}
          // groups
          createGroupStart={groupUtils.createGroupStart}
          createGroupEnd={groupUtils.createGroupEnd}
          readGroup={groupUtils.readGroup}
          readGroupList={groupUtils.readGroupList}
          updateGroupStart={groupUtils.updateGroupStart}
          updateGroupEnd={groupUtils.updateGroupEnd}
          deleteGroupStart={groupUtils.deleteGroupStart}
          deleteGroupEnd={groupUtils.deleteGroupEnd}
          moveGroupUp={groupUtils.moveGroupUp}
          moveGroupDown={groupUtils.moveGroupDown}
          //items
          createItemStart={groupUtils.createItemStart}
          createItemEnd={groupUtils.createItemEnd}
          readItem={groupUtils.readItem}
          readItemList={groupUtils.readItemList}
          updateItemStart={groupUtils.updateItemStart}
          updateItemEnd={groupUtils.updateItemEnd}
          deleteItemStart={groupUtils.deleteItemStart}
          deleteItemEnd={groupUtils.deleteItemEnd}
          moveItemUp={groupUtils.moveItemUp}
          moveItemDown={groupUtils.moveItemDown}
        />
        <Footer
          gpsOn={props.gpsOn}
          onLine={props.onLine}
        />
      </div>
    )}
  />
);