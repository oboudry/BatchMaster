import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertWorkOrderSchema, 
  insertBatchRecordSchema,
  insertManufacturingStepSchema,
  insertQualityControlTestSchema,
  insertQualityReviewSchema,
  insertActivityLogSchema,
  workOrderStatusEnum,
  qcDecisionEnum,
  priorityLevelEnum
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiPrefix = '/api';

  // Helper function to handle errors
  const handleError = (res: Response, error: any) => {
    console.error("API Error:", error);
    const status = error.status || 500;
    const message = error.message || "Internal Server Error";
    res.status(status).json({ error: message });
  };

  // Current user (for demo purposes, we're setting a default user)
  app.get(`${apiPrefix}/current-user`, async (req: Request, res: Response) => {
    try {
      // For demo purposes, return the Sara Williams user (QC role)
      const user = await storage.getUserByUsername('sara.williams');
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Users routes
  app.get(`${apiPrefix}/users`, async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get(`${apiPrefix}/users/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Products routes
  app.get(`${apiPrefix}/products`, async (req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Work Orders routes
  app.get(`${apiPrefix}/work-orders`, async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string;
      
      if (status && workOrderStatusEnum.enumValues.includes(status as any)) {
        const workOrders = await storage.getWorkOrdersByStatus(status);
        return res.json(workOrders);
      }
      
      // If we need to get work orders with their relations
      if (req.query.includeRelations === 'true') {
        const workOrders = await storage.getWorkOrdersWithRelations();
        return res.json(workOrders);
      }
      
      const workOrders = await storage.getWorkOrders();
      res.json(workOrders);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get(`${apiPrefix}/work-orders/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid work order ID" });
      }

      // If we need to get work order with its relations
      if (req.query.includeRelations === 'true') {
        const workOrder = await storage.getWorkOrderWithRelations(id);
        if (!workOrder) {
          return res.status(404).json({ error: "Work order not found" });
        }
        return res.json(workOrder);
      }

      const workOrder = await storage.getWorkOrder(id);
      if (!workOrder) {
        return res.status(404).json({ error: "Work order not found" });
      }

      res.json(workOrder);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post(`${apiPrefix}/work-orders`, async (req: Request, res: Response) => {
    try {
      // Validate request body against the schema
      const validatedData = insertWorkOrderSchema.parse(req.body);
      
      // Generate a new work order number in format WO-YYYY-XXX
      const year = new Date().getFullYear();
      const existingWorkOrders = await storage.getWorkOrders();
      const lastWorkOrderNum = existingWorkOrders.length > 0 
        ? parseInt(existingWorkOrders[existingWorkOrders.length - 1].workOrderNumber.split('-')[2])
        : 0;
      const newWorkOrderNum = `WO-${year}-${(lastWorkOrderNum + 1).toString().padStart(3, '0')}`;
      
      // Create the work order
      const workOrder = await storage.createWorkOrder({
        ...validatedData,
        workOrderNumber: newWorkOrderNum
      });
      
      // Log the activity
      await storage.createActivityLog({
        userId: validatedData.assignedOperatorId,
        activityType: 'work_order_created',
        entityId: workOrder.id,
        entityType: 'work_order',
        details: `Work order #${workOrder.workOrderNumber} created`
      });
      
      res.status(201).json(workOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid work order data", details: error.errors });
      }
      handleError(res, error);
    }
  });

  app.patch(`${apiPrefix}/work-orders/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid work order ID" });
      }

      const existingWorkOrder = await storage.getWorkOrder(id);
      if (!existingWorkOrder) {
        return res.status(404).json({ error: "Work order not found" });
      }

      // Only allow updating certain fields
      const allowedUpdates = ['status', 'notes', 'endDate', 'assignedOperatorId'];
      const updates: Record<string, any> = {};
      
      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      }
      
      // If status is being updated, validate it's a valid status
      if (updates.status && !workOrderStatusEnum.enumValues.includes(updates.status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      
      const updatedWorkOrder = await storage.updateWorkOrder(id, updates);
      
      // Log status change if it happened
      if (updates.status && updates.status !== existingWorkOrder.status) {
        await storage.createActivityLog({
          userId: 1, // Assuming the current user for demo
          activityType: 'work_order_status_changed',
          entityId: id,
          entityType: 'work_order',
          details: `Work order #${existingWorkOrder.workOrderNumber} status changed to ${updates.status}`
        });
      }
      
      res.json(updatedWorkOrder);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Batch Records routes
  app.get(`${apiPrefix}/batch-records`, async (req: Request, res: Response) => {
    try {
      // If we need to get batch records with their relations
      if (req.query.includeRelations === 'true') {
        const batchRecords = await storage.getBatchRecordsWithRelations();
        return res.json(batchRecords);
      }
      
      const batchRecords = await storage.getBatchRecords();
      res.json(batchRecords);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get(`${apiPrefix}/batch-records/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid batch record ID" });
      }

      // If we need to get batch record with its relations
      if (req.query.includeRelations === 'true') {
        const batchRecord = await storage.getBatchRecordWithRelations(id);
        if (!batchRecord) {
          return res.status(404).json({ error: "Batch record not found" });
        }
        return res.json(batchRecord);
      }

      const batchRecord = await storage.getBatchRecord(id);
      if (!batchRecord) {
        return res.status(404).json({ error: "Batch record not found" });
      }

      res.json(batchRecord);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get(`${apiPrefix}/work-orders/:workOrderId/batch-record`, async (req: Request, res: Response) => {
    try {
      const workOrderId = parseInt(req.params.workOrderId);
      if (isNaN(workOrderId)) {
        return res.status(400).json({ error: "Invalid work order ID" });
      }

      const batchRecord = await storage.getBatchRecordByWorkOrderId(workOrderId);
      if (!batchRecord) {
        return res.status(404).json({ error: "Batch record not found for this work order" });
      }

      // If we need to get batch record with its relations
      if (req.query.includeRelations === 'true') {
        const batchRecordWithRelations = await storage.getBatchRecordWithRelations(batchRecord.id);
        if (batchRecordWithRelations) {
          return res.json(batchRecordWithRelations);
        }
      }

      res.json(batchRecord);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post(`${apiPrefix}/batch-records`, async (req: Request, res: Response) => {
    try {
      // Validate request body against the schema
      const validatedData = insertBatchRecordSchema.parse(req.body);
      
      // Check if work order exists
      const workOrder = await storage.getWorkOrder(validatedData.workOrderId);
      if (!workOrder) {
        return res.status(404).json({ error: "Work order not found" });
      }
      
      // Check if batch record already exists for this work order
      const existingBatchRecord = await storage.getBatchRecordByWorkOrderId(validatedData.workOrderId);
      if (existingBatchRecord) {
        return res.status(409).json({ error: "Batch record already exists for this work order" });
      }
      
      // Generate batch number based on product, year, work order, and batch size
      const product = await storage.getProduct(workOrder.productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      const productPrefix = product.name.split(' ')[0].substring(0, 2).toUpperCase();
      const year = new Date().getFullYear().toString().slice(-2);
      const workOrderNum = workOrder.workOrderNumber.split('-')[2];
      const batchSize = workOrder.batchSize;
      
      const batchNumber = `${productPrefix}-${year}-${workOrderNum}-${batchSize}`;
      
      // Create the batch record
      const batchRecord = await storage.createBatchRecord({
        ...validatedData,
        batchNumber,
        isComplete: false,
        completionPercentage: 0
      });
      
      // Update work order status to in_progress if it's in planned state
      if (workOrder.status === 'planned') {
        await storage.updateWorkOrder(workOrder.id, { status: 'in_progress' });
      }
      
      // Log the activity
      await storage.createActivityLog({
        userId: validatedData.operatorId,
        activityType: 'batch_record_created',
        entityId: batchRecord.id,
        entityType: 'batch_record',
        details: `New batch record created for #${workOrder.workOrderNumber}`
      });
      
      res.status(201).json(batchRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid batch record data", details: error.errors });
      }
      handleError(res, error);
    }
  });

  app.patch(`${apiPrefix}/batch-records/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid batch record ID" });
      }

      const existingBatchRecord = await storage.getBatchRecord(id);
      if (!existingBatchRecord) {
        return res.status(404).json({ error: "Batch record not found" });
      }

      // Only allow updating certain fields
      const allowedUpdates = ['completionPercentage', 'isComplete', 'submittedAt'];
      const updates: Record<string, any> = {};
      
      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      }
      
      // If batch is being marked as complete
      if (updates.isComplete && !existingBatchRecord.isComplete) {
        updates.completionPercentage = 100; // Ensure 100% when complete
        
        // If submittedAt is not provided, set it to now
        if (!updates.submittedAt) {
          updates.submittedAt = new Date();
        }
        
        // Update work order status to under_review
        const workOrder = await storage.getWorkOrder(existingBatchRecord.workOrderId);
        if (workOrder) {
          await storage.updateWorkOrder(workOrder.id, { status: 'under_review' });
          
          // Log the activity
          await storage.createActivityLog({
            userId: existingBatchRecord.operatorId,
            activityType: 'batch_record_submitted',
            entityId: id,
            entityType: 'batch_record',
            details: `Quality review requested for work order #${workOrder.workOrderNumber}`
          });
        }
      }
      
      const updatedBatchRecord = await storage.updateBatchRecord(id, updates);
      res.json(updatedBatchRecord);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Manufacturing Steps routes
  app.get(`${apiPrefix}/batch-records/:batchRecordId/manufacturing-steps`, async (req: Request, res: Response) => {
    try {
      const batchRecordId = parseInt(req.params.batchRecordId);
      if (isNaN(batchRecordId)) {
        return res.status(400).json({ error: "Invalid batch record ID" });
      }

      const steps = await storage.getManufacturingStepsByBatchRecordId(batchRecordId);
      res.json(steps);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post(`${apiPrefix}/manufacturing-steps`, async (req: Request, res: Response) => {
    try {
      // Validate request body against the schema
      const validatedData = insertManufacturingStepSchema.parse(req.body);
      
      // Check if batch record exists
      const batchRecord = await storage.getBatchRecord(validatedData.batchRecordId);
      if (!batchRecord) {
        return res.status(404).json({ error: "Batch record not found" });
      }
      
      // Create the manufacturing step
      const step = await storage.createManufacturingStep(validatedData);
      res.status(201).json(step);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid manufacturing step data", details: error.errors });
      }
      handleError(res, error);
    }
  });

  app.patch(`${apiPrefix}/manufacturing-steps/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid manufacturing step ID" });
      }

      const existingStep = await storage.getManufacturingStep(id);
      if (!existingStep) {
        return res.status(404).json({ error: "Manufacturing step not found" });
      }

      // Only allow updating certain fields
      const allowedUpdates = ['completedAt', 'completedBy'];
      const updates: Record<string, any> = {};
      
      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      }
      
      // If step is being marked as completed
      if (updates.completedAt && !existingStep.completedAt) {
        // Log the activity
        await storage.createActivityLog({
          userId: updates.completedBy || 1, // Default to user ID 1 if not provided
          activityType: 'manufacturing_step_completed',
          entityId: id,
          entityType: 'manufacturing_step',
          details: `Manufacturing step '${existingStep.name}' completed`
        });
        
        // Update batch record completion percentage
        const batchRecord = await storage.getBatchRecord(existingStep.batchRecordId);
        if (batchRecord) {
          const allSteps = await storage.getManufacturingStepsByBatchRecordId(batchRecord.id);
          const completedSteps = allSteps.filter(step => step.completedAt || (step.id === id && updates.completedAt)).length;
          const percentComplete = Math.floor((completedSteps / allSteps.length) * 100);
          await storage.updateBatchRecord(batchRecord.id, { completionPercentage: percentComplete });
        }
      }
      
      const updatedStep = await storage.updateManufacturingStep(id, updates);
      res.json(updatedStep);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Quality Control Tests routes
  app.get(`${apiPrefix}/batch-records/:batchRecordId/quality-control-tests`, async (req: Request, res: Response) => {
    try {
      const batchRecordId = parseInt(req.params.batchRecordId);
      if (isNaN(batchRecordId)) {
        return res.status(400).json({ error: "Invalid batch record ID" });
      }

      const tests = await storage.getQualityControlTestsByBatchRecordId(batchRecordId);
      res.json(tests);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post(`${apiPrefix}/quality-control-tests`, async (req: Request, res: Response) => {
    try {
      // Validate request body against the schema
      const validatedData = insertQualityControlTestSchema.parse(req.body);
      
      // Check if batch record exists
      const batchRecord = await storage.getBatchRecord(validatedData.batchRecordId);
      if (!batchRecord) {
        return res.status(404).json({ error: "Batch record not found" });
      }
      
      // Create the quality control test
      const test = await storage.createQualityControlTest(validatedData);
      res.status(201).json(test);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid quality control test data", details: error.errors });
      }
      handleError(res, error);
    }
  });

  app.patch(`${apiPrefix}/quality-control-tests/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid quality control test ID" });
      }

      const existingTest = await storage.getQualityControlTest(id);
      if (!existingTest) {
        return res.status(404).json({ error: "Quality control test not found" });
      }

      // Only allow updating certain fields
      const allowedUpdates = ['result', 'isPassed', 'completedAt', 'completedBy'];
      const updates: Record<string, any> = {};
      
      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      }
      
      // If test is being marked as completed
      if (updates.completedAt && !existingTest.completedAt) {
        // Log the activity
        await storage.createActivityLog({
          userId: updates.completedBy || 1, // Default to user ID 1 if not provided
          activityType: 'quality_test_completed',
          entityId: id,
          entityType: 'quality_control_test',
          details: `Quality control test '${existingTest.name}' completed`
        });
      }
      
      const updatedTest = await storage.updateQualityControlTest(id, updates);
      res.json(updatedTest);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Quality Reviews routes
  app.get(`${apiPrefix}/quality-reviews`, async (req: Request, res: Response) => {
    try {
      // If we need to get quality reviews with their relations
      if (req.query.includeRelations === 'true') {
        const reviews = await storage.getQualityReviewsWithRelations();
        return res.json(reviews);
      }
      
      // Get all batch records pending review
      if (req.query.pending === 'true') {
        const pendingReviews = await storage.getPendingQualityReviews();
        return res.json(pendingReviews);
      }
      
      // Return empty array for simplicity - we'd typically have a more specialized endpoint
      res.json([]);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get(`${apiPrefix}/batch-records/:batchRecordId/quality-review`, async (req: Request, res: Response) => {
    try {
      const batchRecordId = parseInt(req.params.batchRecordId);
      if (isNaN(batchRecordId)) {
        return res.status(400).json({ error: "Invalid batch record ID" });
      }

      const review = await storage.getQualityReviewByBatchRecordId(batchRecordId);
      if (!review) {
        return res.status(404).json({ error: "Quality review not found for this batch record" });
      }

      res.json(review);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post(`${apiPrefix}/quality-reviews`, async (req: Request, res: Response) => {
    try {
      // Validate request body against the schema
      const validatedData = insertQualityReviewSchema.parse(req.body);
      
      // Check if batch record exists
      const batchRecord = await storage.getBatchRecord(validatedData.batchRecordId);
      if (!batchRecord) {
        return res.status(404).json({ error: "Batch record not found" });
      }
      
      // Check if quality review already exists for this batch record
      const existingReview = await storage.getQualityReviewByBatchRecordId(validatedData.batchRecordId);
      if (existingReview) {
        return res.status(409).json({ error: "Quality review already exists for this batch record" });
      }
      
      // Create the quality review
      const review = await storage.createQualityReview(validatedData);
      
      // Update work order status based on decision
      const workOrder = await storage.getWorkOrder(batchRecord.workOrderId);
      if (workOrder) {
        const newStatus = validatedData.decision === 'approve' ? 'approved' : 
                          validatedData.decision === 'reject' ? 'rejected' : 'under_review';
        await storage.updateWorkOrder(workOrder.id, { status: newStatus });
        
        // Log the activity
        await storage.createActivityLog({
          userId: validatedData.reviewerId,
          activityType: 'quality_review_completed',
          entityId: review.id,
          entityType: 'quality_review',
          details: `Work order #${workOrder.workOrderNumber} ${validatedData.decision}ed by Quality Control`
        });
      }
      
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid quality review data", details: error.errors });
      }
      handleError(res, error);
    }
  });

  // Activity Logs routes
  app.get(`${apiPrefix}/activity-logs/recent`, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const logs = await storage.getRecentActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Dashboard stats route
  app.get(`${apiPrefix}/dashboard/stats`, async (req: Request, res: Response) => {
    try {
      const workOrders = await storage.getWorkOrders();
      const pendingReviews = await storage.getPendingQualityReviews();
      
      // Count work orders by status
      const statusCounts: Record<string, number> = {};
      workOrderStatusEnum.enumValues.forEach(status => {
        statusCounts[status] = workOrders.filter(wo => wo.status === status).length;
      });
      
      // Count work orders completed this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const completedThisMonth = workOrders.filter(wo => 
        (wo.status === 'approved' || wo.status === 'rejected') && 
        wo.updatedAt >= startOfMonth
      ).length;
      
      // Return stats
      res.json({
        activeWorkOrders: statusCounts.in_progress,
        pendingQcReviews: pendingReviews.length,
        completedThisMonth,
        statusCounts,
        // Mock stats for demo purposes
        workOrderIncrease: '+12% from last month',
        pendingIncrease: '+3 since yesterday',
        completedIncrease: '+8% from last month'
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
