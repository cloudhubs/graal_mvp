import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
interface ToggleSwitchProps {
    isChecked: boolean;
    handleClick: () => void;
    isDisabled: boolean;
    text: string;
  }

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    isChecked,
    isDisabled,
    handleClick,
    text,
}) => {
    // const [enabled, setEnabled] = useState(false);
    // const {showCodeCovereage, setStateVar} = useAppContext();
    // const setGraphData = (val: any) =>{setStateVar && setStateVar("graphData", {...val})}
    useEffect(()=>{
        console.log("isDisabled = ", isDisabled);
    }, [isDisabled]);
    useEffect(()=>{
        console.log("isDisabled on start = ", isDisabled);
    }, [])
    return (
        <div className="relative flex flex-col items-center justify-center">
            <div className="flex">
                <label className="inline-flex relative items-center mr-5">
                {!isDisabled && <>
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isChecked}
                            readOnly
                        />
                        <div
                            onClick={handleClick}

                            className="cursor-pointer w-11 h-6 bg-gray-200 rounded-full peer  peer-focus:ring-green-300  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"
                        ></div>              
                </>}
                    <span className="ml-2 text-xs font-medium text-gray-900">
                        {text}
                    </span>
                </label>
            </div>
        </div>
    );
}
export default ToggleSwitch;
