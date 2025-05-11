/**
 * Authors: Vsevolod Pokhvalenko, and the MicroGraal Development Team
 */

import React, { useCallback, useEffect, useState, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { ViewMode } from "../context/AppContext";
import { useAppContext } from "../context/AppContext";

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
const BACKGOUND_COLOR: string = "rgb(0,0,0)";
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

    const { setStateVar, selectedSearchValue } = useAppContext();
    const setSelectedSearchValue = (val: string) => setStateVar && setStateVar("selectedSearchValue", val);

    // Update search options to include only entities shown in the graph
    const searchOptions = contextMap.nodes.map((node: any) => node.nodeName);

    useEffect(() => {
        if (selectedSearchValue) {
            const filteredNodes = contextMap.nodes.filter((node: any) => node.msName === selectedSearchValue);
            const filteredLinks = contextMap.links.filter((link: any) =>
                filteredNodes.some((node: any) => node.id === link.source || node.id === link.target)
            );
            setFilteredData({ nodes: filteredNodes, links: filteredLinks });
            // setInteractionEnabled(false); // Disable interaction after filtering
            // setNodeDragEnabled(false); // Disable node dragging after filtering
        } else {
            setFilteredData(contextMap);
            setInteractionEnabled(true); // Enable interaction when no filter is applied
            setNodeDragEnabled(true);
        }
    }, [selectedSearchValue, contextMap]);

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
        <ForceGraph2D
            ref={graphRef}
            graphData={filteredData}
            enableNodeDrag={nodeDragEnabled} // Control node dragging
            nodeId={"nodeName"}
            backgroundColor={BACKGOUND_COLOR}
            nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.nodeName;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.fillStyle = 'black';

                // Calculate the width and height of the text
                const textWidth = ctx.measureText(label).width;
                const textHeight = fontSize * 1.2; // Approximate height

                // Calculate total height for the node label and additional data
                const totalHeight = textHeight + (node.fields ? node.fields.length * textHeight : 0);
                const maxWidth = Math.max(textWidth, ...(node.fields ? node.fields.map(field => ctx.measureText(`${field.fieldType} ${field.fieldName}`).width) : []));

                // Draw background rectangle
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Background color
                ctx.fillRect(node.x - maxWidth / 2 - 2, node.y - textHeight / 2 - 2, maxWidth + 4, totalHeight + 4);

                // Draw text
                ctx.fillStyle = 'black';
                ctx.fillText(label, node.x, node.y);

                // Display additional data
                if (node.fields) {
                    node.fields.forEach((field, index) => {
                        const fieldText = `${field.fieldType} ${field.fieldName}`;
                        ctx.fillText(fieldText, node.x, node.y + (index + 1) * textHeight);
                    });
                }
            }}
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
                    return LINK_HIGHLIGHT_COLOR;
                }
                return LINK_COLOR;
            }}
            onNodeDragEnd={(node) => {
                if (node.x && node.y) {
                    node.fx = node.x;
                    node.fy = node.y;
                }
            }}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            onLinkHover={handleLinkHover}
        />
    );
};

export default ContextMap;