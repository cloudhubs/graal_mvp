import React from "react";
import { useInfoBox } from "../hooks/useInfoBox";
import { useInfoBoxLink } from "../hooks/useInfoBoxLink";
import { NODE_A_COLOR, NODE_B_COLOR } from "./CommunicationGraph";

export const NodeInfoBox = () => {
    const { anchorPoint: nodeAnchor, show: nodeShow, name, type, dependents, setShow, dependencies } = useInfoBox();
    const { anchorPoint: linkAnchor, show: linkShow, setShow: linkSetShow, source, target, links } = useInfoBoxLink();

    if (nodeShow) {
        return (
            <ul
                className="absolute flex flex-col bg-slate-200 gap-2 rounded-lg p-4 ml-80"
                style={{ top: nodeAnchor.y, left: nodeAnchor.x }}
            >
                <p>Name: {name}</p>
                <p>Type: {type}</p>
                <ul className="list-disc list-inside">
                    Dependencies: {dependencies}
                </ul>
                <ul className="list-disc list-inside">
                    Dependents: {dependents}
                </ul>
                <button
                    onClick={() => { 
                        setShow(false); 
                        
                        document.dispatchEvent(new CustomEvent("closeBox"))
                    }}
                    className="hover:text-stone-600 border-black border-2"
                >
                    Close Box
                </button>
            </ul>
        );
    }
    else if (linkShow) {
        return (
            <ul
                className="absolute flex flex-col bg-slate-200 gap-2 rounded-lg p-4 ml-80"
                style={{ top: linkAnchor.y, left: linkAnchor.x }}
            >
                <p>Source: {source}</p>
                <p>Target: {target}</p>
                <ul className="list-disc list-inside">
                    Rest Calls: {links.map((link: any) =>{
                        let textColor = "black";
                        if (link.version === "A"){
                            textColor = NODE_A_COLOR;
                        }
                        else if (link.version === "B"){
                            textColor = NODE_B_COLOR;
                        }
                        return (<li style={{color: textColor}}key={`${link.type}_${link.uri}`}>{link.type} {link.uri}</li>)
                    })
                    }
                </ul>
                <button
                    onClick={() => {
                        linkSetShow(false)
                        document.dispatchEvent(new CustomEvent("closeBox"))
                    }}
                    className="hover:text-stone-600 border-black border-2"
                >
                    Close Box
                </button>
            </ul>
        )
    }
    return <></>;
};
