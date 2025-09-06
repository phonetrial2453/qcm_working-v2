
import React from "react";
import ValidationWarnings from "./ValidationWarnings";
import PreviewFields from "./PreviewFields";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { validateReferrerDetails } from '@/utils/applicationValidation';
import { useDuplicateCheck } from '@/hooks/useDuplicateCheck';
import { DuplicateWarning } from './DuplicateWarning';

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
  const { checkForDuplicates } = useDuplicateCheck();
  const [duplicates, setDuplicates] = React.useState<any[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = React.useState(false);

  // Check for duplicates when component mounts or data changes
  React.useEffect(() => {
    const checkDuplicates = async () => {
      if (parsedData?.studentDetails?.mobile) {
        setIsCheckingDuplicates(true);
        const duplicateResults = await checkForDuplicates(
          parsedData.studentDetails.mobile,
          parsedData.otherDetails?.email
        );
        setDuplicates(duplicateResults);
        setIsCheckingDuplicates(false);
      }
    };

    checkDuplicates();
  }, [parsedData, checkForDuplicates]);

  // Get referrer validation warnings
  const referrerWarnings = validateReferrerDetails(parsedData);
  return (
    <div>
      <PreviewFields data={parsedData} />
      <div className="pt-4">
        <ValidationWarnings warnings={validationResult.warnings} />
      </div>

      {/* Referrer Details Warnings */}
      {referrerWarnings.length > 0 && (
        <div className="border border-red-200 bg-red-50 p-4 rounded-md mt-4">
          <h4 className="text-red-800 font-medium mb-2">Missing Referrer Details</h4>
          <ul className="space-y-1">
            {referrerWarnings.map((warning, index) => (
              <li key={index} className="text-red-700 text-sm">
                • {warning.message}
              </li>
            ))}
          </ul>
          <p className="text-red-600 text-xs mt-2">
            You can still submit, but providing complete referrer details is recommended.
          </p>
        </div>
      )}

      {/* Duplicate Detection Warning */}
      {isCheckingDuplicates && (
        <div className="text-center py-2 text-muted-foreground mt-4">
          Checking for duplicate entries...
        </div>
      )}
      <DuplicateWarning duplicates={duplicates} />

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
