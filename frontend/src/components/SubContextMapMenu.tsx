import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import GraphButton from "./GraphButton"
import SubContextMap from "./SubContextMap";
// type Props = {
//     graphRef: any;
// };
const SubContextMapMenu: React.FC = ({
    // graphRef,
}) => {
    const {subContextNodes, viewSubContextMap, setStateVar, contextMap} = useAppContext();
    const [displayNodes, setDisplayNodes] = useState(Array.from(subContextNodes.values()));
    const setSubContextNodes = (val: Map<String, Node>) => setStateVar && setStateVar("subContextNodes", val);
    const setViewSubContextMap = (val: boolean) => setStateVar && setStateVar("viewSubContextMap", val);

    let uniqueKeyVal = 0;

    useEffect(() => {
        setDisplayNodes(Array.from(subContextNodes.values()));
    }, [subContextNodes]);

    //remove the selected item if clicked on in list
    function handleNodeInMenuClick(e:any){
        if (subContextNodes.has(e.target.innerText)){
            subContextNodes.delete(e.target.innerText);
            const updatedSubContextNodes = new Map(subContextNodes);
            setSubContextNodes(updatedSubContextNodes);
        }        
    }

    function handleViewClick(e:any){
        console.log("view clicked");   
        setViewSubContextMap(!viewSubContextMap);
    }

    return (
        <div className="flex flex-col items-center bg-blue-100 rounded-lg bg-opacity-60">
            <p className= "font-semibold underline">Sub Context Nodes</p>
            <ul className= "list-disc mb-2">
                {displayNodes.map((node)=>{
                    uniqueKeyVal+=1;
                    return (
                        <li key= {uniqueKeyVal}>
                            <button className="hover:opacity-50 hover:line-through" onClick={handleNodeInMenuClick}>{node.nodeName}</button>
                        </li>
                    )
                })}
            </ul>
            <GraphButton onClick={handleViewClick}>View</GraphButton>
            {/* {viewSubContextMap && (
            <SubContextMap contextMap={contextMap} graphRef={graphRef} />
      )} */}
        </div>
    );
};
export default SubContextMapMenu;
