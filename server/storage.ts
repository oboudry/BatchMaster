import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  workOrders, type WorkOrder, type InsertWorkOrder, type WorkOrderWithRelations,
  batchRecords, type BatchRecord, type InsertBatchRecord, type BatchRecordWithRelations,
  manufacturingSteps, type ManufacturingStep, type InsertManufacturingStep,
  qualityControlTests, type QualityControlTest, type InsertQualityControlTest,
  qualityReviews, type QualityReview, type InsertQualityReview, type QualityReviewWithRelations,
  activityLogs, type ActivityLog, type InsertActivityLog
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, isNull } from "drizzle-orm";

// Define the storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;

  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Work Orders
  getWorkOrder(id: number): Promise<WorkOrder | undefined>;
  getWorkOrderByNumber(workOrderNumber: string): Promise<WorkOrder | undefined>;
  getWorkOrders(): Promise<WorkOrder[]>;
  createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder>;
  updateWorkOrder(id: number, data: Partial<WorkOrder>): Promise<WorkOrder | undefined>;
  getWorkOrderWithRelations(id: number): Promise<WorkOrderWithRelations | undefined>;
  getWorkOrdersByStatus(status: string): Promise<WorkOrder[]>;
  getWorkOrdersWithRelations(): Promise<WorkOrderWithRelations[]>;

  // Batch Records
  getBatchRecord(id: number): Promise<BatchRecord | undefined>;
  getBatchRecordByWorkOrderId(workOrderId: number): Promise<BatchRecord | undefined>;
  getBatchRecords(): Promise<BatchRecord[]>;
  createBatchRecord(batchRecord: InsertBatchRecord): Promise<BatchRecord>;
  updateBatchRecord(id: number, data: Partial<BatchRecord>): Promise<BatchRecord | undefined>;
  getBatchRecordWithRelations(id: number): Promise<BatchRecordWithRelations | undefined>;
  getBatchRecordsWithRelations(): Promise<BatchRecordWithRelations[]>;

  // Manufacturing Steps
  getManufacturingStep(id: number): Promise<ManufacturingStep | undefined>;
  getManufacturingStepsByBatchRecordId(batchRecordId: number): Promise<ManufacturingStep[]>;
  createManufacturingStep(step: InsertManufacturingStep): Promise<ManufacturingStep>;
  updateManufacturingStep(id: number, data: Partial<ManufacturingStep>): Promise<ManufacturingStep | undefined>;

  // Quality Control Tests
  getQualityControlTest(id: number): Promise<QualityControlTest | undefined>;
  getQualityControlTestsByBatchRecordId(batchRecordId: number): Promise<QualityControlTest[]>;
  createQualityControlTest(test: InsertQualityControlTest): Promise<QualityControlTest>;
  updateQualityControlTest(id: number, data: Partial<QualityControlTest>): Promise<QualityControlTest | undefined>;

  // Quality Reviews
  getQualityReview(id: number): Promise<QualityReview | undefined>;
  getQualityReviewByBatchRecordId(batchRecordId: number): Promise<QualityReview | undefined>;
  createQualityReview(review: InsertQualityReview): Promise<QualityReview>;
  updateQualityReview(id: number, data: Partial<QualityReview>): Promise<QualityReview | undefined>;
  getQualityReviewsWithRelations(): Promise<QualityReviewWithRelations[]>;
  getPendingQualityReviews(): Promise<BatchRecordWithRelations[]>;

  // Activity Logs
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getRecentActivityLogs(limit: number): Promise<ActivityLog[]>;
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Products
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }

  // Work Orders
  async getWorkOrder(id: number): Promise<WorkOrder | undefined> {
    const [workOrder] = await db.select().from(workOrders).where(eq(workOrders.id, id));
    return workOrder;
  }

  async getWorkOrderByNumber(workOrderNumber: string): Promise<WorkOrder | undefined> {
    const [workOrder] = await db.select().from(workOrders).where(eq(workOrders.workOrderNumber, workOrderNumber));
    return workOrder;
  }

  async getWorkOrders(): Promise<WorkOrder[]> {
    return await db.select().from(workOrders);
  }

  async createWorkOrder(workOrderData: InsertWorkOrder): Promise<WorkOrder> {
    const [workOrder] = await db.insert(workOrders).values(workOrderData).returning();
    return workOrder;
  }

  async updateWorkOrder(id: number, data: Partial<WorkOrder>): Promise<WorkOrder | undefined> {
    const [updatedWorkOrder] = await db
      .update(workOrders)
      .set(data)
      .where(eq(workOrders.id, id))
      .returning();
    return updatedWorkOrder;
  }

  async getWorkOrderWithRelations(id: number): Promise<WorkOrderWithRelations | undefined> {
    const result = await db.query.workOrders.findFirst({
      where: eq(workOrders.id, id),
      with: {
        product: true,
        operator: true,
        batchRecord: true
      }
    });

    return result as WorkOrderWithRelations | undefined;
  }

  async getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
    return await db.select().from(workOrders).where(eq(workOrders.status as any, status));
  }

  async getWorkOrdersWithRelations(): Promise<WorkOrderWithRelations[]> {
    const result = await db.query.workOrders.findMany({
      with: {
        product: true,
        operator: true,
        batchRecord: true
      }
    });

    return result as WorkOrderWithRelations[];
  }

  // Batch Records
  async getBatchRecord(id: number): Promise<BatchRecord | undefined> {
    const [batchRecord] = await db.select().from(batchRecords).where(eq(batchRecords.id, id));
    return batchRecord;
  }

  async getBatchRecordByWorkOrderId(workOrderId: number): Promise<BatchRecord | undefined> {
    const [batchRecord] = await db.select().from(batchRecords).where(eq(batchRecords.workOrderId, workOrderId));
    return batchRecord;
  }

  async getBatchRecords(): Promise<BatchRecord[]> {
    return await db.select().from(batchRecords);
  }

  async createBatchRecord(batchRecordData: InsertBatchRecord): Promise<BatchRecord> {
    const [batchRecord] = await db.insert(batchRecords).values(batchRecordData).returning();
    return batchRecord;
  }

  async updateBatchRecord(id: number, data: Partial<BatchRecord>): Promise<BatchRecord | undefined> {
    const [updatedBatchRecord] = await db
      .update(batchRecords)
      .set(data)
      .where(eq(batchRecords.id, id))
      .returning();
    return updatedBatchRecord;
  }

  async getBatchRecordWithRelations(id: number): Promise<BatchRecordWithRelations | undefined> {
    const result = await db.query.batchRecords.findFirst({
      where: eq(batchRecords.id, id),
      with: {
        workOrder: {
          with: {
            product: true
          }
        },
        operator: true,
        manufacturingSteps: true,
        qualityControlTests: true,
        qualityReview: true
      }
    });

    return result as BatchRecordWithRelations | undefined;
  }

  async getBatchRecordsWithRelations(): Promise<BatchRecordWithRelations[]> {
    const result = await db.query.batchRecords.findMany({
      with: {
        workOrder: {
          with: {
            product: true
          }
        },
        operator: true,
        manufacturingSteps: true,
        qualityControlTests: true,
        qualityReview: true
      }
    });

    return result as BatchRecordWithRelations[];
  }

  // Manufacturing Steps
  async getManufacturingStep(id: number): Promise<ManufacturingStep | undefined> {
    const [step] = await db.select().from(manufacturingSteps).where(eq(manufacturingSteps.id, id));
    return step;
  }

  async getManufacturingStepsByBatchRecordId(batchRecordId: number): Promise<ManufacturingStep[]> {
    return await db
      .select()
      .from(manufacturingSteps)
      .where(eq(manufacturingSteps.batchRecordId, batchRecordId))
      .orderBy(manufacturingSteps.sortOrder);
  }

  async createManufacturingStep(stepData: InsertManufacturingStep): Promise<ManufacturingStep> {
    const [step] = await db.insert(manufacturingSteps).values(stepData).returning();
    return step;
  }

  async updateManufacturingStep(id: number, data: Partial<ManufacturingStep>): Promise<ManufacturingStep | undefined> {
    const [updatedStep] = await db
      .update(manufacturingSteps)
      .set(data)
      .where(eq(manufacturingSteps.id, id))
      .returning();
    return updatedStep;
  }

  // Quality Control Tests
  async getQualityControlTest(id: number): Promise<QualityControlTest | undefined> {
    const [test] = await db.select().from(qualityControlTests).where(eq(qualityControlTests.id, id));
    return test;
  }

  async getQualityControlTestsByBatchRecordId(batchRecordId: number): Promise<QualityControlTest[]> {
    return await db
      .select()
      .from(qualityControlTests)
      .where(eq(qualityControlTests.batchRecordId, batchRecordId));
  }

  async createQualityControlTest(testData: InsertQualityControlTest): Promise<QualityControlTest> {
    const [test] = await db.insert(qualityControlTests).values(testData).returning();
    return test;
  }

  async updateQualityControlTest(id: number, data: Partial<QualityControlTest>): Promise<QualityControlTest | undefined> {
    const [updatedTest] = await db
      .update(qualityControlTests)
      .set(data)
      .where(eq(qualityControlTests.id, id))
      .returning();
    return updatedTest;
  }

  // Quality Reviews
  async getQualityReview(id: number): Promise<QualityReview | undefined> {
    const [review] = await db.select().from(qualityReviews).where(eq(qualityReviews.id, id));
    return review;
  }

  async getQualityReviewByBatchRecordId(batchRecordId: number): Promise<QualityReview | undefined> {
    const [review] = await db.select().from(qualityReviews).where(eq(qualityReviews.batchRecordId, batchRecordId));
    return review;
  }

  async createQualityReview(reviewData: InsertQualityReview): Promise<QualityReview> {
    const [review] = await db.insert(qualityReviews).values(reviewData).returning();
    return review;
  }

  async updateQualityReview(id: number, data: Partial<QualityReview>): Promise<QualityReview | undefined> {
    const [updatedReview] = await db
      .update(qualityReviews)
      .set(data)
      .where(eq(qualityReviews.id, id))
      .returning();
    return updatedReview;
  }

  async getQualityReviewsWithRelations(): Promise<QualityReviewWithRelations[]> {
    const result = await db.query.qualityReviews.findMany({
      with: {
        batchRecord: {
          with: {
            workOrder: {
              with: {
                product: true
              }
            },
            operator: true,
            manufacturingSteps: true,
            qualityControlTests: true
          }
        },
        reviewer: true
      }
    });

    return result as QualityReviewWithRelations[];
  }

  async getPendingQualityReviews(): Promise<BatchRecordWithRelations[]> {
    // Get batch records that are complete but don't have quality reviews
    const completeBatchRecords = await db.query.batchRecords.findMany({
      where: eq(batchRecords.isComplete, true),
      with: {
        workOrder: {
          with: {
            product: true
          }
        },
        operator: true,
        manufacturingSteps: true,
        qualityControlTests: true,
        qualityReview: true
      }
    });

    // Filter out records that already have a quality review
    const batchRecordsWithoutReviews = completeBatchRecords.filter(record => !record.qualityReview);
    return batchRecordsWithoutReviews as BatchRecordWithRelations[];
  }

  // Activity Logs
  async createActivityLog(logData: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db.insert(activityLogs).values(logData).returning();
    return log;
  }

  async getRecentActivityLogs(limit: number = 10): Promise<ActivityLog[]> {
    return db.query.activityLogs.findMany({
      with: {
        user: true
      },
      orderBy: desc(activityLogs.createdAt),
      limit
    }) as Promise<ActivityLog[]>;
  }
}

// Export a singleton instance of DatabaseStorage
export const storage = new DatabaseStorage();