import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { 
  insertBatchRecordSchema, 
  insertManufacturingStepSchema,
  insertQualityControlTestSchema,
  type WorkOrder, 
  type BatchRecordWithRelations 
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";

// Extend the batch record schema with additional validation
const batchRecordFormSchema = insertBatchRecordSchema.extend({
  workOrderId: z.number().min(1, { message: "Please select a work order" }),
  operatorId: z.number().min(1, { message: "Please select an operator" }),
  manufacturingSteps: z.array(
    z.object({
      name: z.string().min(1, { message: "Step name is required" }),
      description: z.string().optional(),
      sortOrder: z.number(),
      isCompleted: z.boolean().optional(),
      completedAt: z.date().optional().nullable(),
    })
  ).optional(),
  qualityControlTests: z.array(
    z.object({
      name: z.string().min(1, { message: "Test name is required" }),
      acceptableRange: z.string().optional(),
      result: z.string().optional(),
      isPassed: z.boolean().optional().nullable(),
    })
  ).optional(),
  isSubmitting: z.boolean().optional(),
});

// Type for form fields
type FormValues = z.infer<typeof batchRecordFormSchema>;

interface BatchRecordFormProps {
  existingBatchRecord?: BatchRecordWithRelations;
  onSuccess?: () => void;
}

const BatchRecordForm: React.FC<BatchRecordFormProps> = ({
  existingBatchRecord,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch work orders that don't have a batch record yet
  const { data: workOrders = [] } = useQuery<WorkOrder[]>({
    queryKey: ['/api/work-orders'],
  });

  // Filter out work orders that already have batch records if creating new
  const availableWorkOrders = existingBatchRecord 
    ? workOrders 
    : workOrders.filter(wo => 
        wo.status === 'planned' || wo.status === 'in_progress'
      );

  // Fetch operators (users with operator role) for dropdown
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });
  const operators = users.filter(user => user.role === 'operator');

  // Form steps management
  const defaultManufacturingSteps = [
    { name: 'Raw Material Preparation', description: 'Weigh and prepare all raw materials according to formula', sortOrder: 1, isCompleted: false, completedAt: null },
    { name: 'Oil Phase Mixing', description: 'Combine oil phase ingredients and heat to the required temperature', sortOrder: 2, isCompleted: false, completedAt: null },
    { name: 'Water Phase Preparation', description: 'Combine water phase ingredients and heat to the required temperature', sortOrder: 3, isCompleted: false, completedAt: null },
    { name: 'Emulsification', description: 'Add oil phase to water phase while mixing at high speed', sortOrder: 4, isCompleted: false, completedAt: null },
    { name: 'Cooling and Addition of Actives', description: 'Cool to appropriate temperature and add heat-sensitive ingredients', sortOrder: 5, isCompleted: false, completedAt: null },
    { name: 'Filling and Packaging', description: 'Fill product into containers and seal', sortOrder: 6, isCompleted: false, completedAt: null },
  ];

  // Default quality control tests
  const defaultQualityControlTests = [
    { name: 'pH Test', acceptableRange: '6.5-7.5', result: '', isPassed: null },
    { name: 'Viscosity Test', acceptableRange: '10,000-20,000 cP', result: '', isPassed: null },
    { name: 'Appearance', acceptableRange: 'White to off-white cream', result: '', isPassed: null },
    { name: 'Microbial Test', acceptableRange: 'No significant growth', result: '', isPassed: null },
  ];

  // Initialize manufacturing steps and QC tests from existing data or defaults
  const [manufacturingSteps, setManufacturingSteps] = useState<any[]>(() => {
    if (existingBatchRecord?.manufacturingSteps && existingBatchRecord.manufacturingSteps.length > 0) {
      return existingBatchRecord.manufacturingSteps.map(step => ({
        ...step,
        isCompleted: !!step.completedAt,
      }));
    }
    return defaultManufacturingSteps;
  });

  const [qualityControlTests, setQualityControlTests] = useState<any[]>(() => {
    if (existingBatchRecord?.qualityControlTests && existingBatchRecord.qualityControlTests.length > 0) {
      return existingBatchRecord.qualityControlTests;
    }
    return defaultQualityControlTests;
  });

  // Initialize form with existing values or defaults
  const form = useForm<FormValues>({
    resolver: zodResolver(batchRecordFormSchema),
    defaultValues: existingBatchRecord
      ? {
          workOrderId: existingBatchRecord.workOrderId,
          operatorId: existingBatchRecord.operatorId,
          batchNumber: existingBatchRecord.batchNumber,
          completionPercentage: existingBatchRecord.completionPercentage,
          isComplete: existingBatchRecord.isComplete,
          manufacturingSteps: manufacturingSteps.map(step => ({
            name: step.name,
            description: step.description || '',
            sortOrder: step.sortOrder,
            isCompleted: !!step.completedAt,
            completedAt: step.completedAt ? new Date(step.completedAt) : null,
          })),
          qualityControlTests: qualityControlTests.map(test => ({
            name: test.name,
            acceptableRange: test.acceptableRange || '',
            result: test.result || '',
            isPassed: test.isPassed,
          })),
          isSubmitting: false,
        }
      : {
          workOrderId: 0,
          operatorId: 0,
          batchNumber: '',
          completionPercentage: 0,
          isComplete: false,
          manufacturingSteps: defaultManufacturingSteps,
          qualityControlTests: defaultQualityControlTests,
          isSubmitting: false,
        },
  });

  // Create batch record mutation
  const createBatchRecordMutation = useMutation({
    mutationFn: async (data: Omit<FormValues, 'manufacturingSteps' | 'qualityControlTests' | 'isSubmitting'>) => {
      return apiRequest("POST", "/api/batch-records", data);
    },
    onSuccess: async (response) => {
      const batchRecord = await response.json();
      
      // Create manufacturing steps
      if (manufacturingSteps.length > 0) {
        for (const step of manufacturingSteps) {
          await apiRequest("POST", "/api/manufacturing-steps", {
            batchRecordId: batchRecord.id,
            name: step.name,
            description: step.description,
            sortOrder: step.sortOrder,
          });
        }
      }
      
      // Create quality control tests
      if (qualityControlTests.length > 0) {
        for (const test of qualityControlTests) {
          await apiRequest("POST", "/api/quality-control-tests", {
            batchRecordId: batchRecord.id,
            name: test.name,
            acceptableRange: test.acceptableRange,
            result: test.result || null,
          });
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/batch-records'] });
      queryClient.invalidateQueries({ queryKey: ['/api/work-orders'] });
      
      toast({
        title: "Batch Record Created",
        description: "Batch record has been successfully created.",
      });
      
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create batch record: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update batch record mutation
  const updateBatchRecordMutation = useMutation({
    mutationFn: async (data: { 
      batchRecordId: number, 
      updateData: Partial<FormValues>, 
      manufacturingStepUpdates?: any[],
      qualityControlTestUpdates?: any[],
      isSubmitting: boolean
    }) => {
      const { batchRecordId, updateData, manufacturingStepUpdates, qualityControlTestUpdates, isSubmitting } = data;
      
      // Update batch record
      const batchRecordResponse = await apiRequest(
        "PATCH", 
        `/api/batch-records/${batchRecordId}`, 
        {
          ...updateData,
          isComplete: isSubmitting ? true : updateData.isComplete,
          submittedAt: isSubmitting ? new Date() : null,
        }
      );
      
      // Update manufacturing steps if provided
      if (manufacturingStepUpdates) {
        for (const step of manufacturingStepUpdates) {
          if (step.id) {
            // Update existing step
            await apiRequest("PATCH", `/api/manufacturing-steps/${step.id}`, {
              completedAt: step.isCompleted ? new Date() : null,
              completedBy: updateData.operatorId,
            });
          }
        }
      }
      
      // Update quality control tests if provided
      if (qualityControlTestUpdates) {
        for (const test of qualityControlTestUpdates) {
          if (test.id) {
            // Update existing test
            await apiRequest("PATCH", `/api/quality-control-tests/${test.id}`, {
              result: test.result,
              isPassed: test.isPassed,
              completedAt: test.result ? new Date() : null,
              completedBy: updateData.operatorId,
            });
          }
        }
      }
      
      return batchRecordResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/batch-records'] });
      queryClient.invalidateQueries({ queryKey: ['/api/work-orders'] });
      
      toast({
        title: "Batch Record Updated",
        description: "Batch record has been successfully updated.",
      });
      
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update batch record: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Calculate completion percentage based on completed steps
  useEffect(() => {
    if (existingBatchRecord) {
      const completedSteps = manufacturingSteps.filter(step => step.isCompleted || step.completedAt).length;
      const totalSteps = manufacturingSteps.length;
      const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      
      form.setValue('completionPercentage', percentage);
    }
  }, [manufacturingSteps, existingBatchRecord, form]);

  // Add a new manufacturing step
  const addManufacturingStep = () => {
    const newStep = {
      name: '',
      description: '',
      sortOrder: manufacturingSteps.length + 1,
      isCompleted: false,
      completedAt: null,
    };
    
    setManufacturingSteps([...manufacturingSteps, newStep]);
    
    // Update form value
    const currentSteps = form.getValues('manufacturingSteps') || [];
    form.setValue('manufacturingSteps', [...currentSteps, newStep]);
  };

  // Remove a manufacturing step
  const removeManufacturingStep = (index: number) => {
    const updatedSteps = [...manufacturingSteps];
    updatedSteps.splice(index, 1);
    
    // Update sort orders
    updatedSteps.forEach((step, idx) => {
      step.sortOrder = idx + 1;
    });
    
    setManufacturingSteps(updatedSteps);
    
    // Update form value
    form.setValue('manufacturingSteps', updatedSteps);
  };

  // Add a new quality control test
  const addQualityControlTest = () => {
    const newTest = {
      name: '',
      acceptableRange: '',
      result: '',
      isPassed: null,
    };
    
    setQualityControlTests([...qualityControlTests, newTest]);
    
    // Update form value
    const currentTests = form.getValues('qualityControlTests') || [];
    form.setValue('qualityControlTests', [...currentTests, newTest]);
  };

  // Remove a quality control test
  const removeQualityControlTest = (index: number) => {
    const updatedTests = [...qualityControlTests];
    updatedTests.splice(index, 1);
    setQualityControlTests(updatedTests);
    
    // Update form value
    form.setValue('qualityControlTests', updatedTests);
  };

  // Handle step completion toggle
  const handleStepCompletion = (index: number, isCompleted: boolean) => {
    const updatedSteps = [...manufacturingSteps];
    updatedSteps[index].isCompleted = isCompleted;
    updatedSteps[index].completedAt = isCompleted ? new Date() : null;
    setManufacturingSteps(updatedSteps);
    
    // Update form
    const formSteps = form.getValues('manufacturingSteps') || [];
    formSteps[index].isCompleted = isCompleted;
    formSteps[index].completedAt = isCompleted ? new Date() : null;
    form.setValue('manufacturingSteps', formSteps);
  };

  // Handle test result update
  const handleTestResult = (index: number, result: string, isPassed: boolean | null) => {
    const updatedTests = [...qualityControlTests];
    updatedTests[index].result = result;
    updatedTests[index].isPassed = isPassed;
    setQualityControlTests(updatedTests);
    
    // Update form
    const formTests = form.getValues('qualityControlTests') || [];
    formTests[index].result = result;
    formTests[index].isPassed = isPassed;
    form.setValue('qualityControlTests', formTests);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      if (existingBatchRecord) {
        // Get isSubmitting value and remove from data
        const isSubmitting = !!data.isSubmitting;
        const { manufacturingSteps: stepData, qualityControlTests: testData, isSubmitting: _submitting, ...updateData } = data;
        
        await updateBatchRecordMutation.mutateAsync({
          batchRecordId: existingBatchRecord.id,
          updateData,
          manufacturingStepUpdates: manufacturingSteps,
          qualityControlTestUpdates: qualityControlTests,
          isSubmitting
        });
      } else {
        // Remove additional fields that aren't part of the batch record
        const { manufacturingSteps: _steps, qualityControlTests: _tests, isSubmitting: _submitting, ...createData } = data;
        
        await createBatchRecordMutation.mutateAsync(createData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="workOrderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Order</FormLabel>
                  <Select
                    disabled={!!existingBatchRecord || isSubmitting}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a work order" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Select a work order</SelectItem>
                      {availableWorkOrders.map((workOrder) => (
                        <SelectItem key={workOrder.id} value={workOrder.id.toString()}>
                          #{workOrder.workOrderNumber} - {workOrders.find(w => w.id === workOrder.productId)?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="operatorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operator</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an operator" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Select an operator</SelectItem>
                      {operators.map((operator) => (
                        <SelectItem key={operator.id} value={operator.id.toString()}>
                          {operator.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {existingBatchRecord && (
            <div className="space-y-2">
              <Label>Batch Number</Label>
              <Input value={existingBatchRecord.batchNumber} readOnly disabled />
              
              <div className="mt-4">
                <Label>Completion Progress</Label>
                <div className="mt-2">
                  <Progress value={form.watch('completionPercentage')} className="h-2 mt-2" />
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>0%</span>
                    <span>{form.watch('completionPercentage')}% Complete</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Manufacturing Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Manufacturing Steps</span>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addManufacturingStep}
                disabled={isSubmitting}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {manufacturingSteps.map((step, index) => (
                <div key={index} className="p-4 border rounded-md relative">
                  <div className="absolute right-2 top-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeManufacturingStep(index)}
                      disabled={isSubmitting || manufacturingSteps.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div className="space-y-2">
                      <Label htmlFor={`step-name-${index}`}>Step Name</Label>
                      <Input
                        id={`step-name-${index}`}
                        value={step.name}
                        onChange={(e) => {
                          const updatedSteps = [...manufacturingSteps];
                          updatedSteps[index].name = e.target.value;
                          setManufacturingSteps(updatedSteps);
                        }}
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`step-description-${index}`}>Description</Label>
                      <Textarea
                        id={`step-description-${index}`}
                        value={step.description || ''}
                        onChange={(e) => {
                          const updatedSteps = [...manufacturingSteps];
                          updatedSteps[index].description = e.target.value;
                          setManufacturingSteps(updatedSteps);
                        }}
                        disabled={isSubmitting}
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox
                      id={`step-completed-${index}`}
                      checked={step.isCompleted || !!step.completedAt}
                      onCheckedChange={(checked) => handleStepCompletion(index, !!checked)}
                      disabled={isSubmitting}
                    />
                    <Label 
                      htmlFor={`step-completed-${index}`}
                      className={`${
                        step.isCompleted || step.completedAt ? 'line-through text-gray-500' : ''
                      }`}
                    >
                      Mark as completed
                    </Label>
                    
                    {(step.isCompleted || step.completedAt) && (
                      <span className="text-xs text-gray-500 ml-2">
                        Completed {step.completedAt ? new Date(step.completedAt).toLocaleDateString() : "just now"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Quality Control Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Quality Control Tests</span>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addQualityControlTest}
                disabled={isSubmitting}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Test
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {qualityControlTests.map((test, index) => (
                <div key={index} className="p-4 border rounded-md relative">
                  <div className="absolute right-2 top-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQualityControlTest(index)}
                      disabled={isSubmitting || qualityControlTests.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`test-name-${index}`}>Test Name</Label>
                      <Input
                        id={`test-name-${index}`}
                        value={test.name}
                        onChange={(e) => {
                          const updatedTests = [...qualityControlTests];
                          updatedTests[index].name = e.target.value;
                          setQualityControlTests(updatedTests);
                        }}
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`test-range-${index}`}>Acceptable Range</Label>
                      <Input
                        id={`test-range-${index}`}
                        value={test.acceptableRange || ''}
                        onChange={(e) => {
                          const updatedTests = [...qualityControlTests];
                          updatedTests[index].acceptableRange = e.target.value;
                          setQualityControlTests(updatedTests);
                        }}
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`test-result-${index}`}>Result</Label>
                      <Input
                        id={`test-result-${index}`}
                        value={test.result || ''}
                        onChange={(e) => {
                          handleTestResult(index, e.target.value, test.isPassed);
                        }}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  {test.result && (
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`test-pass-${index}`}
                          checked={test.isPassed === true}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleTestResult(index, test.result, true);
                            } else {
                              handleTestResult(index, test.result, null);
                            }
                          }}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor={`test-pass-${index}`}>Pass</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`test-fail-${index}`}
                          checked={test.isPassed === false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleTestResult(index, test.result, false);
                            } else {
                              handleTestResult(index, test.result, null);
                            }
                          }}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor={`test-fail-${index}`}>Fail</Label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Submission Options */}
        {existingBatchRecord && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-submitting"
              checked={form.watch('isSubmitting')}
              onCheckedChange={(checked) => {
                form.setValue('isSubmitting', !!checked);
              }}
              disabled={isSubmitting}
            />
            <Label htmlFor="is-submitting" className="font-medium">
              Mark as complete and submit for quality review
            </Label>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              if (onSuccess) onSuccess();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : existingBatchRecord ? "Update Batch Record" : "Create Batch Record"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BatchRecordForm;
