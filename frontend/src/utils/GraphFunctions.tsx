import { ColorRepresentation } from "three";
import { ViewMode } from "../context/AppContext";

const shapes = {
    service: 0,
    kafka: 1,
    proxy: 1,
    writer: 1,
    pipeline: 1,
    customer: 2,
    srcSink: 2,
    archive: 3,
    database: 3,
    bucket: 3,
    API: 4,
    config: 5,
};
//hacky little thing that should be fixed. Delete later. It's just cause initCoords in the app context would not update no matter what.
export const initCoords = {
    x: 0,
    y: 0,
    z: 1000
}

function getShape(type: string): number {
    return shapes[type] ?? 0;
}

function showNeighbors(node: any, graphData: any, setHideNodes: any) {
    const { nodes, links } = graphData;
    const hideNodes = new Set(nodes);
    getNeighbors(node, links).nodes.forEach((node: any) => hideNodes.delete(node));
    setHideNodes(hideNodes);
}

function getVisibility(node: any, hideNodes: any) {
    return !hideNodes.has(node);
}

function getColor(
    node: any,
    graphData: any,
    threshold: number,
    highlightNodes: any,
    hoverNode: any,
    defNodeColor: any,
    setDefNodeColor: any,
    highCoupling: any,
    viewMode: ViewMode,
    // antipattern: any
): ColorRepresentation {
    if (viewMode === ViewMode.AntiPattern) {
        return highCoupling
            ? getColorCoupling(node, graphData, threshold, highlightNodes, hoverNode)
            : "rgb(0,255,0)";
    }

    return getColorVisual(
        node,
        graphData,
        threshold,
        highlightNodes,
        hoverNode,
        defNodeColor,
        setDefNodeColor
    );
}

function getColorVisual(
    node: any,
    graphData: any,
    threshold: number,
    highlightNodes: any,
    hoverNode: any,
    defNodeColor: any,
    setDefNodeColor: any
): ColorRepresentation {
    const { nodes, links } = graphData;

    if (highlightNodes.has(node)) {
        if (node === hoverNode) {
            return "rgb(50,50,200)";
        }
    }

    const neighbors = getNeighbors(node, links).nodes;
    if (neighbors.includes(hoverNode)) return "rgb(0,150,150)";

    if (!defNodeColor) {
        nodes.forEach((n: any) => {
            n.color = "-1";
        });
        setDefNodeColor(true);
    }

    if (node.color === "-1") {
        const colors = [
            "rgb(250, 93, 57)",
            "rgb(255, 167, 0)",
            "rgb(245, 239, 71)",
            "rgb(51, 241, 255)",
            "rgb(204, 51, 255)",
            "rgb(255, 51, 112)",
            "rgb(173, 255, 51)",
            "rgb(194, 151, 252)",
        ];

        const offLimits = neighbors
            .filter((neighbor: any) => neighbor.color !== "-1")
            .map((neighbor: any) => neighbor.color);

        const newColors = colors.filter((color) => !offLimits.includes(color));

        const randIndex = Math.floor(Math.random() * newColors.length);

        node.color = newColors[randIndex];
    }

    return node.color;
}

function getColorCoupling(
    node: any,
    graphData: any,
    threshold: number,
    highlightNodes: any,
    hoverNode: any
): ColorRepresentation {
    const { links } = graphData;
    const numNeighbors = getNeighbors(node, links).nodes.length;

    if (highlightNodes && highlightNodes.has(node)) {
        if (node === hoverNode) {
            return "rgb(50,50,200)";
        } else {
            return "rgb(0,200,200)";
        }
    }

    if (numNeighbors > threshold) {
        return "rgb(255,0,0)";
    }
    if (numNeighbors > threshold / 2) {
        return "rgb(255,160,0)";
    }

    return "rgb(0,255,0)";
}

function getNeighbors(node: any, links: any) {
    const nodeLinks = links.filter((link: any) => {
        return (
            link.source.nodeName === node.nodeName ||
            link.target.nodeName === node.nodeName
        );
    });

    const nodes = links.reduce((neighbors: any, link: any) => {
        if (link.target.nodeName === node.nodeName) {
            neighbors.push(link.source);
        } else if (link.source.nodeName === node.nodeName) {
            neighbors.push(link.target);
        }
        return neighbors;
    }, [node]);

    return { node, nodeLinks, nodes };
}

function resetView(graphRef: any, initCoords: any) {
    graphRef.current.cameraPosition(
        initCoords,
        { x: 0, y: 0, z: 0 },
        2000
    );
    // reset(graphRef);
}

const getNodeOpacity = (node: any, search: any): number => {
    if (search === "") {
        return 0.75;
    }
    if (node.nodeName.toLowerCase().includes(search.toLowerCase())) {
        return 0.8;
    } else {
        return 0.1;
    }
};

function getSpriteColor(
    node: any,
    search: any,
    graphData: any,
    threshold: number,
    highlightNodes: any,
    hoverNode: any,
    defNodeColor: any,
    setDefNodeColor: any,
    highCoupling: any,
    antipattern: any
) {
    if (!node.nodeName.toLowerCase().includes(search.toLowerCase())) {
        return "rgba(255,255,255,0)";
    }
    return getColor(
        node,
        graphData,
        threshold,
        highlightNodes,
        hoverNode,
        defNodeColor,
        setDefNodeColor,
        highCoupling,
        antipattern
    );
}

function getHighlightNeighbors(
    node: any,
    graphData: any,
    highlightLinks: any,
    highlightNodes: any
) {
    const { links } = graphData;
    const { nodeLinks, nodes } = getNeighbors(node, links);
    nodeLinks.forEach((link: any) => highlightLinks.add(link));
    nodes.forEach((node: any) => highlightNodes.add(node));
}

function getLinkOpacity(link: any, search: any, threed: any) {
    if (search === "") {
        if (threed) {
            return 0.7;
        }
        return 0.8;
    }
    if (
        link.source.nodeName.toLowerCase().includes(search.toLowerCase()) ||
        link.target.nodeName.toLowerCase().includes(search.toLowerCase())
    ) {
        if (threed) {
            return 0.9;
        }
    } else {
        if (threed) {
            return 0.7;
        }
        return 0.6;
    }
}

function getLinkColor(
    link: any,
    search: any,
    hoverNode: any,
    antiPattern: any,
    threed: any
) {
    if

        (antiPattern) {
        return linkColorCoupling(link, search, threed);
    }
    return linkColorVisual(link, search, hoverNode, threed);
}

function linkColorVisual(link: any, search: any, hoverNode: any, threed: any) {
    if (link.source === hoverNode) {
        return `rgba(50, 50, 200, ${getLinkOpacity(link, search, threed)})`;
    }
    let color = link.source.color;
    if (color && color! + -1) {
        color = color.replace(`)`, `, ${getLinkOpacity(link, search, threed)})`).replace('rgb', 'rgba');
    }
    return color;
}

function linkColorCoupling(link: any, search: any, threed: any) {
    return `rgba(102, 102, 153, ${getLinkOpacity(link, search, threed)})`;
}
// function getLink(sourceName: string, links: any){

// }
function getLinkWidth(link: any, search: any) {
    return link.requests.length * 3;
}
//TO-DO: explore a more efficient way of doing this
function handleComparison(versionsObj) {
    let uniqueNodesToA = new Map();
    // console.log(versionsObj.A, " ---- ", versionsObj.B);
    let newJSON: any = {
        "nodes": [],
        "links": []
    };
    for (let a of versionsObj.A.nodes) {
        uniqueNodesToA.set(a.nodeName, a);
    }
    for (let b of versionsObj.B.nodes) {
        //this node from B is also in A
        if (uniqueNodesToA.has(b.nodeName)) {
            uniqueNodesToA.delete(b.nodeName);
            //add common node to newJSON
            newJSON.nodes.push(b);

        } else {
            //set unique color to unique B's and add to newJSON
            const temp = { ...b, ["version"]: "B" }
            newJSON.nodes.push(temp);
        }
    }

    //set unique color to unique A's and add to newJSON
    for (let [key, value] of uniqueNodesToA.entries()) {
        const temp = { ...value, ["version"]: "A" }
        newJSON.nodes.push(temp);
    }

    //even if node is in common, may have different links. If same link, could be different requests!
        //if link is in A but NOT B, make all requests A's color, and vice-versa
        //if link is is in A AND B, go through all requests and change color of specific request
    let uniqueLinksToA = new Map();
    for (let link of versionsObj.A.links) {
        // console.log("link A = ", link.source + "_" + link.target, link)
        uniqueLinksToA.set(link.source + "_" + link.target, link);
    }

    for (let link of versionsObj.B.links) {
        //link is a match between A and B, check for different requests!
        if (uniqueLinksToA.has(link.source + "_" + link.target)) {
            let didChange: boolean = false;
            //check for different requests.
            let tempALink = uniqueLinksToA.get(link.source + "_" + link.target)
            let newRequests: any = [];
            //Check for unique requests in A
            for (let reqA of tempALink.requests){
                let foundMatch = false;
                for (let reqB of link.requests){

                    //request match found!
                    if (reqA.type === reqB.type &&
                        reqA.uri === reqB.uri &&
                        reqA.targetEndpointUri === reqB.targetEndpointUri){
                            foundMatch = true;
                            //MATCH FOUND, SAFE TO ADD
                            newRequests.push(reqB); //ONLY DO THIS ONCE. DO NOT DO THIS IN CHECKING FOR UNIQUE REQUESTS IN B BECAUSE YOULL HAVE DUPLICATES
                            break;
                    }
                }
                if (foundMatch === false){
                    reqA["version"] = "A"; //this request is unique to link A
                    didChange = true;
                    newRequests.push(reqA);
                }
            }
            //Check for unique requests in B
            for (let reqB of link.requests){
                let foundMatch = false;
                for (let reqA of tempALink.requests){
                    if (reqA.type === reqB.type &&
                        reqA.uri === reqB.uri &&
                        reqA.targetEndpointUri === reqB.targetEndpointUri){
                            foundMatch = true;
                            //DO NOT NEED TO ADD REQUEST HERE BECAUSE IT WOULD HAVE BEEN ADDED ALREADY
                            break;
                    }
                }
                if (foundMatch === false){
                    reqB["version"] = "B"; //this request is unique to link B
                    didChange = true;
                    newRequests.push(reqB);
                }
            }
            let newLink = {
                ...link, 
                requests: newRequests,
                didChanage: didChange
            }
            newJSON.links.push(newLink);
            uniqueLinksToA.delete(link.source + "_" + link.target);
        }
        //add links that only B has
        else {
            //set color to B for every request within
            for (let req of link.requests){
                req["version"] = "B";
            }
            let newLink = {
                ...link,
                didChange: true
            }
            // newJSON.links.push(link);
            newJSON.links.push(newLink);
        }
    }
    //add links that only A has. key = source_target, value = the link
    for (let [key, value] of uniqueLinksToA.entries()) {
        // let newRequests: any = {}
        for (let req of value.requests){
            req["version"] = "A";
        }
        // const temp = { ...value, ["requests"]: newRequests}
        const temp = { ...value, didChange: true}
        newJSON.links.push(temp);

    }

    // console.log("unique A's = ", uniqueNodesToA);
    // console.log("unique B's = ", uniqueNodesToB);
    // console.log("commons = ", nodesInCommon);
    // console.log("newJSON = ", newJSON);
    return newJSON;
}

export {
    getShape,
    getColor,
    getNeighbors,
    resetView,
    getHighlightNeighbors,
    getNodeOpacity,
    getSpriteColor,
    getLinkOpacity,
    getLinkColor,
    getLinkWidth,
    getVisibility,
    showNeighbors,
    handleComparison,
};
