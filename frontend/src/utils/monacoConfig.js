/**
 * Configures Monaco Editor language services for modern JS/TS environments.
 * This ensures modules like 'next/font/google' or '@/*' aliases are recognized.
 */
export const configureMonaco = (monaco) => {
  // 1. Set Compiler Options
  // These are global and will apply to all models in the editor
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    reactNamespace: 'React',
    allowJs: true,
    typeRoots: ["node_modules/@types"],
    // Path aliases for Next.js-like projects
    baseUrl: '.',
    paths: {
      "@/*": ["*"]
    }
  });

  // 2. Add Extra Libs (Shims)
  // This tells Monaco that these modules exist and what they export
  const extraLibs = [
    {
      content: `
        declare module 'next/font/google' {
          export function Inter(options?: any): any;
          export function Roboto(options?: any): any;
          export function Montserrat(options?: any): any;
          export function Open_Sans(options?: any): any;
          export function Lato(options?: any): any;
          export function Poppins(options?: any): any;
        }
      `,
      filePath: 'next-font.d.ts'
    },
    {
      content: `
        declare module 'next/link' {
          import React from 'react';
          export default function Link(props: any): React.ReactElement;
        }
      `,
      filePath: 'next-link.d.ts'
    },
    {
      content: `
        declare module 'next/image' {
          import React from 'react';
          export default function Image(props: any): React.ReactElement;
        }
      `,
      filePath: 'next-image.d.ts'
    },
    {
      content: `
        declare module 'react' {
          import * as React from 'react';
          export default React;
          export const useState: any;
          export const useEffect: any;
          export const useRef: any;
          export const useMemo: any;
          export const useCallback: any;
          export const createContext: any;
          export const useContext: any;
          export type ReactNode = any;
          export type FC<T = {}> = any;
        }
        declare module 'react/jsx-runtime' {
          export const jsx: any;
          export const jsxs: any;
          export const Fragment: any;
        }
        declare module 'react-dom' {
          export const render: any;
          export const createRoot: any;
        }
      `,
      filePath: 'react.d.ts'
    },
    {
        content: `
          declare module 'lucide-react' {
            import { FC, SVGProps } from 'react';
            export interface IconProps extends SVGProps<SVGSVGElement> {
              size?: string | number;
              color?: string;
              strokeWidth?: string | number;
            }
            export type Icon = FC<IconProps>;
            export const Files: Icon;
            export const Search: Icon;
            export const Settings: Icon;
            export const Check: Icon;
            export const X: Icon;
            // Add other lucide icons as needed, or export a catch-all
            export const [key: string]: Icon;
          }
        `,
        filePath: 'lucide.d.ts'
      }
  ];
  extraLibs.forEach(lib => {
    if (monaco.languages.typescript) {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(lib.content, lib.filePath);
      monaco.languages.typescript.javascriptDefaults.addExtraLib(lib.content, lib.filePath);
    }
  });

  // 3. Set JavaScript Defaults to match TypeScript
  if (monaco.languages.typescript) {
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
      checkJs: false, // Don't be too aggressive with errors in JS
    });
  }
};
