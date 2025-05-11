/**
 * Authors: Vsevolod Pokhvalenko, and the MicroGraal Development Team
 */

import React from "react";
import {useInfoBox} from "../hooks/useInfoBox";
import {useInfoBoxLink} from "../hooks/useInfoBoxLink";
import {NODE_A_COLOR, NODE_B_COLOR} from "./CommunicationGraph";

export const NodeInfoBox = () => {
    const {anchorPoint: nodeAnchor, show: nodeShow, name, type, dependents, setShow, dependencies} = useInfoBox();
    const {anchorPoint: linkAnchor, show: linkShow, setShow: linkSetShow, source, target, links} = useInfoBoxLink();

    if (nodeShow) {
        return (
            <ul
                className="absolute flex flex-col bg-slate-200 gap-2 rounded-lg p-4 ml-80"
                style={{top: nodeAnchor.y, left: nodeAnchor.x}}
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
    } else if (linkShow) {
        return (
            <div
                className="absolute bg-white shadow-lg rounded-xl p-6 border border-gray-300 ml-80"
                style={{ top: linkAnchor.y, left: linkAnchor.x }}
            >
                <h2 className="text-lg font-semibold text-gray-700">Source: {source}</h2>
                <h3 className="text-md font-medium text-gray-600 mb-3">Target: {target}</h3>

                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Calls:</h4>
                    <ul className="list-none space-y-2">
                        {links.map((link: any) => {
                            let textColor = "text-black";
                            if (link.version === "A") {
                                textColor = "text-blue-600";
                            } else if (link.version === "B") {
                                textColor = "text-green-600";
                            }
                            return (
                                <li key={`${link.type}_${link.uri}`} className={`p-3 rounded-lg border border-gray-200`}>
                            <span className={`font-medium ${textColor}`}>
                                {link.type} {link.uri}
                            </span>
                                    {link.document && (
                                        <p className="text-gray-600 text-sm mt-1">
                                            <strong>Document:</strong> {link.document}
                                        </p>
                                    )}
                                    {link.arguments && (
                                        <p className="text-gray-600 text-sm mt-1">
                                            <strong>Arguments:</strong> {link.arguments}
                                        </p>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <button
                    onClick={() => {
                        linkSetShow(false);
                        document.dispatchEvent(new CustomEvent("closeBox"));
                    }}
                    className="mt-4 w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                    Close
                </button>
            </div>
        );

    }
    return <></>;
};
