
import React, { useState, useEffect } from 'react';
import { Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PrintDebugPanel from './PrintDebugPanel';
import { attachDebuggerToWindow } from '@/utils/print-debug';

interface PrintDebugButtonProps {
  className?: string;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  iconOnly?: boolean;
  showLabel?: boolean;
}

const PrintDebugButton: React.FC<PrintDebugButtonProps> = ({
  className = '',
  buttonVariant = 'outline',
  iconOnly = false,
  showLabel = true
}) => {
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);

  // Attach debugger to window when component mounts
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      attachDebuggerToWindow();
    }
  }, []);

  const toggleDebugPanel = () => {
    setIsDebugPanelOpen(!isDebugPanelOpen);
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        onClick={toggleDebugPanel}
        className={`print:hidden ${iconOnly ? 'p-2' : ''} ${className}`}
        size={iconOnly ? 'icon' : 'default'}
      >
        <Bug className={`h-4 w-4 ${!iconOnly && showLabel ? 'mr-2' : ''}`} />
        {!iconOnly && showLabel && <span>Print Debug</span>}
      </Button>
      
      <PrintDebugPanel 
        visible={isDebugPanelOpen} 
        onClose={() => setIsDebugPanelOpen(false)} 
      />
    </>
  );
};

export default PrintDebugButton;
