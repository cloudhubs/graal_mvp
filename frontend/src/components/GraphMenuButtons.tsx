import { saveAs } from "file-saver";
import React, { useState, useEffect, useRef } from "react";
import { handleComparison, initCoords } from "../utils/GraphFunctions";
import GraphButton from "./GraphButton"
import { NODE_A_COLOR, NODE_B_COLOR } from "./CommunicationGraph";
import { ViewMode, useAppContext } from "../context/AppContext";
import { initCoords as GLOBAL_INIT_COORDS } from "../utils/GraphFunctions";
import ToggleSwitch from "./ToggleSwitch";

/**
 * Buttons to interact with the force graph.
 *
 * @param {Object} props The props passed to this object
 * @param {React.MutableRefObject<import("react-force-graph-3d").ForceGraphMethods>} props.graphRef Reference to the internal force graph to access methods/camera
 * @returns {React.Component} The buttons
 */

type Props = {
    graphRef: any;
    initRotation: any;
};

const GraphMenuButtons: React.FC<Props> = ({
    graphRef,
    // initCoords,
    initRotation,
}) => {
    let [numScreenshots, setNumScreenshots] = useState(0);
    const versionObj = {
        A: null,
        A_Name: null,
        B: null,
        B_Name: null
    }
    
    const [versions, setVersions] = useState(versionObj);
    const [isCompareOpen, setIsCompareOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {graphData, viewMode, showCodeCoverage, codeCoveragePossible, initCoords, setStateVar} = useAppContext();
    const setGraphData = (val: any) =>{setStateVar && setStateVar("graphData", {...val})}
    const setShowCodeCovereage = (val: boolean)=>{setStateVar && setStateVar("showCodeCoverage", val)}

    function exportGraph() {
        exportToJsonFile(graphData);
    }

    function replacer(key: any, value: any) {
        if (key === "__threeObj") return undefined;
        else if (key === "__lineObj") return undefined;
        else if (key === "__arrowObj") return undefined;
        else if (key === "__curve") return undefined;
        else if (key === "index") return undefined;
        else if (key === "source") return value.id;
        else if (key === "target") return value.id;
        else return value;
    }

    function exportToJsonFile(jsonData: any) {
        let dataStr = JSON.stringify(
            Object.assign({}, jsonData, graphRef.current.cameraPosition()),
            replacer
        );

        //let dataStr2 = JSON.stringify(Graph.cameraPosition());
        let dataUri =
            "data:application/json;charset=utf-8," +
            encodeURIComponent(dataStr);

        let exportFileDefaultName = "data-out.json";

        let linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();
    }
    function delay(time: any) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    function importGraph() {
        let input = document.createElement("input");
        input.type = "file";

        input.onchange = (e: any) => {
            let file = e.target.files[0];

            // setting up the reader
            let reader = new FileReader();
            reader.readAsText(file, "UTF-8");

            // here we tell the reader what to do when it's done reading...
            reader.onload = (readerEvent: any) => {
                let content = readerEvent.target.result; // this is the content!
                let parsedData = JSON.parse(content);
                setGraphData(parsedData);
                graphRef.current.cameraPosition(
                    { x: parsedData.x, y: parsedData.y, z: parsedData.z }, // new position
                    { x: 0, y: 0, z: 0 }, //parsedData.lookAt, // lookAt ({ x, y, z })
                    0 // ms transition duration
                );
                // delay(150).then(() => {
                //     reset(graphRef);
                // });
            };
        };

        input.click();
    }
    //camera doesn't move bruh lol
    function forceReset() {
        graphRef.current.refresh();
        console.log(graphRef);
        graphRef.current.cameraPosition(
            initCoords,
            { x: 0, y: 0, z: 0 }, // lookAt ({ x, y, z })
            2000 // ms transition duration
        );
        
    }

    function screenshotGraph() {
        const now = new Date();
        window.requestAnimationFrame(() => {
            window.cancelAnimationFrame(0);
            graphRef.current.renderer().domElement.toBlob(function (blob: any) {
                saveAs(
                    blob,
                    `3d_Visualizer_${now.toLocaleDateString()}-${numScreenshots}}`
                );
            });
            setNumScreenshots(++numScreenshots);
        });
    }

    function handleCompareClick() {
        setIsCompareOpen(!isCompareOpen);
    }
    function handleCompareSubmitClick() {
        setGraphData(handleComparison(versions));
    }

    function readFile(fileV: string){
        let input = document.createElement("input");
        input.type = "file";

        input.onchange = (e: any) => {
            let file = e.target.files[0];
            // setting up the reader
            let reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            // here we tell the reader what to do when it's done reading...
            reader.onload = (readerEvent: any) => {
                let content = readerEvent.target.result; // this is the content!
                let parsedData = JSON.parse(content);
                setVersions(prevVersions => ({
                    ...prevVersions,
                    [fileV]: parsedData,
                    [fileV + "_Name"]: file.name
                }));
            };
        };
        input.click();
    }

    function handleCCToggleClick(){
        setShowCodeCovereage(!showCodeCoverage);
        console.log("click toggle");
    }
    // useEffect(()=>{
    //     console.log("ccp = ", codeCoveragePossible);
    // }, [codeCoveragePossible]);

    return (
        <div className="flex flex-col gap-2 w-full h-fit">
            {viewMode === ViewMode.CommGraph && 
                <ToggleSwitch isChecked= {showCodeCoverage} handleClick = {handleCCToggleClick} isDisabled = {!codeCoveragePossible} text={codeCoveragePossible ? "Code Cov." : "Code Cov. Disabled"}/> //codeCoveragePossible is NOT-ed because if its true, disabled should be false, vice-verse
            }
            <GraphButton onClick={importGraph}>Import</GraphButton>
            <GraphButton onClick={exportGraph}>Export</GraphButton>
            <GraphButton onClick={screenshotGraph}>Capture Graph</GraphButton>
            <GraphButton onClick={handleCompareClick} className="">
                <div className="relative">
                    <div className="flex flex-row">
                        <div className="w-full">Compare</div>
                        <svg
                            className={`h-5 w-5 absolute right-0 transition duration-300 ${isCompareOpen ? "transform rotate-180":""}`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
            </GraphButton>
            {(isCompareOpen) &&
                <div className="bg-sky-700 flex flex-col items-center space-y-3 py-2 rounded-xl text-white drop-shadow-lg">
                    <div className="flex flex-col items-center">
                    <button className="bg-sky-100 rounded-lg px-4 hover:bg-opacity-50 text-black border-2 border-slate-500"
                        onClick={()=>{readFile("A");}}>
                        Import A
                    </button>
                     <div className="flex flex-row">
                            <p style={{color: NODE_A_COLOR}}>File A: {versions.A ? String(versions.A_Name) : " not selected"}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <button className="bg-sky-100 rounded-lg px-4 hover:bg-opacity-50 text-black border-2 border-slate-500"
                            onClick={()=>{readFile("B");}}>
                            Import B
                        </button>
                        <div className="flex flex-row">
                            <p style={{color: NODE_B_COLOR}}>File B: {versions.B ? String(versions.B_Name) : " not selected"}</p>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <button onClick={handleCompareSubmitClick} disabled={versions.A == null || versions.B == null}
                            className={`bg-sky-100 rounded-lg px-4 text-black border-2 border-slate-500 ${(versions.A !== null && versions.B !== null )? "hover:bg-opacity-50":"bg-opacity-50"}`}
                        >Submit</button>
                        {(versions.A !== null && versions.B !== null) &&
                            <button onClick={()=>{
                                setVersions(versionObj);
                            }}
                                className={`bg-sky-100 rounded-lg px-5 text-black border-2 border-slate-500 hover:bg-opacity-50`}
                            >
                                Reset
                            </button>
                        }
                        <span className="ml-4 text-xs">Note: purple links indicate a change within</span>
                    </div>

                </div>
            }
            <div style={{ fontSize: 'smaller', fontStyle: 'italic' }}> Note: Right click on a node for sub context map</div>
            {/* <GraphButton onClick={forceReset}>Reset</GraphButton> */}

        </div>
    );
};

export default GraphMenuButtons;
