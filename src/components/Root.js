import './Root.css';

import { Header } from './Header';
import { Main } from './Main';

import { useLocalStorage } from '../utils/LocalStorage';
import { View } from '../utils/View';

export const Root = ({
  fullscreen,
  onLine,
  installPromptEvent,
}) => {
  const [view, setView] = useLocalStorage('view', View.Groups_Read);
  const [groupIndex, setGroupIndex] = useLocalStorage('groupIndex', 0);
  const [itemIndex, setItemIndex] = useLocalStorage('itemIndex', 0);
  const [groups, setGroups] = useLocalStorage('groups', []);
  return (
    <div className="Root">
      <Header
        view={view}
        groups={groups}
        groupIndex={groupIndex}
        setView={setView}
      />
      <Main
        fullscreen={fullscreen}
        onLine={onLine}
        installPromptEvent={installPromptEvent}
        view={view}
        setView={setView}
        groups={groups}
        setGroups={setGroups}
        groupIndex={groupIndex}
        setGroupIndex={setGroupIndex}
        itemIndex={itemIndex}
        setItemIndex={setItemIndex}
      />
    </div>
  );
};