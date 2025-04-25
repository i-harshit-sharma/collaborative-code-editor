const frameworks = [
    // { value: "react", label: "React", language: "React", description: "Online React Editor and IDE: compile, run, and host React apps", tag: "websites" },
    { value: "python", label: "Python", language: "Python", description: "Online Python Editor and IDE: compile, run, and host Python apps", tag: "language" },
    { value: "node", label: "Node", language: "Node", description: "Nodejs is an open-source, cross-platform, back-end JavaScript runtime environment.", tag: "language" },
    // { value: "javascript", label: "Javascript", language: "Javascript", description: "Online Javascript Editor and IDE: compile, run, and host Javascript apps", tag: "language" },
    // { value: "typescript", label: "Typescript", language: "Typescript", description: "Online Typescript Editor and IDE: compile, run, and host Typescript apps", tag: "websites" },
    // { value: "html", label: "HTML, CSS, JS", language: "HTML", description: "Online HTML, CSS, JS Editor and IDE: compile, run, and host HTML, CSS, JS apps", tag: "websites" },
    { value: "cpp", label: "C++", language: "C++", description: "Online C++ Editor and IDE: compile, run, and host C++ apps", tag: "language" },
    // { value: "java", label: "Java", language: "Java", description: "Online Java Editor and IDE: compile, run, and host Java apps", tag: "language" },
]

const LANGUAGE_VERSIONS = {
    javascript: "18.15.0",
    typescript: "5.0.3",
    python: "3.10.0",
    java: "15.0.2",
    csharp: "6.12.0",
    cpp: "10.2.0",
};

const CODE_SNIPPETS = {
    javascript: `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
    typescript: `\ntype Params = {\n\tname: string;\n}\n\nfunction greet(data: Params) {\n\tconsole.log("Hello, " + data.name + "!");\n}\n\ngreet({ name: "Alex" });\n`,
    python: `\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
    java: `\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
    csharp:
        'using System;\n\nnamespace HelloWorld\n{\n\tclass Hello { \n\t\tstatic void Main(string[] args) {\n\t\t\tConsole.WriteLine("Hello World in C#");\n\t\t}\n\t}\n}\n',
    cpp: `\n#include <iostream>\n\nint main() {\n\tstd::cout << "Hello World in C++" << std::endl;\n\treturn 0;\n}\n`,
};


export { frameworks, LANGUAGE_VERSIONS, CODE_SNIPPETS };