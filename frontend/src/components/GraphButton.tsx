import React, { useState } from "react";

type ButtonProps = {
    onClick: any;
    className?: String,
    children: any;

};
/**
 * A styled graph button with a function to interface with the graph.
 * @param {Object} props the props passed to this object
 * @param {Function} props.onClick on click function
 * @param {String} props.children text to display
 * @returns {React.Component} A single, functional button for the graph
 */
const GraphButton: React.FC<ButtonProps> = ({ onClick, className, ...props }) => {

    return (
        <button
            className={`border-2 border-slate-500 rounded-lg px-2 py-1 text-center text-sm text-gray-700 mx-2 transition
             bg-white hover:bg-opacity-50 border-opacity-40 ${className}`}
            onClick={onClick}
        >
            {props.children}
        </button>
    );
};
export default GraphButton;