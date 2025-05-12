/**
 * Authors: Vsevolod Pokhvalenko, and the MicroGraal Development Team
 */

import React, {useState, useRef} from "react"
import {useAppContext} from "../context/AppContext";

export const SearchableDropdown = ({
                                       options,
                                       label,
                                       id,
                                       handleChange
                                   }) => {

    const {search, selectedSearchSecondValue, setStateVar} = useAppContext();

    const setSearch = (s) => setStateVar && setStateVar("selectedSearchSecondValue", s);
    const setSelectedSecondValue = (val) => setStateVar && setStateVar("selectedSearchSecondValue", val)

    const [searchLocal, setSearchLocal] = useState("")

    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef(null);

    const selectOption = (option) => {
        // setSearch(option.nodeName)
        setSearchLocal(option.nodeName)
        handleChange(option[label]);
        setIsOpen((isOpen) => !isOpen);
    };

    function toggle(e) {

        setIsOpen(e && e.target === inputRef.current);
        if (isOpen) {
            setIsOpen(false);
        }
    }

    const getDisplayValue = () => {
        if (search) return search;
        if (selectedSearchSecondValue) return selectedSearchSecondValue;

        // return "";
    };

    const filterOpt = (options) => {
        const op = options.filter(
            (option) => option[label]?.toLowerCase().indexOf(searchLocal.toLowerCase()) > -1
        )
        return op
    }

    return (
        <div className="relative text-gray-900 cursor-default dropdown">
            <div className="control">
                <div className="selected-value">
                    <input
                        placeholder="nn search"
                        ref={inputRef}
                        type="text"
                        value={getDisplayValue()}
                        name="searchTerm"
                        className="leading-6 text-base bg-white border border-gray-300 rounded-sm box-border cursor-default outline-none px-2 py-1 transition-all duration-200 w-full"
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setSearchLocal(e.target.value)
                            setSelectedSecondValue("");
                            handleChange(null);
                        }}
                        onClick={toggle}
                    />
                </div>
                <span
                    className={`absolute right-2.5 top-3.5 ${isOpen ? "open" : ""} arrow`}
                    style={{
                        borderColor: isOpen ? "transparent transparent #999" : "#999 transparent transparent",
                        borderWidth: isOpen ? "0 5px 5px" : "5px 5px 0",
                        borderStyle: "solid",
                        width: 0,
                        height: 0,
                    }}
                ></span>
            </div>

            <div
                className={`options ${isOpen ? "open" : "hidden"} bg-white border border-gray-300 shadow-sm box-border -mt-1 max-h-48 overflow-y-auto absolute top-full w-full z-10`}>
                {filterOpt(options).map((option, index) => (
                        <div
                            onClick={() => selectOption(option)}
                            className={`option ${option[label] === selectedSearchSecondValue ? "selected" : ""} box-border text-gray-600 cursor-pointer block px-2.5 py-1 hover:bg-blue-200 ${option[label] === selectedSearchSecondValue ? "bg-blue-100 text-gray-900" : ""}`}
                            key={`${id}-${index}`}
                        >
                            {option[label]}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

