import React from 'react'
import { CplusplusOriginal, JavaOriginal, JavascriptOriginal, ReactOriginal } from 'devicons-react';
import { Html5Original } from 'devicons-react';
import { NodejsOriginal } from 'devicons-react';
import { PythonOriginal } from 'devicons-react';
import { TypescriptOriginal } from 'devicons-react';


const RenderSign = ({ language,size =24 }) => {
    switch (language) {
        case "react":
            return <ReactOriginal size={size} />
        case "html":
            return <Html5Original size={size} />
        case "node":
            return <NodejsOriginal size={size} />
        case "python":
            return <PythonOriginal size={size} />
        case "typescript":
            return <TypescriptOriginal size={size} />
        case "javascript":
            return <JavascriptOriginal size={size} />
        case "cpp":
            return <CplusplusOriginal size={size} />
        case "java":
            return <JavaOriginal size={size} />

        default:
            return <div>Default Icon</div>;
            break;
    }

}

export default RenderSign