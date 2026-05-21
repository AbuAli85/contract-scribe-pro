
import React, { useState } from 'react';
import { Bug, Printer, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generatePrintDebugInfo, logPrintDebugInfo } from '@/utils/print-debug';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * A comprehensive tool for debugging print-related issues
 */
const PrintDebugTool: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState(generatePrintDebugInfo());
  const [activeTab, setActiveTab] = useState('browser');

  const refreshDebugInfo = () => {
    const info = generatePrintDebugInfo();
    setDebugInfo(info);
    console.log('Print debug info refreshed:', info);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      refreshDebugInfo();
    }
    setIsOpen(open);
  };

  const handleLogToConsole = () => {
    logPrintDebugInfo();
    console.log('Full debug info logged to console');
  };

  // Helper to determine status color
  const getStatusColor = (isGood: boolean) => {
    return isGood ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleOpenChange(true)}
        className="print:hidden flex items-center gap-2"
      >
        <Bug className="h-4 w-4" />
        <span>Print Debug</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" /> Print Debugging Tool
            </DialogTitle>
            <DialogDescription>
              Diagnose and fix printing issues in your contract documents
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="browser">Browser & Device</TabsTrigger>
              <TabsTrigger value="document">Document & Content</TabsTrigger>
              <TabsTrigger value="fixes">Common Fixes</TabsTrigger>
            </TabsList>

            <TabsContent value="browser" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Browser Information</CardTitle>
                  <CardDescription>Details about your current browser environment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">Browser:</div>
                    <div>{debugInfo.browser.name} {debugInfo.browser.version}</div>
                    <div className="text-sm font-medium">Engine:</div>
                    <div>{debugInfo.browser.engine}</div>
                    <div className="text-sm font-medium">Platform:</div>
                    <div>{debugInfo.system.platform}</div>
                    <div className="text-sm font-medium">Language:</div>
                    <div>{debugInfo.system.language}</div>
                    <div className="text-sm font-medium">Timezone:</div>
                    <div>{debugInfo.system.timezone}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Screen Information</CardTitle>
                  <CardDescription>Display and viewport details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">Viewport:</div>
                    <div>{debugInfo.screen.width} × {debugInfo.screen.height}</div>
                    <div className="text-sm font-medium">Screen Size:</div>
                    <div>{debugInfo.screen.availWidth} × {debugInfo.screen.availHeight}</div>
                    <div className="text-sm font-medium">Pixel Ratio:</div>
                    <div>{debugInfo.screen.pixelRatio}</div>
                    <div className="text-sm font-medium">Color Depth:</div>
                    <div>{debugInfo.screen.colorDepth} bits</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="document" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Print Container</CardTitle>
                  <CardDescription>Status of the print container element</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>Print Container Found:</div>
                    <Badge className={getStatusColor(debugInfo.document.printContainerFound)}>
                      {debugInfo.document.printContainerFound ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Elements Visible:</div>
                    <Badge className={getStatusColor(debugInfo.document.printableElementsVisible)}>
                      {debugInfo.document.printableElementsVisible ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Print Elements Count:</div>
                    <div>{debugInfo.document.printElementsCount}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stylesheets</CardTitle>
                  <CardDescription>CSS stylesheets for printing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>Print Media Stylesheets:</div>
                    <Badge className={getStatusColor(debugInfo.document.printMediaStylesheetsCount > 0)}>
                      {debugInfo.document.printMediaStylesheetsCount}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Total Stylesheets:</div>
                    <div>{debugInfo.document.cssStylesheetsCount}</div>
                  </div>
                  {debugInfo.document.printMediaStylesheetsCount === 0 && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>No Print Stylesheets</AlertTitle>
                      <AlertDescription>
                        No print-specific stylesheets were detected. This may cause printing issues.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Size</CardTitle>
                  <CardDescription>Current document dimensions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">Width:</div>
                    <div>{debugInfo.document.width}</div>
                    <div className="text-sm font-medium">Height:</div>
                    <div>{debugInfo.document.height}</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fixes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Common Print Issues</CardTitle>
                  <CardDescription>Fixes for frequent printing problems</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Missing Content</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      If parts of your content are missing when printing:
                    </p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      <li>Ensure all elements have <code>display: block !important</code> in print styles</li>
                      <li>Add <code>visibility: visible !important</code> to critical elements</li>
                      <li>Set <code>opacity: 1 !important</code> on all printable content</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Layout Issues</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      If your layout is breaking when printing:
                    </p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      <li>Set explicit widths for containers (e.g., <code>width: 210mm !important</code> for A4)</li>
                      <li>Use <code>page-break-inside: avoid !important</code> on critical sections</li>
                      <li>Apply <code>position: relative !important</code> to fix stacking context issues</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Browser-Specific</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      For browser-specific print issues:
                    </p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      <li>Chrome: Add <code>-webkit-print-color-adjust: exact !important</code></li>
                      <li>Firefox: Add <code>color-adjust: exact !important</code></li>
                      <li>Safari: Add both properties plus <code>print-color-adjust: exact !important</code></li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button onClick={refreshDebugInfo} variant="outline">
                  Refresh Debug Info
                </Button>
                <Button onClick={handleLogToConsole} variant="secondary">
                  Log Full Debug Info
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {debugInfo.errors.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Errors Detected</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2">
                  {debugInfo.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrintDebugTool;
