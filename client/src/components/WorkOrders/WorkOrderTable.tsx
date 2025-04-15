import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WorkOrderWithRelations } from "@shared/schema";
import { PencilIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import CreateWorkOrderForm from "@/components/WorkOrders/CreateWorkOrderForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface WorkOrderTableProps {
  onViewClick: (workOrder: WorkOrderWithRelations) => void;
  onEditClick: (workOrder: WorkOrderWithRelations) => void;
}

const WorkOrderTable: React.FC<WorkOrderTableProps> = ({ onViewClick, onEditClick }) => {
  const [page, setPage] = useState(1);
  const [dialogContent, setDialogContent] = useState<WorkOrderWithRelations | null>(null);
  const [dialogType, setDialogType] = useState<'view' | 'edit' | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: workOrders, isLoading, error } = useQuery<WorkOrderWithRelations[]>({
    queryKey: ['/api/work-orders?includeRelations=true'],
  });

  const handleViewClick = (workOrder: WorkOrderWithRelations) => {
    setDialogContent(workOrder);
    setDialogType('view');
    setDialogOpen(true);
    onViewClick(workOrder);
  };

  const handleEditClick = (workOrder: WorkOrderWithRelations) => {
    setDialogContent(workOrder);
    setDialogType('edit');
    setDialogOpen(true);
    onEditClick(workOrder);
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-red-500">Error loading work orders: {error.toString()}</p>
      </div>
    );
  }

  // Calculate pagination
  const itemsPerPage = 5;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil((workOrders?.length || 0) / itemsPerPage);
  const currentWorkOrders = workOrders?.slice(startIndex, endIndex) || [];

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Size</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentWorkOrders.map((workOrder) => (
              <tr key={workOrder.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">#{workOrder.workOrderNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{workOrder.product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{workOrder.batchSize} units</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {new Date(workOrder.startDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={workOrder.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{workOrder.operator.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button 
                    variant="link" 
                    className="text-primary hover:text-primary-dark mr-3"
                    onClick={() => handleViewClick(workOrder)}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {['planned', 'in_progress'].includes(workOrder.status) ? (
                    <Button 
                      variant="link" 
                      className="text-gray-600 hover:text-gray-900"
                      onClick={() => handleEditClick(workOrder)}
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  ) : (
                    <Button variant="link" className="text-gray-400 cursor-not-allowed" disabled>
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => setPage(page > 1 ? page - 1 : 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(endIndex, workOrders?.length || 0)}
                </span>{" "}
                of <span className="font-medium">{workOrders?.length || 0}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  onClick={() => setPage(page > 1 ? page - 1 : 1)}
                  disabled={page === 1}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
                {/* Page buttons */}
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "outline"}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === i + 1 
                        ? "z-10 bg-primary border-primary text-white"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                  disabled={page === totalPages}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog for View/Edit Work Order */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          {dialogContent && dialogType === 'view' && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Work Order Details</h2>
              <div className="rounded-md bg-gray-50 p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID:</span>
                  <span className="font-medium">#{dialogContent.workOrderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Product:</span>
                  <span className="font-medium">{dialogContent.product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Batch Size:</span>
                  <span className="font-medium">{dialogContent.batchSize} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Start Date:</span>
                  <span className="font-medium">{new Date(dialogContent.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <StatusBadge status={dialogContent.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Assigned To:</span>
                  <span className="font-medium">{dialogContent.operator.fullName}</span>
                </div>
                {dialogContent.notes && (
                  <div className="pt-2">
                    <span className="text-gray-500 block mb-1">Notes:</span>
                    <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">{dialogContent.notes}</p>
                  </div>
                )}
                {dialogContent.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">End Date:</span>
                    <span className="font-medium">{new Date(dialogContent.endDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button onClick={() => setDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
          {dialogContent && dialogType === 'edit' && (
            <div>
              <h2 className="text-lg font-medium">Edit Work Order</h2>
              <CreateWorkOrderForm 
                existingWorkOrder={dialogContent} 
                onSuccess={() => setDialogOpen(false)} 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkOrderTable;
