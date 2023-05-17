import React, { useEffect, useState } from "react";
import CommunicationGraph from "./CommunicationGraph";
import { ViewMode, useAppContext } from "../context/AppContext";
import ContextMap from "./ContextMap";
import SubContextMap from "./SubContextMap";

type Props = {
    graphRef: any;
    contextRef: any;
};

const VisualizationOptions: React.FC<Props> = ({
    graphRef,
    contextRef,
}) => {

    const { 
        subContextNodes,
        contextMap,
        search,
        sliderValue: threshold,
        highCoupling,
        viewMode,
        viewSubContextMap,
        setStateVar
    } = useAppContext();
    
    const setInitRotation = (rot: any) => setStateVar && setStateVar("initRotation", rot);

    const [filteredContextMap, setFilteredContextMap] = useState({})

    useEffect(() => {

        const nodes = [...subContextNodes.values()]
        const nodeNames = [...subContextNodes.keys()]

        if (nodes && nodeNames) {

            const filtered = {
                nodes: contextMap.nodes.filter(n => nodeNames.includes(n.msName)),
                links: contextMap.links.filter(link => nodeNames.includes(link.msSource) || nodeNames.includes(link.msTarget))
            }

            setFilteredContextMap(filtered)

        }
    }, [subContextNodes.values, subContextNodes.keys, subContextNodes])


    return (
        <div>
            {viewSubContextMap === true && 
                <SubContextMap
                    contextMap={filteredContextMap}
                    search={search}
                    threshold={threshold}
                    // graphRef={graphRef}
                    setInitRotation={setInitRotation}
                    highCoupling={highCoupling}
                    viewMode={viewMode}
                />
            }
            {(viewMode === ViewMode.CommGraph && viewSubContextMap === false) &&
                <CommunicationGraph
                    search={search}
                    threshold={threshold}
                    graphRef={graphRef}
                    setInitRotation={setInitRotation}
                    highCoupling={highCoupling}
                    viewMode={viewMode}
                />
                }
            {(viewMode === ViewMode.ContextMap && viewSubContextMap === false) &&
                <ContextMap
                    contextMap={contextMap}
                    search={search}
                    threshold={threshold}
                    graphRef={graphRef}
                    setInitRotation={setInitRotation}
                    highCoupling={highCoupling}
                    viewMode={viewMode}
                />
            }
            {(viewMode === ViewMode.AntiPattern && viewSubContextMap === false) &&
                <div>ANTI-PATTERNS</div>
            }
        </div>
    );
};

export default VisualizationOptions;
