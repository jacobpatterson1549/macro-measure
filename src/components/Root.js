import { useState } from 'react';

import './Root.css';

import { Groups } from './Groups';
import { Header } from './Header';
import { Main } from './Main';
import { Footer } from './Footer';

import { useLocalStorage } from '../utils/LocalStorage';
import { View } from '../utils/View';

export const Root = (props) => {
  const [view, setView] = useLocalStorage('view', View.Group_Read_List);
  const [groups, setGroups] = useLocalStorage('groups', []);
  const [groupIndex, setGroupIndex] = useLocalStorage('groupIndex', 0);
  const [itemIndex, setItemIndex] = useLocalStorage('itemIndex', 0);
  const [gpsOn, setGPSOn] = useState('gpsOn', false);
  return render({ ...props, view, setView, groups, setGroups, groupIndex, setGroupIndex, itemIndex, setItemIndex, gpsOn, setGPSOn });
};

const render = (props) => (
  <Groups
    groups={props.groups}
    groupIndex={props.groupIndex}
    setView={props.setView}
    setGroups={props.setGroups}
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