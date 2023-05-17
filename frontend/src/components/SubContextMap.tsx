import React, { useEffect, useState, useRef } from "react";
import { useAppContext, ViewMode } from "../context/AppContext";
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import ForceGraph3D from "react-force-graph-3d";


type Props = {
    search: string;
    threshold: number;
    contextMap: any;
    // graphRef: any;
    setInitRotation: any;
    highCoupling: any;
    viewMode: ViewMode;
};

//CONSTANTS FOR GRAPH
const NODE_COLOR: string = "rgba(224, 219, 209, 1)";
const NODE_TEXT_COLOR: string = "rgba(255, 196, 84, 1)";
const SECONDARY_NODE_TEXT_COLOR: string = "rgba(255, 45, 45, 1)";
const NODE_TEXT_BG_COLOR: string = "rgba(0,0,0,1)";
const NODE_HOVER_COLOR: string = "rgba(31, 237, 230, 1)";
export const NODE_A_COLOR: string = "rgba(72, 205, 82, 1)";
export const NODE_B_COLOR: string = "rgba(238, 155, 80, 1)";
const LINK_HIGHLIGHT_COLOR: string = "rgba(255, 0, 252, 1)";
//const LINK_COLOR: string = NODE_COLOR;
const LINK_COLOR: string = "rgb(0,0,0)";
const LINK_PARTICLE_COLOR: string = "rgba(255, 126, 126, 1)";
const LINK_ARROW_COLOR: string = LINK_HIGHLIGHT_COLOR;
//const BACKGOUND_COLOR: string = "rgba(20, 20, 20, 1)";
const BACKGOUND_COLOR: string = "rgba(255, 255, 255, 1)";
const PANEL_BACKGROUND_COLOR: string = "rgba(20, 20, 20, 0.8)";
const LINK_WIDTH = 1.5;
const PARTICLE_WIDTH = 6;
const LINK_ARROW_LENGTH = 10;
const LINK_PARTICLE_AMNT = 2;

const SubContextMap: React.FC<Props> = ({
    contextMap,
    search,
    threshold,
    viewMode,
    // graphRef,
    setInitRotation,
    highCoupling
}) => {
    const graphRef = useRef()
    const { viewSubContextMap, setStateVar, selectedSearchValue } = useAppContext();
    const setSubContextNodes = (val: Map<String, Node>) => setStateVar && setStateVar("subContextNodes", val);
    const setViewSubContextMap = (val: boolean) => setStateVar && setStateVar("viewSubContextMap", val);
    const [highlightNodes, setHighlightNodes] = useState<any>(new Set());
    const [highlightLinks, setHighlightLinks] = useState<any>(new Set());
    const [hoverNode, setHoverNode] = useState(null);
    const [selectedLink, setSelectedLink] = useState(null);
    const [clickedNode, setClickedNode] = useState(null);
    const [clickedLink, setClickedLink] = useState(null);
    const setSelectedSearchValue = (val: string) => setStateVar && setStateVar("selectedSearchValue", val)

    const handleBackClick = ()=>{
        setViewSubContextMap(!viewSubContextMap);
    }

    const handleNodeHover = (node: any) => {
        clearHighlights();

        if (node) {
            highlightNodes.add(node);
        }

        setHoverNode(node || null);
        updateHighlight();
    };

    const clearHighlights = () => {
        highlightLinks.clear();
        highlightNodes.clear();
    }
    const updateHighlight = () => {
        setHighlightNodes(highlightNodes);
        setHighlightLinks(highlightLinks);
    };

    const handleLinkHover = (link: any) => {
        clearHighlights();

        if (link) {
            highlightLinks.add(link);
            highlightNodes.add(link.source);
            highlightNodes.add(link.target);
        }

        setSelectedLink(link || null);
        updateHighlight();
    };

    useEffect(() => {
        // let { x, y, z } = graphRef.current.cameraPosition();
        setInitRotation(graphRef.current.camera().quaternion);
        graphRef.current.d3Force('charge').strength((node: any) => { return -20; })
        graphRef.current.d3Force('link').distance((link: any) => { return 85; });
        // graphRef.current.d3Force('charge').strength((node: any) => { return -220; })
        // graphRef.current.d3Force('link').distance((link: any) => { return 50; });

        const handleCloseBox = () => {
            setClickedLink(null);
            setClickedNode(null);
            setSelectedSearchValue("");
        }

        document.addEventListener("closeBox", handleCloseBox);
        return () => {
            document.removeEventListener("closeBox", handleCloseBox);
            }
    }, []);


    const extraRenderers: any = [new CSS3DRenderer()];

    const getLinkLabel = (link: any) => {
        const { sourceMultiplicity, targetMultiplicity } = link;
      
        if (sourceMultiplicity && targetMultiplicity) {
          return `${sourceMultiplicity} to ${targetMultiplicity}`;
        } else if (sourceMultiplicity) {
          return sourceMultiplicity;
        } else if (targetMultiplicity) {
          return targetMultiplicity;
        }
        return "";
    };
    
    return (
        <div className="relative h-full w-full">
            {viewSubContextMap && (
                <div>
                    <div style={{ zIndex: 30, backgroundColor: PANEL_BACKGROUND_COLOR }}>
                        <button className = "absolute left-5 top-5 z-50 hover:opacity-50 bg-white rounded-lg" onClick={handleBackClick}>
                            <svg width="50px" height="50px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="blue">
                                <g id="SVGRepo_bgCarrier" strokeWidth="0"/>
                                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"/>
                                <g id="SVGRepo_iconCarrier"> <path d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM13.92 16.13H9C8.59 16.13 8.25 15.79 8.25 15.38C8.25 14.97 8.59 14.63 9 14.63H13.92C15.2 14.63 16.25 13.59 16.25 12.3C16.25 11.01 15.21 9.97 13.92 9.97H8.85L9.11 10.23C9.4 10.53 9.4 11 9.1 11.3C8.95 11.45 8.76 11.52 8.57 11.52C8.38 11.52 8.19 11.45 8.04 11.3L6.47 9.72C6.18 9.43 6.18 8.95 6.47 8.66L8.04 7.09C8.33 6.8 8.81 6.8 9.1 7.09C9.39 7.38 9.39 7.86 9.1 8.15L8.77 8.48H13.92C16.03 8.48 17.75 10.2 17.75 12.31C17.75 14.42 16.03 16.13 13.92 16.13Z" fill="#292D32"/> </g>
                            </svg>
                        </button>    
                       
                        <div style={{ backgroundColor: PANEL_BACKGROUND_COLOR, zIndex: 10, position: 'absolute', top: '80px', left: '20px', color: 'white', border: '1px solid grey', padding: '10px', borderRadius: '5px' }}>
                        <span style={{ zIndex: 30, fontSize: '16px', display: 'block', fontWeight: 700 }}>Microservice(s) selected:</span>
                        {contextMap.nodes.filter((node, index, array) => array.findIndex(n => n.msName === node.msName) === index).map((node, index) => {
                            return (
                            <span 
                                key= {index} 
                                style={{ zIndex: 30, fontSize: '12px', marginRight: '10px' }}>
                                {node.msName}
                                {(index + 1) % 2 === 0 ? <br /> : null}
                            </span>
                            )
                        })}
                        <span style={{ zIndex: 30, fontSize: '16px', display: 'block', marginTop: '10px', fontWeight: 700 }}>Entity List: </span>
                        {contextMap.nodes.map((node, index) => {
                            return (
                            <span 
                                key= {index} 
                                style={{ zIndex: 30, fontSize: '12px', marginRight: '10px' }}>
                                {node.nodeName}
                                {(index + 1) % 2 === 0 ? <br /> : null}
                            </span>
                            )
                        })}
                        </div>
                    </div>   
                    <ForceGraph3D
                        extraRenderers={extraRenderers}
                        ref={graphRef}
                        graphData={contextMap}
                        nodeId={"nodeName"}
                        backgroundColor={BACKGOUND_COLOR}
                        nodeThreeObject={(node: any) => {

                            //trying to filter beforehand (old code)
                            // if (badNodes.some(badNode => badNode.nodeName === node.nodeName)) {
                            //     return null; 
                            // }

                            const el = document.createElement('div');

                            // Node name in larger text
                            const nameEl = document.createElement('div');
                            nameEl.style.fontWeight = 'bold';
                            nameEl.style.fontSize = '16px';
                            nameEl.style.textAlign = 'center';
                            nameEl.style.display = 'block';
                            nameEl.style.border = '2px solid grey';
                            nameEl.style.color = 'black';
                            nameEl.style.backgroundColor = 'rgba(183,201,226)';
                            nameEl.innerText = node.nodeName;
                            el.appendChild(nameEl);

                            let heightValue = 20; // Accounting for 20 bc the name takes up 16px already
                            
                            if(node && node.fields) {
                                //only do this if the nodes have fields
                                node.fields.forEach((field) => {
                                    const fieldEl = document.createElement('div');
                                    fieldEl.style.fontSize = '12px';
                                    fieldEl.style.color = 'black';
                                    fieldEl.innerText = `+${field.fieldType} ${field.fieldName}`;
                                    el.appendChild(fieldEl);
                                    heightValue += 30;
                                });
                            }


                            const heightPixels = heightValue + 'px';
                            // Styling for the HTML element
                            el.style.width = '200px';
                            el.style.height = heightPixels;
                            el.style.backgroundColor = 'rgba(183,201,226)';

                            // if (
                            //     selectedSearchValue &&
                            //     selectedSearchValue.length &&
                            //     node.nodeName === selectedSearchValue && selectedSearchValue !== clickedNode?.nodeName) {
                            //     handleNodeClick(node)
                            // }
                            const cssObject = new CSS3DObject(el);
                            cssObject.position.set(0,0,0);
                            cssObject.scale.set(0.1, 0.1, 0.1);

                            // FOR CAMERA LOOKING
                            // if (graphRef.current.camera().position) {
                            //     cssObject.lookAt(graphRef.current.camera().position)
                            // }
                            
                            
                            // cssObject.element.style.zIndex = '1';

                            return cssObject;
                        }}
                        nodeThreeObjectExtend={true}
                        linkLabel={getLinkLabel}
                        
                        linkDirectionalArrowLength={LINK_ARROW_LENGTH}
                        linkDirectionalArrowRelPos={1}
                        linkDirectionalArrowColor={(link) => LINK_ARROW_COLOR}

                        linkDirectionalParticles={LINK_PARTICLE_AMNT}
                        linkDirectionalParticleWidth={link => (highlightLinks.has(link) || link === clickedLink) ? PARTICLE_WIDTH : 0}
                        linkDirectionalParticleColor={() => LINK_PARTICLE_COLOR}

                        linkWidth={LINK_WIDTH}
                        linkColor={(link) => {
                            if (link === clickedLink || link === selectedLink) {
                                return LINK_HIGHLIGHT_COLOR
                            }
                            return LINK_COLOR;
                        }}
                        onNodeDragEnd={(node) => {
                            if (node.x && node.y && node.z) {
                                node.fx = node.x;
                                node.fy = node.y;
                                node.fz = node.z;
                            }
                        }}
                        onNodeHover={handleNodeHover}
                        onLinkHover={handleLinkHover}
                    />
                </div>
            )}
        </div>
    );
}
export default SubContextMap;