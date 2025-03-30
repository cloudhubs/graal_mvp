import React, { useState } from "react";
import SearchableDropdown from "./Search";
import { SearchableDropdown as SecondSeach} from "./SecondSearch";
import { useAppContext } from "../context/AppContext";

type Props = {
    graphRef: any;
};
const SearchWrapper: React.FC<Props> = ({}) => {

    const { graphData, contextMap, setStateVar } = useAppContext();
    const setSelectedVal = (val: string) => setStateVar && setStateVar("selectedSearchValue", val);
    const setSelectedSecondVal = (val: string) => setStateVar && setStateVar("selectedSearchSecondValue", val);

    return (
        <div className="mb-3 flex flex-col w-full items-center justify-center">

            <SearchableDropdown 
                options={graphData.nodes}
                label="nodeName"
                id="NodeSearchDropdownSearch"
                handleChange={(val) => setSelectedVal(val)}
            />

            <SecondSeach
                options={contextMap.nodes}
                label="nodeName"
                id="NodeSearchDropdownSecondSearch"
                handleChange={(val) => setSelectedSecondVal(val)}
            />
        </div>
    );
};

export default SearchWrapper;
