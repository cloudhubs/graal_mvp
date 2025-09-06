/**
 * Authors: Vsevolod Pokhvalenko
 */

import React, { useEffect, useState } from "react";
import { ViewMode } from "../context/AppContext";
import { useAppContext } from "../context/AppContext";
import { Background, Controls, Edge, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react';
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
    // Local state to store filtered version of contextMap (if any filtering is applied)
    const [filteredData, setFilteredData] = useState(contextMap);

    // Accessing shared state from context
    const { setStateVar, selectedSearchValue, selectedSearchSecondValue } = useAppContext();

    // React Flow state for managing nodes and edges
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Effect to initialize nodes and edges when contextMap changes
    useEffect(() => {
        if (contextMap && contextMap.nodes && contextMap.links) {
            setNodes(convertNodes(contextMap.nodes));
            setEdges(convertLinks(contextMap.links));
        }
    }, [contextMap]);

    // Custom node type definition for React Flow
    const nodeTypes = {
        customNode: CustomNode,
    };

    /**
     * Converts nodes from input data into React Flow nodes,
     * positioning them using a spherical spiral algorithm for even spacing.
     */
    const convertNodes = (nodes) => {
        const radius = 3000; // Controls the spacing of nodes
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

        return nodes.map((node, i) => {
            const y = 1 - (i / (nodes.length - 1)) * 2; // Distributes nodes from top to bottom
            const radiusAtY = Math.sqrt(1 - y * y); // Radius of circle at given y
            const theta = phi * i; // Golden angle progression

            // Convert to 2D coordinates for layout
            const x = radius * Math.cos(theta) * radiusAtY;
            const yPos = radius * Math.sin(theta) * radiusAtY;

            return {
                id: node.nodeName,
                data: { label: node.nodeFullName, fields: node.fields },
                position: { x, y: yPos },
                type: "customNode",
            };
        });
    };

    /**
     * Converts links from input data into React Flow edges
     */
    const convertLinks = (links) => {
        return links.map((link) => ({
            id: `${link.source}-${link.target}`,
            source: link.source,
            target: link.target,
            label: `${link.source} -> ${link.target}`,
            animated: false,
            type: "default",
        }));
    };

    /**
     * Effect to update the graph based on selected search values from context.
     * Filters nodes and links accordingly.
     */
    useEffect(() => {
        if (selectedSearchValue) {
            // Filter nodes by selected microservice name
            const filteredNodes = contextMap.nodes.filter((node: any) => node.msName === selectedSearchValue);
            // Filter links connected to the filtered nodes
            const filteredLinks = contextMap.links.filter((link: any) =>
                filteredNodes.some((node: any) => node.id === link.source || node.id === link.target)
            );
            setEdges(convertLinks(filteredLinks));
            setNodes(convertNodes(filteredNodes));
            setFilteredData({ nodes: filteredNodes, links: filteredLinks });

        } else if (selectedSearchSecondValue) {
            // Filter nodes by specific node name
            const filteredNodes = contextMap.nodes.filter((node: any) => node.nodeName === selectedSearchSecondValue);
            const filteredLinks = contextMap.links.filter((link: any) =>
                filteredNodes.some((node: any) => node.id === link.source || node.id === link.target)
            );
            setEdges(convertLinks(filteredLinks));
            setNodes(convertNodes(filteredNodes));

        } else {
            // If no search filters are active, reset to full graph
            setEdges(convertLinks(contextMap.links));
            setNodes(convertNodes(contextMap.nodes));
            setFilteredData(contextMap);
        }
    }, [selectedSearchValue, selectedSearchSecondValue, contextMap]);

    return (
        <div ref={graphRef} style={{ width: '100vw', height: '100vh', backgroundColor: "white" }}>
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
