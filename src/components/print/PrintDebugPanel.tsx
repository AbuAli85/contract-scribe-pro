import React, { useState, useEffect } from 'react';
import { X, Bug, Info, AlertTriangle, CheckCircle, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  generatePrintDebugInfo, 
  logPrintDebugInfo,
  PrintDebugPanelProps 
} from '@/utils/print-debug';
import { useToast } from '@/hooks/use-toast';

const PrintDebugPanel: React.FC<PrintDebugPanelProps> = ({ 
  visible = false,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const [debugInfo, setDebugInfo] = useState<ReturnType<typeof generatePrintDebugInfo> | null>(null);
  const [activeTab, setActiveTab] = useState<'browser' | 'document' | 'system'>('browser');
  const { toast } = useToast();

  useEffect(() => {
    setIsVisible(visible);
    if (visible && !debugInfo) {
      refreshDebugInfo();
    }
  }, [visible]);

  const refreshDebugInfo = () => {
    const info = generatePrintDebugInfo();
    setDebugInfo(info);
    console.log('Print debug info refreshed:', info);
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const copyToClipboard = () => {
    if (!debugInfo) return;
    
    try {
      const debugText = JSON.stringify(debugInfo, null, 2);
      navigator.clipboard.writeText(debugText).then(() => {
        toast({
          title: "Debug info copied",
          description: "Print debug information has been copied to clipboard",
        });
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy debug information to clipboard",
        variant: "destructive",
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 right-0 h-screen w-96 bg-white shadow-xl z-50 border-l border-gray-200 overflow-hidden flex flex-col print:hidden">
      <div className="flex items-center justify-between p-4 border-b bg-slate-50">
        <div className="flex items-center">
          <Bug className="h-5 w-5 mr-2 text-blue-500" />
          <h2 className="font-semibold text-lg">Print Debugger</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={refreshDebugInfo}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex border-b">
        <button
          className={`flex-1 py-2 px-4 font-medium text-sm ${activeTab === 'browser' ? 'border-b-2 border-blue-500 text-blue-700' : 'text-gray-600'}`}
          onClick={() => setActiveTab('browser')}
        >
          Browser
        </button>
        <button
          className={`flex-1 py-2 px-4 font-medium text-sm ${activeTab === 'document' ? 'border-b-2 border-blue-500 text-blue-700' : 'text-gray-600'}`}
          onClick={() => setActiveTab('document')}
        >
          Document
        </button>
        <button
          className={`flex-1 py-2 px-4 font-medium text-sm ${activeTab === 'system' ? 'border-b-2 border-blue-500 text-blue-700' : 'text-gray-600'}`}
          onClick={() => setActiveTab('system')}
        >
          System
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {!debugInfo ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading debug information...</p>
          </div>
        ) : (
          <>
            {activeTab === 'browser' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-1 text-blue-500" />
                    Browser Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Name:</div>
                    <div>{debugInfo.browser.name}</div>
                    <div className="text-gray-600">Version:</div>
                    <div>{debugInfo.browser.version}</div>
                    <div className="text-gray-600">Engine:</div>
                    <div>{debugInfo.browser.engine}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-1 text-blue-500" />
                    Screen Information
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Window Size:</div>
                    <div>{debugInfo.screen.width} x {debugInfo.screen.height}</div>
                    <div className="text-gray-600">Screen Size:</div>
                    <div>{debugInfo.screen.availWidth} x {debugInfo.screen.availHeight}</div>
                    <div className="text-gray-600">Pixel Ratio:</div>
                    <div>{debugInfo.screen.pixelRatio}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-1 text-blue-500" />
                    Font Information
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Fonts Loaded:</div>
                    <div>{debugInfo.fonts.loaded ? 'Yes' : 'No'}</div>
                    <div className="text-gray-600">Font Families:</div>
                    <div>{debugInfo.fonts.usedFontsCount}</div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'document' && (
              <div className="space-y-4">
                <div className={`p-3 rounded-md ${debugInfo.document.printContainerFound ? 'bg-green-50' : 'bg-red-50'}`}>
                  <h3 className="font-medium mb-2 flex items-center">
                    {debugInfo.document.printContainerFound ? (
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                    )}
                    Print Container
                  </h3>
                  <div className="text-sm">
                    {debugInfo.document.printContainerFound ? (
                      <p className="text-green-700">Print container found in document</p>
                    ) : (
                      <p className="text-red-700">No print container found! Add a div with class="print-container"</p>
                    )}
                  </div>
                </div>
                
                <div className={`p-3 rounded-md ${debugInfo.document.printableElementsVisible ? 'bg-green-50' : 'bg-red-50'}`}>
                  <h3 className="font-medium mb-2 flex items-center">
                    {debugInfo.document.printableElementsVisible ? (
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                    )}
                    Element Visibility
                  </h3>
                  <div className="text-sm">
                    {debugInfo.document.printableElementsVisible ? (
                      <p className="text-green-700">All critical print elements are visible</p>
                    ) : (
                      <p className="text-red-700">Some critical print elements are hidden or missing</p>
                    )}
                    <p className="mt-1 text-gray-600">Print Elements Count: {debugInfo.document.printElementsCount}</p>
                  </div>
                </div>
                
                <div className={`p-3 rounded-md ${debugInfo.document.printMediaStylesheetsCount > 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                  <h3 className="font-medium mb-2 flex items-center">
                    {debugInfo.document.printMediaStylesheetsCount > 0 ? (
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                    )}
                    Print Stylesheets
                  </h3>
                  <div className="text-sm">
                    {debugInfo.document.printMediaStylesheetsCount > 0 ? (
                      <p className="text-green-700">Print stylesheets found: {debugInfo.document.printMediaStylesheetsCount}</p>
                    ) : (
                      <p className="text-yellow-700">No print stylesheets found! This may cause printing issues.</p>
                    )}
                    <p className="mt-1 text-gray-600">Total Stylesheets: {debugInfo.document.cssStylesheetsCount}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-1 text-blue-500" />
                    Document Dimensions
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Width:</div>
                    <div>{debugInfo.document.width}</div>
                    <div className="text-gray-600">Height:</div>
                    <div>{debugInfo.document.height}</div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'system' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-1 text-blue-500" />
                    System Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Platform:</div>
                    <div>{debugInfo.system.platform}</div>
                    <div className="text-gray-600">Language:</div>
                    <div>{debugInfo.system.language}</div>
                    <div className="text-gray-600">Timezone:</div>
                    <div>{debugInfo.system.timezone}</div>
                    {debugInfo.system.deviceMemory && (
                      <>
                        <div className="text-gray-600">Memory:</div>
                        <div>{debugInfo.system.deviceMemory}GB</div>
                      </>
                    )}
                    <div className="text-gray-600">Cookies:</div>
                    <div>{debugInfo.system.cookiesEnabled ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </div>
                
                {debugInfo.errors.length > 0 && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <h3 className="font-medium mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                      Errors Detected
                    </h3>
                    <ul className="text-sm space-y-1 text-red-700">
                      {debugInfo.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-1 text-blue-500" />
                    User Agent
                  </h3>
                  <div className="text-sm break-words">
                    <code className="text-xs bg-gray-100 p-2 block rounded">{debugInfo.browser.userAgent}</code>
                  </div>
                </div>
              </div>
            )}
            
            {debugInfo.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-md">
                <h3 className="font-medium text-red-800 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {debugInfo.errors.length} Error{debugInfo.errors.length > 1 ? 's' : ''} Detected
                </h3>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="border-t p-3">
        <Button onClick={logPrintDebugInfo} variant="outline" className="w-full">
          <Bug className="h-4 w-4 mr-2" />
          Log Full Debug Info to Console
        </Button>
      </div>
    </div>
  );
};

export default PrintDebugPanel;
