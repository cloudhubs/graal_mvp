import React, { useState } from "react";
import SearchableDropdown from "./Search";
import { useAppContext } from "../context/AppContext";

type Props = {
    graphRef: any;
};
const SearchWrapper: React.FC<Props> = ({}) => {

    const { graphData, setStateVar } = useAppContext();
    const setSelectedVal = (val: string) => setStateVar && setStateVar("selectedSearchValue", val);

    return (
        <div className="mb-3 flex flex-col w-full items-center justify-center">

            <SearchableDropdown 
                options={graphData.nodes}
                label="nodeName"
                id="NodeSearchDropdownSearch"
                handleChange={(val) => setSelectedVal(val)}
            />
        </div>
    );
};

export default SearchWrapper;
