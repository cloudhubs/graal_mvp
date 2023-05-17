import React, { useCallback, useEffect, useState, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { ViewMode } from "../context/AppContext";
import * as THREE from "three";
import SpriteText from "three-spritetext";
import { useAppContext } from "../context/AppContext";

type Props = {
    search: string;
    threshold: number;
    graphRef: any;
    setInitRotation: any;
    highCoupling: any;
    viewMode: ViewMode;
};
//CONSTANTS FOR GRAPH
// const NODE_COLOR: string = "rgba(224, 219, 209, 1)";
const NODE_COLOR: string = "rgba(110, 110, 110, 1)";

// const NODE_TEXT_COLOR: string = "rgba(255, 196, 84, 1)";
const NODE_TEXT_COLOR: string = "rgba(0,0,0, 1)";
const NODE_TEXT_BG_COLOR: string = "rgba(255, 255, 255,0)";

// const NODE_TEXT_BG_COLOR: string = "rgba(0,0,0,1)";
// const NODE_TEXT_BG_COLOR: string = "rgba(255, 255, 255,1)";

const NODE_HOVER_COLOR: string = "rgba(31, 237, 230, 1)";
export const NODE_A_COLOR: string = "rgba(72, 205, 82, 1)";
export const NODE_B_COLOR: string = "rgba(238, 155, 80, 1)";
const LINK_HIGHLIGHT_COLOR: string = "rgba(255, 0, 252, 1)";
const LINK_COMPARISON_CHANGED: string = "rgba(102, 0, 255, 1)";
const LINK_COLOR: string = NODE_COLOR;
const LINK_PARTICLE_COLOR: string = "rgba(255, 126, 126, 1)";
const LINK_ARROW_COLOR: string = LINK_HIGHLIGHT_COLOR;
// const BACKGOUND_COLOR: string = "rgba(20, 20, 20, 1)";
const BACKGOUND_COLOR: string = "rgba(255,255,255, 1)";
const LINK_WIDTH = 5;
const PARTICLE_WIDTH = 6;
const LINK_ARROW_LENGTH = 10;
const LINK_PARTICLE_AMNT = 2;

const CommunicationGraph: React.FC<Props> = ({
    graphRef,
    setInitRotation,
}) => {
    const [highlightNodes, setHighlightNodes] = useState<any>(new Set());
    const [highlightLinks, setHighlightLinks] = useState<any>(new Set());
    const [hoverNode, setHoverNode] = useState(null);
    const [selectedLink, setSelectedLink] = useState(null);
    const [clickedNode, setClickedNode] = useState(null);
    const [clickedLink, setClickedLink] = useState(null);
    const { graphData, showCodeCoverage, subContextNodes, initCoords, selectedSearchValue, setStateVar } = useAppContext();
    const setSelectedSearchValue = (val: string) => setStateVar && setStateVar("selectedSearchValue", val)
    const setInitCoords = (val: any) => setStateVar && setStateVar("initCoords", val);
    const setSubContextNodes = (val: Map<String, Node>) => setStateVar && setStateVar("subContextNodes", val);
    const setCodeCovereagePossible = (val: boolean) => setStateVar && setStateVar("codeCoveragePossible", val);

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
    function handleNodeColor(node) {
        let color = NODE_COLOR;

        if (showCodeCoverage){
            let ccp: number = Number(node.codeCoveragePercentage);
            if (ccp >= 95){
                color = "rgba(0, 255,0,1)";

            }else if (ccp >= 70){
                color = "rgba(255, 165,0,1)";

            }else if (ccp >= 50){
                color = "rgba(255, 255,0,1)";

            }else{
                color = "rgba(255, 0,0,1)";
            }
        }

        if (node.version === "A") {
            color = NODE_A_COLOR;
        } else if (node.version === "B") {
            color = NODE_B_COLOR;
        }
        if (highlightNodes.has(node) || node === clickedNode) {
            color = NODE_HOVER_COLOR;
        }
        return color;
    }

    const handleNodeRightClick = useCallback(
        (node: any, event?: any) => {
            if (!node){
                console.log("node undefined");
                return;
            }
            //prevent duplicates from being added and unecessary state set
            if (subContextNodes.has(node.nodeName)){
                return;
            }
            const updatedSubContextNodes = new Map(subContextNodes);
            updatedSubContextNodes.set(node.nodeName, node);
            setSubContextNodes(updatedSubContextNodes);

        }, [subContextNodes]
    );
   
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
        [graphRef, graphData]
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
    useEffect(()=>{
        //graphData has codeCovereagePercentage field
        if (graphData.nodes.length > 0 && ("codeCoveragePercentage" in graphData.nodes[0] )){
            console.log("cc possible");
            setCodeCovereagePossible(true);
        }else{
            console.log("cc not possible");
            setCodeCovereagePossible(false);
        }
    }, [graphData]);

    useEffect(() => {
        console.log("resetting subContextNodes");
        setSubContextNodes(new Map<String, Node>); //RESET SUB CONTEXT NODES LIST


        if (!graphRef.current.cameraPosition) {
            console.log("graphRef.current.cameraPosition is undefined");
            return;
          }

        let { x, y, z } = graphRef.current.cameraPosition();
        setInitCoords({x,y,z});

        setInitRotation(graphRef.current.camera().quaternion);
        graphRef.current.d3Force('charge').strength((node: any) => { return -120; })
        graphRef.current.d3Force('link').distance((link: any) => { return 80; });

        const handleCloseBox = () => {
            setClickedLink(null);
            setClickedNode(null);
            setSelectedSearchValue("");
        }

        document.addEventListener("closeBox", handleCloseBox);
        return () => document.removeEventListener("closeBox", handleCloseBox);
    }, []);
    
    return (
        <ForceGraph3D
            ref={graphRef}
            graphData={graphData}
            nodeId={"nodeName"}
            backgroundColor={BACKGOUND_COLOR}
            nodeThreeObject={(node: any) => {
                const nodes: any = new THREE.Mesh(
                    new THREE.SphereGeometry(5),
                    new THREE.MeshLambertMaterial({
                        transparent: true,
                        color: handleNodeColor(node)
                    })
                );
                if (
                    selectedSearchValue &&
                    node.nodeName === selectedSearchValue &&
                    selectedSearchValue !== ((clickedNode as unknown) as Node)?.nodeName) {
                    handleNodeClick(node)
                }

                const sprite = new SpriteText(node.nodeName);
                sprite.backgroundColor = NODE_TEXT_BG_COLOR;
                sprite.color = NODE_TEXT_COLOR
                sprite.textHeight = 8;
                sprite.position.set(0, 15, 0);

                nodes.add(sprite);
                return nodes;
            }}

            linkDirectionalArrowLength={LINK_ARROW_LENGTH}
            linkDirectionalArrowRelPos={1}
            linkDirectionalArrowColor={(link) => LINK_ARROW_COLOR}

            linkDirectionalParticles={LINK_PARTICLE_AMNT}
            linkDirectionalParticleWidth={link => (highlightLinks.has(link) || link === clickedLink) ? PARTICLE_WIDTH : 0}
            linkDirectionalParticleColor={() => LINK_PARTICLE_COLOR}

            linkWidth={LINK_WIDTH}
            linkColor={(link) => {
                let linkCol = LINK_COLOR;
                if ("didChange" in link && link.didChange === true){
                   linkCol = LINK_COMPARISON_CHANGED;
                }

                if (link === clickedLink || link === selectedLink) {
                    linkCol = LINK_HIGHLIGHT_COLOR
                }
                return linkCol;
            }}
            onNodeDragEnd={(node) => {
                if (node.x && node.y && node.z) {
                    node.fx = node.x;
                    node.fy = node.y;
                    node.fz = node.z;
                }
            }}
            onNodeClick={handleNodeClick}
            onLinkClick={handleLinkClick}
            onNodeHover={handleNodeHover}
            onLinkHover={handleLinkHover}
            onNodeRightClick={handleNodeRightClick}
        />
    );
};

export default CommunicationGraph;
