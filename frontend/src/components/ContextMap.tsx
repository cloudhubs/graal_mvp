import React, { useCallback, useEffect, useState, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import {ViewMode} from "../context/AppContext";
import * as THREE from "three";
import { Group, WebGLRenderer, Renderer, Scene, Camera } from 'three';
import { useAppContext } from "../context/AppContext";
import { ForceGraph2D } from 'react-force-graph';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import * as d3 from 'd3-force-3d';

type Props = {
    search: string;
    threshold: number;
    contextMap: any;
    graphRef: any;
    // setInitCoords: any;
    setInitRotation: any;
    highCoupling: any;
    viewMode: ViewMode;
    // antiPattern: any;

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
const LINK_COLOR: string = NODE_COLOR;
const LINK_PARTICLE_COLOR: string = "rgba(255, 126, 126, 1)";
const LINK_ARROW_COLOR: string = LINK_HIGHLIGHT_COLOR;
const BACKGOUND_COLOR: string = "rgba(20, 20, 20, 1)";
const LINK_WIDTH = 1.5;
const PARTICLE_WIDTH = 6;
const LINK_ARROW_LENGTH = 10;
const LINK_PARTICLE_AMNT = 2;

const ContextMap: React.FC<Props> = ({
    contextMap,
    search,
    threshold,
    viewMode,
    graphRef,
    setInitRotation,
    highCoupling    
}) => {
    const [highlightNodes, setHighlightNodes] = useState<any>(new Set());
    const [highlightLinks, setHighlightLinks] = useState<any>(new Set());
    const [hoverNode, setHoverNode] = useState(null);
    const [selectedLink, setSelectedLink] = useState(null);
    const [clickedNode, setClickedNode] = useState(null);
    const [clickedLink, setClickedLink] = useState(null);

    const { setStateVar, selectedSearchValue } = useAppContext();
    const setSelectedSearchValue = (val: string) => setStateVar && setStateVar("selectedSearchValue", val)

    const handleNodeHover = (node: any) => {
        clearHighlights();

        if (node) {
            highlightNodes.add(node);
        }

        setHoverNode(node || null);
        updateHighlight();
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

    const clearHighlights = () => {
        highlightLinks.clear();
        highlightNodes.clear();
    }
    const updateHighlight = () => {
        setHighlightNodes(highlightNodes);
        setHighlightLinks(highlightLinks);
    };
    function handleNodeColor(node){
        let color = NODE_COLOR;
        
        // color: (highlightNodes.has(node) || node === clickedNode) ? NODE_HOVER_COLOR : NODE_COLOR,
        if (node.version === "A"){
            color = NODE_A_COLOR;
        }else if (node.version === "B"){
            color = NODE_B_COLOR;
        }
        if (highlightNodes.has(node) || node === clickedNode){
            color = NODE_HOVER_COLOR;
        }
        return color;
    }


    const handleNodeClick = useCallback(
        (node: any, event?: any) => {

            event?.preventDefault();

            if (node) {

                const distance = 100;

                if (graphRef.current) {                    
                    const camera = graphRef.current.camera();
                    const currentPosition = camera.position.clone();
                    const nodePosition = new THREE.Vector3(node.x, node.y, node.z);
              
                    // Calculate the vector from the camera to the node
                    const direction = nodePosition.clone().sub(currentPosition).normalize();
              
                    // Calculate the new camera position at the desired distance from the node
                    const targetPosition = nodePosition.clone().sub(direction.multiplyScalar(distance));
              
                    const transitionDuration = 1000; // Transition duration in ms
              
                    // Move the camera closer to the node without changing the lookAt target
                    graphRef.current.cameraPosition(
                      targetPosition, // New camera position
                      nodePosition, 
                      transitionDuration
                    );
                }

                const event = new CustomEvent("nodeClick", {
                    detail: { node },
                });
                setClickedNode(node);
                document.dispatchEvent(event);
            }
        },
        [graphRef]
    );

    const handleLinkClick = useCallback((link: any, event: any) => {
        event.preventDefault();
        if (link) {
            const event = new CustomEvent("linkClick", {
                detail: { link }
            });
            document.dispatchEvent(event);
        }
        setClickedLink(link || null)
        updateHighlight();
    }, []);

    useEffect(() => {
        let { x, y, z } = graphRef.current.cameraPosition();
        // setInitCoords({x, y, z});
        setInitRotation(graphRef.current.camera().quaternion);
        //old strength/distance is when I used the 2DCSSObject
        //graphRef.current.d3Force('charge').strength((node: any) => { return -220; })
        //graphRef.current.d3Force('link').distance((link: any) => { return 50; });
        graphRef.current.d3Force('charge').strength((node: any) => { return -20; })
        graphRef.current.d3Force('link').distance((link: any) => { return 65; });

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
         
    /* Function to determine multiplicity for the label*/
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
      
    const extraRenderers: any = [new CSS3DRenderer()];
    
    return (
        <ForceGraph3D
            extraRenderers={extraRenderers}
            ref={graphRef}
            graphData={contextMap}
            nodeId={"nodeName"}
            backgroundColor={BACKGOUND_COLOR}
            nodeThreeObject={(node: any) => {
                const el = document.createElement('div');

                // Node name in larger text
                const nameEl = document.createElement('div');
                nameEl.style.fontWeight = 'bold';
                nameEl.style.fontSize = '16px';
                nameEl.style.textAlign = 'center';
                nameEl.style.display = 'block';
                nameEl.style.border = "2px solid grey";
                nameEl.style.backgroundColor = 'rgba(183,201,226)';
                nameEl.innerText = node.nodeName;
                el.appendChild(nameEl);

                let heightValue = 20; // Accounting for 20 bc the name takes up 16px already
                
                if(node && node.fields) {
                    //only do this if the nodes have fields
                    node.fields.forEach((field) => {
                        const fieldEl = document.createElement('div');
                        fieldEl.style.fontSize = '12px';
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


                 if (
                    selectedSearchValue &&
                    selectedSearchValue.length &&
                    node.nodeName === selectedSearchValue && selectedSearchValue !== clickedNode?.nodeName) {
                    handleNodeClick(node)
                }
                const cssObject = new CSS3DObject(el);
                cssObject.position.set(0,0,0);
                cssObject.scale.set(0.1, 0.1, 0.1);

                // cssObject.element.addEventListener('click', (event) => {
                //     handleNodeClick(node, event);
                //   });

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
            onNodeClick={handleNodeClick}
            // onLinkClick={handleLinkClick}
            onNodeHover={handleNodeHover}
            onLinkHover={handleLinkHover}
        />
    );
};

export default ContextMap;
