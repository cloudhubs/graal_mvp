/**
 * Authors: Vsevolod Pokhvalenko, and the MicroGraal Development Team
 */

import React from 'react';
import { Handle, Position } from '@xyflow/react';

const CustomNode = ({ data }) => {
    const { label, fields } = data;

    return (
        <div style={{ padding: '10px', border: '1px solid #777', borderRadius: '5px', backgroundColor: '#fff' }}>
            <Handle type="target" position={Position.Top} />
            <strong>{label}</strong>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                {fields && fields.length > 0 ? (
                    fields.map((field, index) => (
                        <li key={index}>
                            <span>{field.fieldName}:</span> <span>{field.fieldType}</span>
                        </li>
                    ))
                ) : (
                    <li>No Fields</li>
                )}
            </ul>
            <Handle type="source" position={Position.Bottom}/>
        </div>
    );
};


export default CustomNode;