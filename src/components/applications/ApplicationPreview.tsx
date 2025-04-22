
import React from "react";
import ValidationWarnings from "./ValidationWarnings";
import PreviewFields from "./PreviewFields";
import { Button } from "@/components/ui/button";

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
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </div>
  );
};

export default ApplicationPreview;
