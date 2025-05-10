import React, { useCallback, useEffect, useState, useRef } from "react";
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

const ContextMap: React.FC<Props> = ({
                                         contextMap,
                                         graphRef
                                     }) => {
    const [filteredData, setFilteredData] = useState(contextMap);

    const { setStateVar, selectedSearchValue, selectedSearchSecondValue } = useAppContext();

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

    return (
        <div style={{width: '100vw', height: '100vh', backgroundColor: "white"}}>
            <ReactFlow
                ref={graphRef}
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
