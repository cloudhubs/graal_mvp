import React from "react";
import GraphMenuButtons from "./GraphMenuButtons";
import { useAppContext } from "../context/AppContext";
import SearchWrapper from "./SearchWrapper";
import SubContextMapMenu from "./SubContextMapMenu";

type Props = {
    graphRef: any;
};

const GraphMenu: React.FC<Props> = ({
    graphRef
}) => {

    const { 
        subContextNodes,
        initRotation,
        setStateVar
    } = useAppContext();

    return (
        <div className="absolute top-2 right-2 z-50 flex flex-col gap-2 text-sm bg-blue-300 bg-opacity-60 rounded-lg p-4 w-44">
            <SearchWrapper graphRef={graphRef}/>
            <GraphMenuButtons graphRef={graphRef} initRotation={initRotation}/>
            {subContextNodes.size > 0 && <SubContextMapMenu/>}
        </div>
    );
};

export default GraphMenu;
