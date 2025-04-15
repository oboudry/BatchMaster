import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { 
  insertQualityReviewSchema,
  type BatchRecordWithRelations,
  type User 
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";

// Extend the quality review schema with additional validation
const qcReviewFormSchema = insertQualityReviewSchema.extend({
  decision: z.enum(['approve', 'reject', 'hold'], {
    required_error: "Please select a decision",
  }),
  comments: z.string().min(1, { message: "Comments are required" }),
});

// Type for form fields
type FormValues = z.infer<typeof qcReviewFormSchema>;

interface QCReviewFormProps {
  batchRecord: BatchRecordWithRelations;
  onSuccess?: () => void;
}

const QCReviewForm: React.FC<QCReviewFormProps> = ({
  batchRecord,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Get current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/current-user'],
  });

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(qcReviewFormSchema),
    defaultValues: {
      batchRecordId: batchRecord.id,
      reviewerId: currentUser?.id || 0,
      decision: undefined,
      comments: '',
    },
  });

  // Create quality review mutation
  const createQualityReviewMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return apiRequest("POST", "/api/quality-reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quality-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/batch-records'] });
      
      toast({
        title: "Quality Review Submitted",
        description: "Your decision has been recorded.",
      });
      
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit quality review: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Ensure reviewer ID is set to current user
      if (currentUser) {
        data.reviewerId = currentUser.id;
      }
      
      await createQualityReviewMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format completion date
  const formatDate = (date: string | Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  // Calculate number of passed tests
  const passedTests = batchRecord.qualityControlTests?.filter(test => test.isPassed === true).length || 0;
  const totalTests = batchRecord.qualityControlTests?.length || 0;
  const failedTests = batchRecord.qualityControlTests?.filter(test => test.isPassed === false).length || 0;

  return (
    <div className="space-y-5">
      <div className="mt-2">
        <p className="text-sm text-gray-500">
          {batchRecord.workOrder.product?.name} - Submitted by {batchRecord.operator.fullName} on {formatDate(batchRecord.submittedAt)}
        </p>
      </div>
      
      <div className="mt-4 border-t border-gray-200 pt-4">
        <h4 className="text-md font-medium text-gray-900">Batch Record Details</h4>
        
        <div className="mt-4 bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Batch Size:</p>
              <p className="text-sm font-medium">{batchRecord.workOrder.batchSize} units</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Manufacturing Date:</p>
              <p className="text-sm font-medium">{formatDate(batchRecord.workOrder.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completion Date:</p>
              <p className="text-sm font-medium">{formatDate(batchRecord.submittedAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Batch Number:</p>
              <p className="text-sm font-medium">{batchRecord.batchNumber}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h5 className="text-sm font-medium text-gray-900">Manufacturing Steps</h5>
          <div className="mt-2 space-y-3">
            {batchRecord.manufacturingSteps?.map((step) => (
              <div key={step.id} className="flex items-start">
                <div className="flex-shrink-0">
                  {step.completedAt ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{step.name}</p>
                  {step.description && (
                    <p className="text-xs text-gray-500">{step.description}</p>
                  )}
                  {step.completedAt && step.completedBy && (
                    <p className="text-xs text-gray-500">
                      Completed by {batchRecord.operator.fullName} at{" "}
                      {new Date(step.completedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <h5 className="text-sm font-medium text-gray-900">Quality Control Tests</h5>
          <div className="mt-2 space-y-3">
            {batchRecord.qualityControlTests?.map((test) => (
              <div key={test.id} className="flex items-start">
                <div className="flex-shrink-0">
                  {test.isPassed === true ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : test.isPassed === false ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="ml-3 w-full">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">{test.name}</p>
                    {test.isPassed !== null && (
                      <StatusBadge status={test.isPassed ? 'approved' : 'rejected'} />
                    )}
                  </div>
                  {test.acceptableRange && (
                    <p className="text-xs text-gray-500">Acceptable Range: {test.acceptableRange}</p>
                  )}
                  {test.result && (
                    <p className="text-xs text-gray-500">Result: {test.result}</p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Test Summary */}
            <div className="bg-gray-50 p-2 rounded mt-2">
              <p className="text-sm">
                <span className="font-medium">Test Summary: </span>
                <span className="text-green-600">{passedTests} passed</span>
                {failedTests > 0 && <span className="text-red-600"> · {failedTests} failed</span>}
                {totalTests - passedTests - failedTests > 0 && 
                  <span className="text-gray-500"> · {totalTests - passedTests - failedTests} not evaluated</span>
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quality Control Comments</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add your quality evaluation comments here..."
                    rows={4}
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="decision"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Decision</FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a decision" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="approve">Approve</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                    <SelectItem value="hold">Hold for Further Testing</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Submitting..." : "Submit Decision"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onSuccess?.()}
              disabled={isSubmitting}
              className="mt-3 sm:mt-0 sm:mr-3 w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default QCReviewForm;
