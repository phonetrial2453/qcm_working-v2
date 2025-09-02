import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings } from 'lucide-react';

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

interface ColumnVisibilityToggleProps {
  columns: ColumnConfig[];
  onToggle: (key: string) => void;
}

export const ColumnVisibilityToggle: React.FC<ColumnVisibilityToggleProps> = ({
  columns,
  onToggle,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Toggle Columns</h4>
          <div className="space-y-2">
            {columns.map((column) => (
              <div key={column.key} className="flex items-center space-x-2">
                <Checkbox
                  id={column.key}
                  checked={column.visible}
                  onCheckedChange={() => onToggle(column.key)}
                />
                <label
                  htmlFor={column.key}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {column.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};