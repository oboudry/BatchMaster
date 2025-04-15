import { useState } from "react";
import { EyeIcon, PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { BatchRecordWithRelations } from "@shared/schema";

interface BatchRecordCardProps {
  batchRecord: BatchRecordWithRelations;
  onViewClick: () => void;
  onUpdateClick: () => void;
}

const BatchRecordCard: React.FC<BatchRecordCardProps> = ({
  batchRecord,
  onViewClick,
  onUpdateClick
}) => {
  // Get status from work order
  const status = batchRecord.workOrder.status;
  
  // Format date
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-800">#{batchRecord.workOrder.workOrderNumber}</h3>
          <p className="text-sm text-gray-500">{batchRecord.workOrder.product?.name}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Operator:</div>
          <div className="text-sm font-medium text-gray-800">{batchRecord.operator.fullName}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Start Date:</div>
          <div className="text-sm font-medium text-gray-800">{formatDate(batchRecord.workOrder.startDate)}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Batch Size:</div>
          <div className="text-sm font-medium text-gray-800">{batchRecord.workOrder.batchSize} units</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Completion:</div>
          <div className="w-full ml-4">
            <Progress value={batchRecord.completionPercentage} className="h-2" />
            <div className="text-xs text-right mt-1 text-gray-500">{batchRecord.completionPercentage}% complete</div>
          </div>
        </div>
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
        <Button 
          variant="link" 
          className="text-primary hover:text-primary-dark text-sm font-medium"
          onClick={onViewClick}
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          View Details
        </Button>
        {!batchRecord.isComplete ? (
          <Button 
            variant="link" 
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            onClick={onUpdateClick}
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Update Record
          </Button>
        ) : (
          <Button 
            variant="link" 
            className="text-gray-400 cursor-not-allowed text-sm font-medium"
            disabled
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Update Record
          </Button>
        )}
      </div>
    </div>
  );
};

export default BatchRecordCard;
