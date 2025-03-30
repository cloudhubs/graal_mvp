import React, { useCallback, useEffect, useState, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { ViewMode } from "../context/AppContext";
import { useAppContext } from "../context/AppContext";
import {Background, Controls, Edge, ReactFlow, useEdgesState, useNodesState} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from "./CustomNode";

type Props = {
    search: string;
    threshold: number;
    contextMap: any;
    graphRef: any;
    setInitRotation: any;
    highCoupling: any;
    viewMode: ViewMode;
};

const NODE_COLOR: string = "rgba(224, 219, 209, 1)";
const NODE_TEXT_COLOR: string = "rgba(255, 196, 84, 1)";
const NODE_HOVER_COLOR: string = "rgba(31, 237, 230, 1)";
const NODE_A_COLOR: string = "rgba(72, 205, 82, 1)";
const NODE_B_COLOR: string = "rgba(238, 155, 80, 1)";
const LINK_HIGHLIGHT_COLOR: string = "rgba(255, 0, 252, 1)";
const LINK_COLOR: string = NODE_COLOR;
const LINK_PARTICLE_COLOR: string = "rgba(255, 126, 126, 1)";
const LINK_ARROW_COLOR: string = LINK_HIGHLIGHT_COLOR;
const BACKGOUND_COLOR: string = "rgb(255,255,255)";
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
    const [filteredData, setFilteredData] = useState(contextMap);
    const [interactionEnabled, setInteractionEnabled] = useState(true);
    const [nodeDragEnabled, setNodeDragEnabled] = useState(true);

    const { setStateVar, selectedSearchValue, selectedSearchSecondValue } = useAppContext();
    const setSelectedSearchValue = (val: string) => setStateVar && setStateVar("selectedSearchValue", val);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (contextMap && contextMap.nodes && contextMap.links) {
            setNodes(convertNodes(contextMap.nodes));
            setEdges(convertLinks(contextMap.links));
        }
    }, [contextMap]);

    const nodeTypes = {
        customNode: CustomNode,
    };

    const initialEdges: Edge[] = [{ id: 'e1-2', source: 'Config', target: 'Contacts' }];

    const convertNodes = (nodes) => {
        const radius = 3000; // Increase the radius to create more space between nodes
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

        return nodes.map((node, i) => {
            const y = 1 - (i / (nodes.length - 1)) * 2; // y goes from 1 to -1
            const radiusAtY = Math.sqrt(1 - y * y); // radius at y
            const theta = phi * i; // golden angle increment

            // Convert 3D spherical coordinates to 2D projection
            const x = radius * Math.cos(theta) * radiusAtY;
            const yPos = radius * Math.sin(theta) * radiusAtY;

            return {
                id: node.nodeName,
                data: { label: node.nodeFullName, fields: node.fields },
                position: { x, y: yPos }, // Position in 2D
                type: "customNode",
            };
        });
    };


    // Convert the links to React Flow edges
    const convertLinks = (links) => {
        return links.map((link) => ({
            id: `${link.source}-${link.target}`,
            source: link.source,
            target: link.target,
            label: `${link.source} -> ${link.target}`, // Display multiplicity if needed
            animated: true,
            type: "default",
        }));
    };

    // Update search options to include only entities shown in the graph
    const searchOptions = contextMap.nodes.map((node: any) => node.nodeName);

    useEffect(() => {
        if (selectedSearchValue) {
            const filteredNodes = contextMap.nodes.filter((node: any) => node.msName === selectedSearchValue);
            const filteredLinks = contextMap.links.filter((link: any) =>
                filteredNodes.some((node: any) => node.id === link.source || node.id === link.target)
            );
            setEdges(convertLinks(filteredLinks))
            setNodes(convertNodes(filteredNodes));
            setFilteredData({ nodes: filteredNodes, links: filteredLinks });
            // setInteractionEnabled(false); // Disable interaction after filtering
            // setNodeDragEnabled(false); // Disable node dragging after filtering
        } else if (selectedSearchSecondValue) {
            const filteredNodes = contextMap.nodes.filter((node: any) => node.nodeName === selectedSearchSecondValue);
            const filteredLinks = contextMap.links.filter((link: any) =>
                filteredNodes.some((node: any) => node.id === link.source || node.id === link.target)
            );
            setEdges(convertLinks(filteredLinks))
            setNodes(convertNodes(filteredNodes));
        } else {
            setEdges(convertLinks(contextMap.links))
            setNodes(convertNodes(contextMap.nodes));
            setFilteredData(contextMap);
        }
    }, [selectedSearchValue, selectedSearchSecondValue, contextMap]);

    const handleNodeHover = (node: any) => {
        if (!interactionEnabled) return; // Return early if interaction is disabled
        clearHighlights();
        if (node) {
            highlightNodes.add(node);
        }
        setHoverNode(node || null);
        updateHighlight();
    };

    const handleLinkHover = (link: any) => {
        if (!interactionEnabled) return; // Return early if interaction is disabled
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
    };

    const updateHighlight = () => {
        setHighlightNodes(highlightNodes);
        setHighlightLinks(highlightLinks);
    };

    const handleNodeClick = useCallback(
        (node: any, event?: any) => {
            if (!interactionEnabled) return; // Return early if interaction is disabled
            event?.preventDefault();
            if (node) {
                const event = new CustomEvent("nodeClick", {
                    detail: { node },
                });
                setClickedNode(node);
                document.dispatchEvent(event);
            }
        },
        [interactionEnabled]
    );

    const handleLinkClick = useCallback((link: any, event: any) => {
        if (!interactionEnabled) return; // Return early if interaction is disabled
        event.preventDefault();
        if (link) {
            const event = new CustomEvent("linkClick", {
                detail: { link }
            });
            document.dispatchEvent(event);
        }
        setClickedLink(link || null);
        updateHighlight();
    }, [interactionEnabled]);

    useEffect(() => {
        const handleCloseBox = () => {
            setClickedLink(null);
            setClickedNode(null);
            setSelectedSearchValue("");
        };

        document.addEventListener("closeBox", handleCloseBox);
        return () => {
            document.removeEventListener("closeBox", handleCloseBox);
        };
    }, []);

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
        <div style={{width: '100vw', height: '100vh', backgroundColor: "white"}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                defaultViewport={{ x: 0, y: 0, zoom: 3 }}
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default ContextMap;