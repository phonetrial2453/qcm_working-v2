
import React from "react";
import ValidationWarnings from "./ValidationWarnings";
import PreviewFields from "./PreviewFields";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ApplicationPreviewProps {
  parsedData: any;
  validationResult: {
    valid: boolean;
    warnings: { field: string; message: string }[];
  };
  onSubmit: () => void;
  isSubmitting: boolean;
  selectedClassCode: string;
}

const ApplicationPreview: React.FC<ApplicationPreviewProps> = ({
  parsedData,
  validationResult,
  onSubmit,
  isSubmitting,
  selectedClassCode,
}) => {
  return (
    <div>
      <PreviewFields data={parsedData} />
      <div className="pt-4">
        <ValidationWarnings warnings={validationResult.warnings} />
      </div>
      <div className="flex justify-end w-full mt-4">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || !selectedClassCode || !parsedData}
          className="px-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ApplicationPreview;
