import { 
  User, InsertUser, users,
  Product, InsertProduct, products,
  WorkOrder, InsertWorkOrder, workOrders, WorkOrderWithRelations,
  BatchRecord, InsertBatchRecord, batchRecords, BatchRecordWithRelations,
  ManufacturingStep, InsertManufacturingStep, manufacturingSteps,
  QualityControlTest, InsertQualityControlTest, qualityControlTests,
  QualityReview, InsertQualityReview, qualityReviews, QualityReviewWithRelations,
  ActivityLog, InsertActivityLog, activityLogs
} from "@shared/schema";

// Storage interface
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private workOrders: Map<number, WorkOrder>;
  private batchRecords: Map<number, BatchRecord>;
  private manufacturingSteps: Map<number, ManufacturingStep>;
  private qualityControlTests: Map<number, QualityControlTest>;
  private qualityReviews: Map<number, QualityReview>;
  private activityLogs: Map<number, ActivityLog>;
  private currentIds: {
    user: number;
    product: number;
    workOrder: number;
    batchRecord: number;
    manufacturingStep: number;
    qualityControlTest: number;
    qualityReview: number;
    activityLog: number;
  };

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.workOrders = new Map();
    this.batchRecords = new Map();
    this.manufacturingSteps = new Map();
    this.qualityControlTests = new Map();
    this.qualityReviews = new Map();
    this.activityLogs = new Map();
    this.currentIds = {
      user: 1,
      product: 1,
      workOrder: 1,
      batchRecord: 1,
      manufacturingStep: 1,
      qualityControlTest: 1,
      qualityReview: 1,
      activityLog: 1
    };

    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample Users
    const user1: User = {
      id: this.currentIds.user++,
      username: 'john.cooper',
      password: 'password123',
      fullName: 'John Cooper',
      role: 'operator',
      email: 'john.cooper@example.com',
      avatarUrl: null,
      createdAt: new Date()
    };
    
    const user2: User = {
      id: this.currentIds.user++,
      username: 'maria.johnson',
      password: 'password123',
      fullName: 'Maria Johnson',
      role: 'operator',
      email: 'maria.johnson@example.com',
      avatarUrl: null,
      createdAt: new Date()
    };
    
    const user3: User = {
      id: this.currentIds.user++,
      username: 'sara.williams',
      password: 'password123',
      fullName: 'Sara Williams',
      role: 'quality_controller',
      email: 'sara.williams@example.com',
      avatarUrl: null,
      createdAt: new Date()
    };

    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    this.users.set(user3.id, user3);

    // Sample Products
    const product1: Product = {
      id: this.currentIds.product++,
      name: 'Hydrating Moisturizer',
      description: 'Deep hydration formula for all skin types',
      createdAt: new Date()
    };
    
    const product2: Product = {
      id: this.currentIds.product++,
      name: 'Vitamin C Serum',
      description: 'Brightening serum with 15% vitamin C',
      createdAt: new Date()
    };
    
    const product3: Product = {
      id: this.currentIds.product++,
      name: 'Gentle Cleanser',
      description: 'Mild cleanser for sensitive skin',
      createdAt: new Date()
    };
    
    const product4: Product = {
      id: this.currentIds.product++,
      name: 'SPF 50 Sunscreen',
      description: 'Broad spectrum protection with vitamin E',
      createdAt: new Date()
    };
    
    const product5: Product = {
      id: this.currentIds.product++,
      name: 'Clay Face Mask',
      description: 'Deep cleansing mask with kaolin clay',
      createdAt: new Date()
    };

    this.products.set(product1.id, product1);
    this.products.set(product2.id, product2);
    this.products.set(product3.id, product3);
    this.products.set(product4.id, product4);
    this.products.set(product5.id, product5);

    // Sample Work Orders
    const workOrder1: WorkOrder = {
      id: this.currentIds.workOrder++,
      workOrderNumber: 'WO-2023-091',
      productId: product1.id,
      batchSize: 500,
      assignedOperatorId: user1.id,
      status: 'in_progress',
      startDate: new Date('2023-07-05'),
      endDate: null,
      notes: 'Priority production for new market launch',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const workOrder2: WorkOrder = {
      id: this.currentIds.workOrder++,
      workOrderNumber: 'WO-2023-090',
      productId: product2.id,
      batchSize: 250,
      assignedOperatorId: user2.id,
      status: 'in_progress',
      startDate: new Date('2023-07-03'),
      endDate: null,
      notes: 'Using new supplier for vitamin C',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const workOrder3: WorkOrder = {
      id: this.currentIds.workOrder++,
      workOrderNumber: 'WO-2023-089',
      productId: product3.id,
      batchSize: 300,
      assignedOperatorId: user1.id,
      status: 'approved',
      startDate: new Date('2023-07-01'),
      endDate: new Date('2023-07-05'),
      notes: 'Quality checks passed with excellent results',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const workOrder4: WorkOrder = {
      id: this.currentIds.workOrder++,
      workOrderNumber: 'WO-2023-088',
      productId: product4.id,
      batchSize: 400,
      assignedOperatorId: user2.id,
      status: 'under_review',
      startDate: new Date('2023-06-28'),
      endDate: new Date('2023-06-30'),
      notes: 'High priority summer batch',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const workOrder5: WorkOrder = {
      id: this.currentIds.workOrder++,
      workOrderNumber: 'WO-2023-087',
      productId: product5.id,
      batchSize: 200,
      assignedOperatorId: user1.id,
      status: 'under_review',
      startDate: new Date('2023-06-25'),
      endDate: new Date('2023-06-28'),
      notes: 'Special formulation with added activated charcoal',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workOrders.set(workOrder1.id, workOrder1);
    this.workOrders.set(workOrder2.id, workOrder2);
    this.workOrders.set(workOrder3.id, workOrder3);
    this.workOrders.set(workOrder4.id, workOrder4);
    this.workOrders.set(workOrder5.id, workOrder5);

    // Sample Batch Records
    const batchRecord1: BatchRecord = {
      id: this.currentIds.batchRecord++,
      workOrderId: workOrder1.id,
      operatorId: user1.id,
      batchNumber: 'HM-23-091-500',
      completionPercentage: 75,
      isComplete: false,
      submittedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const batchRecord2: BatchRecord = {
      id: this.currentIds.batchRecord++,
      workOrderId: workOrder2.id,
      operatorId: user2.id,
      batchNumber: 'VC-23-090-250',
      completionPercentage: 50,
      isComplete: false,
      submittedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const batchRecord3: BatchRecord = {
      id: this.currentIds.batchRecord++,
      workOrderId: workOrder3.id,
      operatorId: user1.id,
      batchNumber: 'GC-23-089-300',
      completionPercentage: 100,
      isComplete: true,
      submittedAt: new Date('2023-07-05'),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const batchRecord4: BatchRecord = {
      id: this.currentIds.batchRecord++,
      workOrderId: workOrder4.id,
      operatorId: user2.id,
      batchNumber: 'SPF-23-088-400',
      completionPercentage: 100,
      isComplete: true,
      submittedAt: new Date('2023-06-30'),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const batchRecord5: BatchRecord = {
      id: this.currentIds.batchRecord++,
      workOrderId: workOrder5.id,
      operatorId: user1.id,
      batchNumber: 'CM-23-087-200',
      completionPercentage: 100,
      isComplete: true,
      submittedAt: new Date('2023-06-28'),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.batchRecords.set(batchRecord1.id, batchRecord1);
    this.batchRecords.set(batchRecord2.id, batchRecord2);
    this.batchRecords.set(batchRecord3.id, batchRecord3);
    this.batchRecords.set(batchRecord4.id, batchRecord4);
    this.batchRecords.set(batchRecord5.id, batchRecord5);

    // Sample Manufacturing Steps for Batch Record 4 (SPF Sunscreen)
    const step1: ManufacturingStep = {
      id: this.currentIds.manufacturingStep++,
      batchRecordId: batchRecord4.id,
      name: 'Raw Material Preparation',
      description: 'Weigh and prepare all raw materials according to formula',
      completedAt: new Date('2023-06-28T09:15:00'),
      completedBy: user2.id,
      sortOrder: 1,
      createdAt: new Date()
    };
    
    const step2: ManufacturingStep = {
      id: this.currentIds.manufacturingStep++,
      batchRecordId: batchRecord4.id,
      name: 'Oil Phase Mixing',
      description: 'Combine oil phase ingredients and heat to 75°C',
      completedAt: new Date('2023-06-28T10:45:00'),
      completedBy: user2.id,
      sortOrder: 2,
      createdAt: new Date()
    };
    
    const step3: ManufacturingStep = {
      id: this.currentIds.manufacturingStep++,
      batchRecordId: batchRecord4.id,
      name: 'Water Phase Preparation',
      description: 'Combine water phase ingredients and heat to 75°C',
      completedAt: new Date('2023-06-28T13:30:00'),
      completedBy: user2.id,
      sortOrder: 3,
      createdAt: new Date()
    };
    
    const step4: ManufacturingStep = {
      id: this.currentIds.manufacturingStep++,
      batchRecordId: batchRecord4.id,
      name: 'Emulsification',
      description: 'Add oil phase to water phase while mixing at high speed',
      completedAt: new Date('2023-06-28T15:45:00'),
      completedBy: user2.id,
      sortOrder: 4,
      createdAt: new Date()
    };
    
    const step5: ManufacturingStep = {
      id: this.currentIds.manufacturingStep++,
      batchRecordId: batchRecord4.id,
      name: 'Cooling and Addition of Actives',
      description: 'Cool to 40°C and add heat-sensitive ingredients',
      completedAt: new Date('2023-06-29T09:30:00'),
      completedBy: user2.id,
      sortOrder: 5,
      createdAt: new Date()
    };
    
    const step6: ManufacturingStep = {
      id: this.currentIds.manufacturingStep++,
      batchRecordId: batchRecord4.id,
      name: 'Filling and Packaging',
      description: 'Fill product into containers and seal',
      completedAt: new Date('2023-06-30T14:15:00'),
      completedBy: user2.id,
      sortOrder: 6,
      createdAt: new Date()
    };

    this.manufacturingSteps.set(step1.id, step1);
    this.manufacturingSteps.set(step2.id, step2);
    this.manufacturingSteps.set(step3.id, step3);
    this.manufacturingSteps.set(step4.id, step4);
    this.manufacturingSteps.set(step5.id, step5);
    this.manufacturingSteps.set(step6.id, step6);

    // Sample Quality Control Tests for Batch Record 4
    const test1: QualityControlTest = {
      id: this.currentIds.qualityControlTest++,
      batchRecordId: batchRecord4.id,
      name: 'pH Test',
      acceptableRange: '6.8-7.5',
      result: '7.2',
      isPassed: true,
      completedAt: new Date('2023-06-30T10:00:00'),
      completedBy: user2.id,
      createdAt: new Date()
    };
    
    const test2: QualityControlTest = {
      id: this.currentIds.qualityControlTest++,
      batchRecordId: batchRecord4.id,
      name: 'Viscosity Test',
      acceptableRange: '14,000-16,000 cP',
      result: '15,200 cP',
      isPassed: true,
      completedAt: new Date('2023-06-30T10:30:00'),
      completedBy: user2.id,
      createdAt: new Date()
    };
    
    const test3: QualityControlTest = {
      id: this.currentIds.qualityControlTest++,
      batchRecordId: batchRecord4.id,
      name: 'SPF Assessment',
      acceptableRange: 'SPF 48-55',
      result: 'SPF 52',
      isPassed: true,
      completedAt: new Date('2023-06-30T11:15:00'),
      completedBy: user2.id,
      createdAt: new Date()
    };
    
    const test4: QualityControlTest = {
      id: this.currentIds.qualityControlTest++,
      batchRecordId: batchRecord4.id,
      name: 'Microbial Test',
      acceptableRange: 'No significant growth',
      result: 'Pass',
      isPassed: true,
      completedAt: new Date('2023-06-30T13:00:00'),
      completedBy: user2.id,
      createdAt: new Date()
    };

    this.qualityControlTests.set(test1.id, test1);
    this.qualityControlTests.set(test2.id, test2);
    this.qualityControlTests.set(test3.id, test3);
    this.qualityControlTests.set(test4.id, test4);

    // Sample Quality Review for Batch Record 3
    const review1: QualityReview = {
      id: this.currentIds.qualityReview++,
      batchRecordId: batchRecord3.id,
      reviewerId: user3.id,
      decision: 'approve',
      comments: 'All tests passed. Product meets quality standards.',
      reviewedAt: new Date('2023-07-05T14:30:00'),
      createdAt: new Date()
    };

    this.qualityReviews.set(review1.id, review1);

    // Sample Activity Logs
    const activity1: ActivityLog = {
      id: this.currentIds.activityLog++,
      userId: user3.id,
      activityType: 'quality_review_completed',
      entityId: batchRecord3.id,
      entityType: 'batch_record',
      details: `Work order #WO-2023-089 approved by Quality Control`,
      createdAt: new Date(Date.now() - 25 * 60 * 1000) // 25 minutes ago
    };
    
    const activity2: ActivityLog = {
      id: this.currentIds.activityLog++,
      userId: user1.id,
      activityType: 'batch_record_created',
      entityId: batchRecord1.id,
      entityType: 'batch_record',
      details: `New batch record created for #WO-2023-091`,
      createdAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
    };
    
    const activity3: ActivityLog = {
      id: this.currentIds.activityLog++,
      userId: user2.id,
      activityType: 'batch_record_submitted',
      entityId: batchRecord4.id,
      entityType: 'batch_record',
      details: `Quality review requested for work order #WO-2023-088`,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    };

    this.activityLogs.set(activity1.id, activity1);
    this.activityLogs.set(activity2.id, activity2);
    this.activityLogs.set(activity3.id, activity3);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const user: User = {
      ...userData,
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = this.currentIds.product++;
    const product: Product = {
      ...productData,
      id,
      createdAt: new Date()
    };
    this.products.set(id, product);
    return product;
  }

  // Work Order methods
  async getWorkOrder(id: number): Promise<WorkOrder | undefined> {
    return this.workOrders.get(id);
  }

  async getWorkOrderByNumber(workOrderNumber: string): Promise<WorkOrder | undefined> {
    return Array.from(this.workOrders.values()).find(
      workOrder => workOrder.workOrderNumber === workOrderNumber
    );
  }

  async getWorkOrders(): Promise<WorkOrder[]> {
    return Array.from(this.workOrders.values());
  }

  async createWorkOrder(workOrderData: InsertWorkOrder): Promise<WorkOrder> {
    const id = this.currentIds.workOrder++;
    const now = new Date();
    const workOrder: WorkOrder = {
      ...workOrderData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.workOrders.set(id, workOrder);
    return workOrder;
  }

  async updateWorkOrder(id: number, data: Partial<WorkOrder>): Promise<WorkOrder | undefined> {
    const workOrder = this.workOrders.get(id);
    if (!workOrder) return undefined;

    const updatedWorkOrder: WorkOrder = {
      ...workOrder,
      ...data,
      updatedAt: new Date()
    };
    this.workOrders.set(id, updatedWorkOrder);
    return updatedWorkOrder;
  }

  async getWorkOrderWithRelations(id: number): Promise<WorkOrderWithRelations | undefined> {
    const workOrder = this.workOrders.get(id);
    if (!workOrder) return undefined;

    const product = this.products.get(workOrder.productId);
    const operator = this.users.get(workOrder.assignedOperatorId);
    const batchRecord = Array.from(this.batchRecords.values()).find(
      record => record.workOrderId === workOrder.id
    );

    if (!product || !operator) return undefined;

    return {
      ...workOrder,
      product,
      operator,
      batchRecord
    };
  }

  async getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
    return Array.from(this.workOrders.values()).filter(
      workOrder => workOrder.status === status
    );
  }

  async getWorkOrdersWithRelations(): Promise<WorkOrderWithRelations[]> {
    const workOrders = Array.from(this.workOrders.values());
    const result: WorkOrderWithRelations[] = [];

    for (const workOrder of workOrders) {
      const product = this.products.get(workOrder.productId);
      const operator = this.users.get(workOrder.assignedOperatorId);
      const batchRecord = Array.from(this.batchRecords.values()).find(
        record => record.workOrderId === workOrder.id
      );

      if (product && operator) {
        result.push({
          ...workOrder,
          product,
          operator,
          batchRecord
        });
      }
    }

    return result;
  }

  // Batch Record methods
  async getBatchRecord(id: number): Promise<BatchRecord | undefined> {
    return this.batchRecords.get(id);
  }

  async getBatchRecordByWorkOrderId(workOrderId: number): Promise<BatchRecord | undefined> {
    return Array.from(this.batchRecords.values()).find(
      record => record.workOrderId === workOrderId
    );
  }

  async getBatchRecords(): Promise<BatchRecord[]> {
    return Array.from(this.batchRecords.values());
  }

  async createBatchRecord(batchRecordData: InsertBatchRecord): Promise<BatchRecord> {
    const id = this.currentIds.batchRecord++;
    const now = new Date();
    const batchRecord: BatchRecord = {
      ...batchRecordData,
      id,
      submittedAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.batchRecords.set(id, batchRecord);
    return batchRecord;
  }

  async updateBatchRecord(id: number, data: Partial<BatchRecord>): Promise<BatchRecord | undefined> {
    const batchRecord = this.batchRecords.get(id);
    if (!batchRecord) return undefined;

    const updatedBatchRecord: BatchRecord = {
      ...batchRecord,
      ...data,
      updatedAt: new Date()
    };
    this.batchRecords.set(id, updatedBatchRecord);
    return updatedBatchRecord;
  }

  async getBatchRecordWithRelations(id: number): Promise<BatchRecordWithRelations | undefined> {
    const batchRecord = this.batchRecords.get(id);
    if (!batchRecord) return undefined;

    const workOrder = this.workOrders.get(batchRecord.workOrderId);
    const operator = this.users.get(batchRecord.operatorId);
    const manufacturingSteps = Array.from(this.manufacturingSteps.values()).filter(
      step => step.batchRecordId === batchRecord.id
    ).sort((a, b) => a.sortOrder - b.sortOrder);
    const qualityControlTests = Array.from(this.qualityControlTests.values()).filter(
      test => test.batchRecordId === batchRecord.id
    );
    const qualityReview = Array.from(this.qualityReviews.values()).find(
      review => review.batchRecordId === batchRecord.id
    );

    if (!workOrder || !operator) return undefined;

    return {
      ...batchRecord,
      workOrder,
      operator,
      manufacturingSteps,
      qualityControlTests,
      qualityReview
    };
  }

  async getBatchRecordsWithRelations(): Promise<BatchRecordWithRelations[]> {
    const batchRecords = Array.from(this.batchRecords.values());
    const result: BatchRecordWithRelations[] = [];

    for (const batchRecord of batchRecords) {
      const workOrder = this.workOrders.get(batchRecord.workOrderId);
      const operator = this.users.get(batchRecord.operatorId);
      const manufacturingSteps = Array.from(this.manufacturingSteps.values()).filter(
        step => step.batchRecordId === batchRecord.id
      ).sort((a, b) => a.sortOrder - b.sortOrder);
      const qualityControlTests = Array.from(this.qualityControlTests.values()).filter(
        test => test.batchRecordId === batchRecord.id
      );
      const qualityReview = Array.from(this.qualityReviews.values()).find(
        review => review.batchRecordId === batchRecord.id
      );

      if (workOrder && operator) {
        result.push({
          ...batchRecord,
          workOrder,
          operator,
          manufacturingSteps,
          qualityControlTests,
          qualityReview
        });
      }
    }

    return result;
  }

  // Manufacturing Steps methods
  async getManufacturingStep(id: number): Promise<ManufacturingStep | undefined> {
    return this.manufacturingSteps.get(id);
  }

  async getManufacturingStepsByBatchRecordId(batchRecordId: number): Promise<ManufacturingStep[]> {
    return Array.from(this.manufacturingSteps.values())
      .filter(step => step.batchRecordId === batchRecordId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async createManufacturingStep(stepData: InsertManufacturingStep): Promise<ManufacturingStep> {
    const id = this.currentIds.manufacturingStep++;
    const step: ManufacturingStep = {
      ...stepData,
      id,
      completedAt: null,
      completedBy: null,
      createdAt: new Date()
    };
    this.manufacturingSteps.set(id, step);
    return step;
  }

  async updateManufacturingStep(id: number, data: Partial<ManufacturingStep>): Promise<ManufacturingStep | undefined> {
    const step = this.manufacturingSteps.get(id);
    if (!step) return undefined;

    const updatedStep: ManufacturingStep = {
      ...step,
      ...data
    };
    this.manufacturingSteps.set(id, updatedStep);
    return updatedStep;
  }

  // Quality Control Tests methods
  async getQualityControlTest(id: number): Promise<QualityControlTest | undefined> {
    return this.qualityControlTests.get(id);
  }

  async getQualityControlTestsByBatchRecordId(batchRecordId: number): Promise<QualityControlTest[]> {
    return Array.from(this.qualityControlTests.values()).filter(
      test => test.batchRecordId === batchRecordId
    );
  }

  async createQualityControlTest(testData: InsertQualityControlTest): Promise<QualityControlTest> {
    const id = this.currentIds.qualityControlTest++;
    const test: QualityControlTest = {
      ...testData,
      id,
      isPassed: null,
      completedAt: null,
      completedBy: null,
      createdAt: new Date()
    };
    this.qualityControlTests.set(id, test);
    return test;
  }

  async updateQualityControlTest(id: number, data: Partial<QualityControlTest>): Promise<QualityControlTest | undefined> {
    const test = this.qualityControlTests.get(id);
    if (!test) return undefined;

    const updatedTest: QualityControlTest = {
      ...test,
      ...data
    };
    this.qualityControlTests.set(id, updatedTest);
    return updatedTest;
  }

  // Quality Reviews methods
  async getQualityReview(id: number): Promise<QualityReview | undefined> {
    return this.qualityReviews.get(id);
  }

  async getQualityReviewByBatchRecordId(batchRecordId: number): Promise<QualityReview | undefined> {
    return Array.from(this.qualityReviews.values()).find(
      review => review.batchRecordId === batchRecordId
    );
  }

  async createQualityReview(reviewData: InsertQualityReview): Promise<QualityReview> {
    const id = this.currentIds.qualityReview++;
    const now = new Date();
    const review: QualityReview = {
      ...reviewData,
      id,
      reviewedAt: now,
      createdAt: now
    };
    this.qualityReviews.set(id, review);
    return review;
  }

  async updateQualityReview(id: number, data: Partial<QualityReview>): Promise<QualityReview | undefined> {
    const review = this.qualityReviews.get(id);
    if (!review) return undefined;

    const updatedReview: QualityReview = {
      ...review,
      ...data
    };
    this.qualityReviews.set(id, updatedReview);
    return updatedReview;
  }

  async getQualityReviewsWithRelations(): Promise<QualityReviewWithRelations[]> {
    const qualityReviews = Array.from(this.qualityReviews.values());
    const result: QualityReviewWithRelations[] = [];

    for (const review of qualityReviews) {
      const batchRecordWithRelations = await this.getBatchRecordWithRelations(review.batchRecordId);
      const reviewer = this.users.get(review.reviewerId);

      if (batchRecordWithRelations && reviewer) {
        result.push({
          ...review,
          batchRecord: batchRecordWithRelations,
          reviewer
        });
      }
    }

    return result;
  }

  async getPendingQualityReviews(): Promise<BatchRecordWithRelations[]> {
    const workOrdersUnderReview = await this.getWorkOrdersByStatus('under_review');
    const result: BatchRecordWithRelations[] = [];

    for (const workOrder of workOrdersUnderReview) {
      const batchRecord = await this.getBatchRecordByWorkOrderId(workOrder.id);
      if (batchRecord && batchRecord.isComplete) {
        const batchRecordWithRelations = await this.getBatchRecordWithRelations(batchRecord.id);
        if (batchRecordWithRelations) {
          result.push(batchRecordWithRelations);
        }
      }
    }

    return result;
  }

  // Activity Logs methods
  async createActivityLog(logData: InsertActivityLog): Promise<ActivityLog> {
    const id = this.currentIds.activityLog++;
    const log: ActivityLog = {
      ...logData,
      id,
      createdAt: new Date()
    };
    this.activityLogs.set(id, log);
    return log;
  }

  async getRecentActivityLogs(limit: number = 10): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
