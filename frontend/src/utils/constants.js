const frameworks = [
    // { value: "react", label: "React", language: "React", description: "Online React Editor and IDE: compile, run, and host React apps", tag: "websites" },
    { value: "python", label: "Python", language: "Python", description: "Online Python Editor and IDE: compile, run, and host Python apps", tag: "language" },
    { value: "javascript", label: "Javascript", language: "Javascript", description: "Online Javascript Editor and IDE: compile, run, and host Javascript apps", tag: "language" },
    { value: "typescript", label: "Typescript", language: "Typescript", description: "Online Typescript Editor and IDE: compile, run, and host Typescript apps", tag: "language" },
    { value: "cpp", label: "C++", language: "C++", description: "Online C++ Editor and IDE: compile, run, and host C++ apps", tag: "language" },
    { value: "java", label: "Java", language: "Java", description: "Online Java Editor and IDE: compile, run, and host Java apps", tag: "language" },
    { value: "flask", label: "Flask", language: "Python", description: "Lightweight Python web framework template", tag: "websites" },
    { value: "fastapi", label: "FastAPI", language: "Python", description: "Modern, high-performance Python web framework", tag: "websites" },
    { value: "django", label: "Django", language: "Python", description: "Full-featured Python web framework", tag: "websites" },
    { value: "express", label: "Express", language: "Javascript", description: "Standard Node.js web framework", tag: "websites" },
    { value: "react-vite", label: "React (Vite)", language: "Javascript", description: "Modern frontend development with Vite", tag: "websites" },
    { value: "spring-boot", label: "Spring Boot", language: "Java", description: "Enterprise Java framework", tag: "websites" },
    { value: "cpp-cmake", label: "C++ (CMake)", language: "C++", description: "Structured C++ project with CMake", tag: "language" },
    { value: "bare", label: "Bare Machine", language: "Ubuntu", description: "Minimal Ubuntu environment with basic build tools", tag: "language" },
]

const LANGUAGE_VERSIONS = {
    javascript: "24.0.0",
    typescript: "5.4.5",
    python: "3.9.19",
    java: "17.0.10",
    cpp: "14.2.0",
};

const CODE_SNIPPETS = {
    javascript: `function greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
    typescript: `type Params = {\n\tname: string;\n}\n\nfunction greet(data: Params) {\n\tconsole.log("Hello, " + data.name + "!");\n}\n\ngreet({ name: "Alex" });\n`,
    python: `def greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
    java: `public class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
    cpp: `#include <iostream>\n\nint main() {\n\tstd::cout << "Hello World in C++" << std::endl;\n\treturn 0;\n}\n`,
};


export { frameworks, LANGUAGE_VERSIONS, CODE_SNIPPETS };