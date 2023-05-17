import { useEffect, useCallback, useState } from "react";
import { getNeighbors } from "../utils/GraphFunctions";
import { useAppContext } from "../context/AppContext";
import React from "react";

export const useInfoBox = () => {

    const { graphData, selectedSearchValue, setStateVar } = useAppContext();

    const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
    const [show, setShow] = useState(false);
    const [name, setName] = useState();
    const [type, setType] = useState();
    const [dependents, setDependents] = useState();
    const [dependencies, setDependencies] = useState();

    const handleClick = useCallback(
        (event: any) => {
            setAnchorPoint({ x: event.pageX, y: event.pageY });
            setName(event.detail.node.nodeName);
            setType(event.detail.node.nodeType);
            console.log("handleClick data = ", graphData);
            let neighbors = getNeighbors(
                event.detail.node,
                graphData.links
            );
            let idNum = 0;
            let dependencies = getDependencies(neighbors, idNum);
            let dependents = getDependents(neighbors, dependencies.idNum);
            // console.log("dependencies = ", dependencies);
            // console.log("dependents = ", dependents);
            setDependencies(dependencies.dependencyList == undefined? <li key={"dependencyListEmpty"}>{"none"}</li> : dependencies.dependencyList);
            setDependents( dependents.dependentList.length == undefined? <li key={"dependentListEmpty"}>{"none"}</li> :  dependents.dependentList);
            setShow(true);
        },
        [setShow, setAnchorPoint, graphData]
    );

    const handleLClick = useCallback(
        () => (show ? setShow(false) : null),
        [show]
    );
    
    //arrow from A to B, A ------> B
    //A is making a call to B and so depends on B.
    //From A's perspective: B is a dependency. Source A, Target B
    //From B's perspective: A is a dependent. Source B, Target A
    function getDependencies(neighbors: any, idNum: number){
        let thisNodeName: String = neighbors.node.nodeName;
        let curIdNum = idNum;
        return {
            dependencyList: neighbors.nodeLinks.map((neighbor: any) => {
                if (neighbor.source.nodeName === thisNodeName) {
                    curIdNum += 1;

                    return <li key={neighbor.target.nodeName + "_" + idNum}>{neighbor.target.nodeName}</li>;
                }
            }),
            idNum: curIdNum
        };
    }
    function getDependents(neighbors: any,  idNum: number){
        let thisNodeName: String = neighbors.node.nodeName;
        let curIdNum = idNum;

        return {
            dependentList: neighbors.nodeLinks.map((neighbor: any) => {
                if (neighbor.target.nodeName === thisNodeName) {
                    curIdNum += 1;
                    return <li key={neighbor.source.nodeName + "_" + idNum}>{neighbor.source.nodeName}</li>;
                }
            }),
            idNum: curIdNum
        };
    }

    useEffect(() => {
        document.addEventListener("nodeClick", handleClick);
        document.addEventListener("click", handleLClick);
        //handle cleanup
        return () => {
            document.removeEventListener("nodeClick", handleClick);
            document.removeEventListener("click", handleLClick);
        };
    }, [[graphData, handleClick, handleLClick]]);

    return {
        anchorPoint,
        name,
        show,
        type,
        dependents,
        setShow,
        dependencies,
    };
};