import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FilterIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import QCReviewForm from "@/components/QualityControl/QCReviewForm";
import { BatchRecordWithRelations } from "@shared/schema";

const QualityControl = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedBatchRecord, setSelectedBatchRecord] = useState<BatchRecordWithRelations | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  // Fetch batch records pending review
  const { data: pendingReviews, isLoading: pendingLoading } = useQuery<BatchRecordWithRelations[]>({
    queryKey: ['/api/quality-reviews', { pending: true }],
  });

  // Fetch quality reviews (approved and rejected)
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['/api/quality-reviews', { includeRelations: true }],
  });

  // Filter reviews by decision
  const approvedReviews = reviews?.filter(review => review.decision === 'approve') || [];
  const rejectedReviews = reviews?.filter(review => review.decision === 'reject') || [];

  const handleReviewClick = (batchRecord: BatchRecordWithRelations) => {
    setSelectedBatchRecord(batchRecord);
    setReviewDialogOpen(true);
  };

  const renderPendingReviewsTable = () => {
    if (pendingLoading) {
      return (
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      );
    }

    if (!pendingReviews || pendingReviews.length === 0) {
      return (
        <div className="p-8 text-center">
          <p className="text-gray-500">No batch records pending review.</p>
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Order</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingReviews.map((batchRecord) => {
                const submissionDate = batchRecord.submittedAt ? new Date(batchRecord.submittedAt) : null;
                // Determine priority based on batch size or submission date
                const priority = batchRecord.workOrder.batchSize > 300 ? 'High' : 
                                 batchRecord.workOrder.batchSize > 200 ? 'Medium' : 'Low';
                
                return (
                  <tr key={batchRecord.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      #{batchRecord.workOrder.workOrderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {batchRecord.workOrder.product?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {batchRecord.operator.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {submissionDate ? submissionDate.toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        priority === 'High' ? 'bg-red-100 text-red-800' :
                        priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        onClick={() => handleReviewClick(batchRecord)}
                        className="bg-primary hover:bg-primary-dark text-white"
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReviewsTable = (reviews: any[], status: string) => {
    if (reviewsLoading) {
      return (
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      );
    }

    if (!reviews || reviews.length === 0) {
      return (
        <div className="p-8 text-center">
          <p className="text-gray-500">No {status.toLowerCase()} batch records found.</p>
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Order</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed By</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Decision</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review) => {
                const reviewDate = review.reviewedAt ? new Date(review.reviewedAt) : null;
                
                return (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      #{review.batchRecord.workOrder.workOrderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {review.batchRecord.workOrder.product?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {review.reviewer.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {reviewDate ? reviewDate.toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={review.decision === 'approve' ? 'approved' : 'rejected'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="outline" className="text-primary hover:text-primary-dark">
                        View Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header section with title and action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Quality Control</h2>
        <div className="flex space-x-3">
          <Button variant="outline" className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
            <FilterIcon className="h-5 w-5 mr-2" />
            <span>Filter</span>
          </Button>
          <Button variant="outline" className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
            <Upload className="h-5 w-5 mr-2" />
            <span>Export</span>
          </Button>
        </div>
      </div>
      
      {/* QC Review Tabs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200">
            <TabsList className="w-full justify-start border-b-0">
              <TabsTrigger value="pending" className="flex-1 py-4 px-1 data-[state=active]:border-primary data-[state=active]:text-primary">
                Pending Review ({pendingReviews?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex-1 py-4 px-1 data-[state=active]:border-primary data-[state=active]:text-primary">
                Approved ({approvedReviews.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex-1 py-4 px-1 data-[state=active]:border-primary data-[state=active]:text-primary">
                Rejected ({rejectedReviews.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1 py-4 px-1 data-[state=active]:border-primary data-[state=active]:text-primary">
                All Records
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="pending">
            {renderPendingReviewsTable()}
          </TabsContent>
          
          <TabsContent value="approved">
            {renderReviewsTable(approvedReviews, 'Approved')}
          </TabsContent>
          
          <TabsContent value="rejected">
            {renderReviewsTable(rejectedReviews, 'Rejected')}
          </TabsContent>
          
          <TabsContent value="all">
            {/* Combine all reviews for the "All" tab */}
            {renderReviewsTable([...(pendingReviews || []), ...approvedReviews, ...rejectedReviews], 'All')}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* QC Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <h2 className="text-lg leading-6 font-medium text-gray-900">
            Quality Control Review - {selectedBatchRecord?.workOrder.workOrderNumber}
          </h2>
          {selectedBatchRecord && (
            <QCReviewForm 
              batchRecord={selectedBatchRecord} 
              onSuccess={() => setReviewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QualityControl;
