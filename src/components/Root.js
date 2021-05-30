import './Root.css';

import { Header } from './Header';
import { Main } from './Main';

import { useLocalStorage } from '../utils/LocalStorage';
import { View } from '../utils/View';

export const Root = ({ fullscreen, onLine, installPromptEvent }) => {
  const [view, setView] = useLocalStorage('view', View.Groups_Read);
  const [groupIndex, setGroupIndex] = useLocalStorage('groupIndex', 0);
  const [itemIndex, setItemIndex] = useLocalStorage('itemIndex', 0);
  const [groups, setGroups] = useLocalStorage('groups', []);
  const props = {
    fullscreen, onLine, installPromptEvent,
    view, setView, groupIndex, setGroupIndex, itemIndex, setItemIndex, groups, setGroups,
  };
  return render(props);
};

const render = (props) => (
  <div className="Root">
    <Header
      view={props.view}
      groups={props.groups}
      groupIndex={props.groupIndex}
      setView={props.setView}
    />
    <Main
      fullscreen={props.fullscreen}
      onLine={props.onLine}
      installPromptEvent={props.installPromptEvent}
      view={props.view}
      setView={props.setView}
      groups={props.groups}
      setGroups={props.setGroups}
      groupIndex={props.groupIndex}
      setGroupIndex={props.setGroupIndex}
      itemIndex={props.itemIndex}
      setItemIndex={props.setItemIndex}
    />
  </div>
);