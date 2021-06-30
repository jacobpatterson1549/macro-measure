import { useState } from 'react';

import './Root.css';

import { Header } from './Header';
import { Main } from './Main';
import { Footer } from './Footer';

import { useLocalStorage } from '../utils/LocalStorage';
import { View } from '../utils/View';

export const Root = (props) => {
  const [view, setView] = useLocalStorage('view', View.Group_List);
  const [gpsOn, setGPSOn] = useState(false);
  const [groupID, setGroupID] = useLocalStorage('groupID', 0);
  const [waypointID, setWaypointID] = useLocalStorage('waypointID', 0);
  const state = {
    view, setView,
    groupID, setGroupID,
    waypointID, setWaypointID,
    gpsOn, setGPSOn,
  };
  return render({ ...props, ...state });
};

const render = (props) => (
  <div className="Root">
    <Header
      view={props.view}
      groupID={props.groupID}
      setView={props.setView}
    />
    <Main
      fullscreen={props.fullscreen}
      onLine={props.onLine}
      installPromptEvent={props.installPromptEvent}
      view={props.view}
      groupID={props.groupID}
      waypointID={props.waypointID}
      setView={props.setView}
      setGPSOn={props.setGPSOn}
      setGroupID={props.setGroupID}
      setWaypointID={props.setWaypointID}
    />
    <Footer
      gpsOn={props.gpsOn}
      onLine={props.onLine}
    />
  </div>
);