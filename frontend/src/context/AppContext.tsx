import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import communicationData from '../data/communicationGraph.json'
import contextData from '../data/contextMap.json'

export enum ViewMode{
  ContextMap = 1,
  CommGraph,
  AntiPattern,
}

interface AppContextType {
  graphData: typeof communicationData;
  contextMap: typeof contextData,
  search: string,
  selectedSearchValue: string,
  sliderValue: number,
  initCoords: any,
  initRotation: any,
  highCoupling: boolean,
  viewSubContextMap: boolean,
  viewMode: ViewMode,
  subContextNodes: Map<String, Node>,
  showCodeCoverage: boolean,
  codeCoveragePossible: boolean,
  setStateVar?: (field: keyof AppContextType, value: any) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppPageContext({ children }: any) {
  const [state, setState] = useState({
    graphData: communicationData,
    contextMap: contextData,
    search: "",
    selectedSearchValue: "",
    sliderValue: 8,
    initCoords: null,
    initRotation: null,
    highCoupling: false,
    viewSubContextMap: false,
    viewMode: ViewMode.CommGraph,
    subContextNodes: new Map<String, Node>(),
    codeCoveragePossible: false,
    showCodeCoverage: false,
  });
  const setStateVar = (field: keyof AppContextType, value: any) => {
    setState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };  
  const appContextValue = useMemo(() => ({...state, setStateVar}), [state]);

  // useEffect(()=>{
  //   console.log("sub been updated = ", state.subContextNodes);
  // }, [state.subContextNodes]);


  return (
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
      
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("context is undefined");
  }
  return context;
}