
import { X, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { documentSystem, type AttachedDocument } from "@/lib/documents";
import { useToast } from "@/hooks/use-toast";

interface DocumentItemProps {
  document: AttachedDocument;
  onDelete: () => Promise<void>;
  onUpdate: () => Promise<void>;
}

export function DocumentItem({ document, onDelete, onUpdate }: DocumentItemProps) {
  const { toast } = useToast();

  const handleDeleteDocument = async () => {
    // Use an alert dialog instead of window.confirm in a real application
    const confirmed = window.confirm("Are you sure you want to delete this document?");
    if (confirmed) {
      const success = await documentSystem.deleteDocument(document.id);
      if (success) {
        await onDelete();
        toast({
          title: "Document deleted",
          description: "The document has been removed from the contract",
        });
      }
    }
  };

  const handleTogglePrintInclusion = async () => {
    const updatedDoc = await documentSystem.togglePrintInclusion(document.id);
    if (updatedDoc) {
      await onUpdate();

      toast({
        title: updatedDoc.includeInPrint ? "Document included in print" : "Document excluded from print",
        description: updatedDoc.includeInPrint
          ? "This document will be included when printing"
          : "This document will not be included when printing",
      });
    }
  };

  return (
    <Card className={document.includeInPrint ? "" : "opacity-70"}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{document.name}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDeleteDocument}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {document.description && <CardDescription>{document.description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mt-2 border rounded-md overflow-hidden h-32 bg-muted/20 flex items-center justify-center">
          {document.file.startsWith("data:image") ? (
            <img
              src={document.file}
              alt={document.name}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center gap-1"
          onClick={handleTogglePrintInclusion}
        >
          {document.includeInPrint ? (
            <>
              <Check className="h-4 w-4" />
              Include in print
            </>
          ) : (
            <>
              <X className="h-4 w-4" />
              Excluded from print
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
