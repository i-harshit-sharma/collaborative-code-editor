import { useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../utils/constants";
import Output from "./Output";

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("javascript");

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (lang) => {
    setLanguage(lang);
    setValue(CODE_SNIPPETS[lang]);
  };

  return (
    <div className="p-0 md:p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2 flex flex-col">
          <LanguageSelector language={language} onSelect={onSelect} />
          <Editor
            options={{ 
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 10 }
            }}
            height="75vh"
            theme="vs-dark"
            language={language}
            defaultValue={CODE_SNIPPETS[language]}
            onMount={onMount}
            value={value}
            onChange={(val) => setValue(val)}
          />
        </div>
        <div className="w-full md:flex-1">
          <Output editorRef={editorRef} language={language} />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
