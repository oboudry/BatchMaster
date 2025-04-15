import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { insertWorkOrderSchema, type Product, type User, type WorkOrderWithRelations } from "@shared/schema";
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

// Extend the work order schema with some additional validation
const workOrderFormSchema = insertWorkOrderSchema.extend({
  productId: z.number().min(1, { message: "Please select a product" }),
  assignedOperatorId: z.number().min(1, { message: "Please select an operator" }),
  batchSize: z.number().min(1, { message: "Batch size must be at least 1" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
});

// Type for form fields
type FormValues = z.infer<typeof workOrderFormSchema>;

interface CreateWorkOrderFormProps {
  existingWorkOrder?: WorkOrderWithRelations;
  onSuccess?: () => void;
}

const CreateWorkOrderForm: React.FC<CreateWorkOrderFormProps> = ({
  existingWorkOrder,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch products for dropdown
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Fetch operators (users with operator role) for dropdown
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  const operators = users.filter(user => user.role === 'operator');

  // Initialize form with existing values or defaults
  const form = useForm<FormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: existingWorkOrder
      ? {
          productId: existingWorkOrder.productId,
          batchSize: existingWorkOrder.batchSize,
          assignedOperatorId: existingWorkOrder.assignedOperatorId,
          startDate: existingWorkOrder.startDate ? new Date(existingWorkOrder.startDate).toISOString().split('T')[0] : '',
          notes: existingWorkOrder.notes || '',
        }
      : {
          productId: 0,
          batchSize: 0,
          assignedOperatorId: 0,
          startDate: new Date().toISOString().split('T')[0],
          notes: '',
        },
  });

  // Create work order mutation
  const createWorkOrderMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Convert string date to ISO date format
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate)
      };
      
      return apiRequest("POST", "/api/work-orders", formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-orders'] });
      toast({
        title: "Work Order Created",
        description: "Work order has been successfully created.",
      });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create work order: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update work order mutation
  const updateWorkOrderMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!existingWorkOrder) throw new Error("No work order to update");
      
      // Only include fields that are editable
      const updatableData = {
        assignedOperatorId: data.assignedOperatorId,
        notes: data.notes
      };
      
      return apiRequest("PATCH", `/api/work-orders/${existingWorkOrder.id}`, updatableData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-orders'] });
      toast({
        title: "Work Order Updated",
        description: "Work order has been successfully updated.",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update work order: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      if (existingWorkOrder) {
        await updateWorkOrderMutation.mutateAsync(data);
      } else {
        await createWorkOrderMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Select
                disabled={!!existingWorkOrder || isSubmitting}
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">Select a product</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
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
          name="batchSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Batch Size</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  disabled={!!existingWorkOrder || isSubmitting}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignedOperatorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned Operator</FormLabel>
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

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  disabled={!!existingWorkOrder || isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  disabled={isSubmitting}
                  placeholder="Add any additional notes here..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            {isSubmitting ? "Saving..." : existingWorkOrder ? "Update Work Order" : "Create Work Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateWorkOrderForm;
