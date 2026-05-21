
/**
 * Browser Detector Utility
 * 
 * Utility for detecting browser information
 */

/**
 * Detects the browser and its version
 */
export const detectBrowser = (): { name: string; version: string; engine: string } => {
  const userAgent = navigator.userAgent;
  let name = "Unknown";
  let version = "Unknown";
  let engine = "Unknown";
  
  // Extract browser information
  if (userAgent.indexOf("Firefox") > -1) {
    name = "Firefox";
    engine = "Gecko";
    const match = userAgent.match(/Firefox\/([0-9.]+)/);
    if (match) version = match[1];
  } else if (userAgent.indexOf("Edg") > -1) {
    name = "Edge";
    engine = "Blink";
    const match = userAgent.match(/Edg\/([0-9.]+)/);
    if (match) version = match[1];
  } else if (userAgent.indexOf("Chrome") > -1) {
    name = "Chrome";
    engine = "Blink";
    const match = userAgent.match(/Chrome\/([0-9.]+)/);
    if (match) version = match[1];
  } else if (userAgent.indexOf("Safari") > -1) {
    name = "Safari";
    engine = "WebKit";
    const match = userAgent.match(/Version\/([0-9.]+)/);
    if (match) version = match[1];
  } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
    name = "Internet Explorer";
    engine = "Trident";
    const match = userAgent.match(/(?:MSIE |rv:)([0-9.]+)/);
    if (match) version = match[1];
  } else if (userAgent.indexOf("Opera") > -1) {
    name = "Opera";
    engine = "Presto";
    const match = userAgent.match(/(?:Opera|OPR)\/([0-9.]+)/);
    if (match) version = match[1];
  }
  
  return { name, version, engine };
};
