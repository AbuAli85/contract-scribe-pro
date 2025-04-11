
// Type definition for html2canvas
declare module 'html2canvas' {
  export interface Html2CanvasOptions {
    scale?: number;
    width?: number;
    height?: number;
    backgroundColor?: string;
    allowTaint?: boolean;
    useCORS?: boolean;
    logging?: boolean;
    foreignObjectRendering?: boolean;
    removeContainer?: boolean;
    imageTimeout?: number;
    ignoreElements?: (element: Element) => boolean;
    onclone?: (document: Document, element: HTMLElement) => void | Promise<void>;
  }

  export default function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions
  ): Promise<HTMLCanvasElement>;
}
