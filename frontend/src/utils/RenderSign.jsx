import React from 'react'
import { CplusplusOriginal, JavaOriginal, JavascriptOriginal, ReactOriginal, Html5Original, NodejsOriginal, PythonOriginal, TypescriptOriginal, UbuntuPlain, FastapiOriginal, DjangoPlain, FlaskOriginal, NextjsOriginal } from 'devicons-react';

const RenderSign = ({ language, size = 24 }) => {
    switch (language) {
        case "react":
        case "react-vite":
            return <ReactOriginal size={size} />
        case "html":
            return <Html5Original size={size} />
        case "node":
        case "express":
            return <NodejsOriginal size={size} />
        case "python":
            return <PythonOriginal size={size} />
        case "flask":
            return <FlaskOriginal size={size} />
        case "fastapi":
            return <FastapiOriginal size={size} />
        case "django":
            return <DjangoPlain size={size} />
        case "typescript":
            return <TypescriptOriginal size={size} />
        case "javascript":
            return <JavascriptOriginal size={size} />
        case "cpp":
        case "cpp-cmake":
            return <CplusplusOriginal size={size} />
        case "java":
        case "spring-boot":
            return <JavaOriginal size={size} />
        case "bare":
            return <UbuntuPlain size={size} />
        case 'nextjs':
            return <NextjsOriginal size={size} />

        default:
            return <NodejsOriginal size={size} />;
    }
}

export default RenderSign