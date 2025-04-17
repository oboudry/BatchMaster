import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import BatchRecordCard from "@/components/BatchRecords/BatchRecordCard";
import BatchRecordForm from "@/components/BatchRecords/BatchRecordForm";
import { BatchRecordWithRelations } from "@shared/schema";

const BatchRecords = () => {
  const [newBatchRecordDialogOpen, setNewBatchRecordDialogOpen] = useState(false);
  const [viewBatchRecordDialogOpen, setViewBatchRecordDialogOpen] = useState(false);
  const [editBatchRecordDialogOpen, setEditBatchRecordDialogOpen] = useState(false);
  const [selectedBatchRecord, setSelectedBatchRecord] = useState<BatchRecordWithRelations | null>(null);
  
  // Filters
  const [workOrderFilter, setWorkOrderFilter] = useState("");
  const [completionStatusFilter, setCompletionStatusFilter] = useState("");
  const [operatorFilter, setOperatorFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  
  // Fetch batch records with relations
  const { data: batchRecords, isLoading, error } = useQuery<BatchRecordWithRelations[]>({
    queryKey: ['/api/batch-records?includeRelations=true'],
  });
  
  // Fetch work orders for dropdown
  const { data: workOrders } = useQuery({
    queryKey: ['/api/work-orders'],
  });
  
  // Fetch operators for dropdown
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });
  const operators = users?.filter(user => user.role === 'operator') || [];

  // Handle view batch record
  const handleViewBatchRecord = (batchRecord: BatchRecordWithRelations) => {
    setSelectedBatchRecord(batchRecord);
    setViewBatchRecordDialogOpen(true);
  };

  // Handle update batch record
  const handleUpdateBatchRecord = (batchRecord: BatchRecordWithRelations) => {
    setSelectedBatchRecord(batchRecord);
    setEditBatchRecordDialogOpen(true);
  };
  
  // Filter batch records
  const filteredBatchRecords = batchRecords?.filter(record => {
    // Apply work order filter
    if (workOrderFilter && record.workOrder.workOrderNumber !== workOrderFilter) {
      return false;
    }
    
    // Apply completion status filter
    if (completionStatusFilter) {
      if (completionStatusFilter === 'complete' && !record.isComplete) {
        return false;
      }
      if (completionStatusFilter === 'incomplete' && record.isComplete) {
        return false;
      }
      if (completionStatusFilter === 'in-progress' && 
          (record.isComplete || record.completionPercentage === 0)) {
        return false;
      }
    }
    
    // Apply operator filter
    if (operatorFilter && record.operator.id.toString() !== operatorFilter) {
      return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const workOrderNumber = record.workOrder.workOrderNumber.toLowerCase();
      const batchNumber = record.batchNumber.toLowerCase();
      const productName = record.workOrder.product?.name.toLowerCase() || '';
      
      return workOrderNumber.includes(query) || batchNumber.includes(query) || productName.includes(query);
    }
    
    return true;
  }) || [];
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredBatchRecords.length / itemsPerPage);
  const paginatedBatchRecords = filteredBatchRecords.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header section with title and "New Batch Record" button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Batch Records</h2>
        <Dialog open={newBatchRecordDialogOpen} onOpenChange={setNewBatchRecordDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-dark">
              <PlusIcon className="h-5 w-5 mr-2" />
              <span>New Batch Record</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl max-h-[95vh] overflow-y-auto">
            <DialogTitle>Create New Batch Record</DialogTitle>
            <div className="mt-4">
              <BatchRecordForm onSuccess={() => setNewBatchRecordDialogOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Label htmlFor="workOrderFilter" className="block text-sm font-medium text-gray-700 mb-1">Work Order</Label>
            <Select value={workOrderFilter} onValueChange={setWorkOrderFilter}>
              <SelectTrigger id="workOrderFilter">
                <SelectValue placeholder="All Work Orders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Work Orders</SelectItem>
                {workOrders?.map(wo => (
                  <SelectItem key={wo.id} value={wo.workOrderNumber}>
                    #{wo.workOrderNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <Label htmlFor="completionStatusFilter" className="block text-sm font-medium text-gray-700 mb-1">Completion Status</Label>
            <Select value={completionStatusFilter} onValueChange={setCompletionStatusFilter}>
              <SelectTrigger id="completionStatusFilter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <Label htmlFor="operatorFilter" className="block text-sm font-medium text-gray-700 mb-1">Operator</Label>
            <Select value={operatorFilter} onValueChange={setOperatorFilter}>
              <SelectTrigger id="operatorFilter">
                <SelectValue placeholder="All Operators" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Operators</SelectItem>
                {operators.map(op => (
                  <SelectItem key={op.id} value={op.id.toString()}>
                    {op.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <Label htmlFor="batchRecordSearch" className="block text-sm font-medium text-gray-700 mb-1">Search</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="batchRecordSearch"
                className="pl-10"
                placeholder="Search batch records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Batch Records Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow animate-pulse">
              <div className="h-[200px]"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-red-500">Error loading batch records.</p>
        </div>
      ) : paginatedBatchRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBatchRecords.map((batchRecord) => (
            <BatchRecordCard
              key={batchRecord.id}
              batchRecord={batchRecord}
              onViewClick={() => handleViewBatchRecord(batchRecord)}
              onUpdateClick={() => handleUpdateBatchRecord(batchRecord)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No batch records found matching your filters.</p>
        </div>
      )}
      
      {/* Pagination */}
      {filteredBatchRecords.length > itemsPerPage && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 sm:px-6 rounded-lg shadow">
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
                Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(page * itemsPerPage, filteredBatchRecords.length)}
                </span>{" "}
                of <span className="font-medium">{filteredBatchRecords.length}</span> results
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
                {/* Page numbers */}
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
      )}
      
      {/* View Batch Record Dialog */}
      <Dialog open={viewBatchRecordDialogOpen} onOpenChange={setViewBatchRecordDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[95vh] overflow-y-auto">
          {selectedBatchRecord && (
            <div className="space-y-4">
              <DialogTitle>Batch Record Details</DialogTitle>
              <div className="rounded-md bg-gray-50 p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Work Order:</span>
                  <span className="font-medium">#{selectedBatchRecord.workOrder.workOrderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Product:</span>
                  <span className="font-medium">{selectedBatchRecord.workOrder.product?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Batch Number:</span>
                  <span className="font-medium">{selectedBatchRecord.batchNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Operator:</span>
                  <span className="font-medium">{selectedBatchRecord.operator.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Start Date:</span>
                  <span className="font-medium">{new Date(selectedBatchRecord.workOrder.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Completion:</span>
                  <span className="font-medium">{selectedBatchRecord.completionPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium">
                    {selectedBatchRecord.isComplete ? 'Complete' : 'In Progress'}
                  </span>
                </div>
                {selectedBatchRecord.submittedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Submitted:</span>
                    <span className="font-medium">
                      {new Date(selectedBatchRecord.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Manufacturing Steps */}
              {selectedBatchRecord.manufacturingSteps && selectedBatchRecord.manufacturingSteps.length > 0 && (
                <div>
                  <h3 className="text-md font-medium mb-2">Manufacturing Steps</h3>
                  <div className="space-y-2">
                    {selectedBatchRecord.manufacturingSteps.map((step) => (
                      <div key={step.id} className="bg-white border rounded-md p-3">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            {step.completedAt ? (
                              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{step.name}</p>
                            {step.description && (
                              <p className="text-xs text-gray-500">{step.description}</p>
                            )}
                            {step.completedAt && (
                              <p className="text-xs text-gray-500">
                                Completed at {new Date(step.completedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Control Tests */}
              {selectedBatchRecord.qualityControlTests && selectedBatchRecord.qualityControlTests.length > 0 && (
                <div>
                  <h3 className="text-md font-medium mb-2">Quality Control Tests</h3>
                  <div className="space-y-2">
                    {selectedBatchRecord.qualityControlTests.map((test) => (
                      <div key={test.id} className="bg-white border rounded-md p-3">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            {test.isPassed === true ? (
                              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : test.isPassed === false ? (
                              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{test.name}</p>
                            {test.acceptableRange && (
                              <p className="text-xs text-gray-500">Acceptable Range: {test.acceptableRange}</p>
                            )}
                            {test.result && (
                              <p className="text-xs text-gray-500">Result: {test.result}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Review if available */}
              {selectedBatchRecord.qualityReview && (
                <div>
                  <h3 className="text-md font-medium mb-2">Quality Review</h3>
                  <div className="bg-white border rounded-md p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Decision:</span>
                        <span className={`font-medium ${
                          selectedBatchRecord.qualityReview.decision === 'approve' ? 'text-green-600' :
                          selectedBatchRecord.qualityReview.decision === 'reject' ? 'text-red-600' : 'text-amber-600'
                        }`}>
                          {selectedBatchRecord.qualityReview.decision.charAt(0).toUpperCase() + 
                           selectedBatchRecord.qualityReview.decision.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reviewed by:</span>
                        <span className="font-medium">
                          {users?.find(u => u.id === selectedBatchRecord.qualityReview!.reviewerId)?.fullName || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reviewed at:</span>
                        <span className="font-medium">
                          {new Date(selectedBatchRecord.qualityReview.reviewedAt!).toLocaleString()}
                        </span>
                      </div>
                      {selectedBatchRecord.qualityReview.comments && (
                        <div>
                          <span className="text-gray-500 block">Comments:</span>
                          <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                            {selectedBatchRecord.qualityReview.comments}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button onClick={() => setViewBatchRecordDialogOpen(false)}>Close</Button>
                {!selectedBatchRecord.isComplete && (
                  <Button 
                    variant="default" 
                    onClick={() => {
                      setViewBatchRecordDialogOpen(false);
                      setSelectedBatchRecord(selectedBatchRecord);
                      setEditBatchRecordDialogOpen(true);
                    }}
                  >
                    Update Record
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Batch Record Dialog */}
      <Dialog open={editBatchRecordDialogOpen} onOpenChange={setEditBatchRecordDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[95vh] overflow-y-auto">
          <DialogTitle>Update Batch Record</DialogTitle>
          <div className="mt-4">
            {selectedBatchRecord && (
              <BatchRecordForm 
                existingBatchRecord={selectedBatchRecord} 
                onSuccess={() => setEditBatchRecordDialogOpen(false)} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BatchRecords;
