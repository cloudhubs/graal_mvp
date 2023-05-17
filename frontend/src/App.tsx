import React, { useEffect, useState, useRef } from "react";
import GraphWrapper from "./components/GraphWrapper";
import GraphMenu from "./components/GraphMenu";
import { NodeInfoBox } from "./components/NodeInfoBox";
import GraphMode from "./components/GraphModeMenu";
import { useAppContext } from "./context/AppContext";

function App() {
    const { viewSubContextMap } = useAppContext();
    const graphRef = useRef();
    const GRAPH_WIDTH: number = 735;
    const GRAPH_HEIGHT: number = 1710;


    return (

        <div className="bg-black">
                <div className="flex flex-row justify-center items-center w-full h-screen relative z-10">
                    {viewSubContextMap === false && ( 
                        <>
                            <GraphMode />
                            <GraphMenu graphRef={graphRef} />
                        </> 
                    )}
                    <GraphWrapper graphRef={graphRef} />
                    <NodeInfoBox />
          
                </div>
        </div>
    );
}

export default App;