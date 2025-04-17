import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users and Roles
export const roleEnum = pgEnum('role', ['operator', 'quality_controller', 'admin']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: roleEnum("role").notNull().default('operator'),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Work Order Status
export const workOrderStatusEnum = pgEnum('work_order_status', [
  'planned', 
  'in_progress', 
  'completed', 
  'under_review', 
  'approved', 
  'rejected'
]);

// Work Orders
export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  workOrderNumber: text("work_order_number").notNull().unique(),
  productId: integer("product_id").notNull(),
  batchSize: integer("batch_size").notNull(),
  assignedOperatorId: integer("assigned_operator_id").notNull(),
  status: workOrderStatusEnum("status").notNull().default('planned'),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Batch Record
export const batchRecords = pgTable("batch_records", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id").notNull(),
  operatorId: integer("operator_id").notNull(),
  batchNumber: text("batch_number").notNull().unique(),
  completionPercentage: integer("completion_percentage").notNull().default(0),
  isComplete: boolean("is_complete").notNull().default(false),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Manufacturing Steps
export const manufacturingSteps = pgTable("manufacturing_steps", {
  id: serial("id").primaryKey(),
  batchRecordId: integer("batch_record_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  completedAt: timestamp("completed_at"),
  completedBy: integer("completed_by"),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quality Control Tests
export const qualityControlTests = pgTable("quality_control_tests", {
  id: serial("id").primaryKey(),
  batchRecordId: integer("batch_record_id").notNull(),
  name: text("name").notNull(),
  acceptableRange: text("acceptable_range"),
  result: text("result"),
  isPassed: boolean("is_passed"),
  completedAt: timestamp("completed_at"),
  completedBy: integer("completed_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quality Review Decision
export const qcDecisionEnum = pgEnum('qc_decision', ['approve', 'reject', 'hold']);

export const qualityReviews = pgTable("quality_reviews", {
  id: serial("id").primaryKey(),
  batchRecordId: integer("batch_record_id").notNull(),
  reviewerId: integer("reviewer_id").notNull(),
  decision: qcDecisionEnum("decision"),
  comments: text("comments"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity Log
export const activityLogTypeEnum = pgEnum('activity_log_type', [
  'work_order_created',
  'work_order_updated',
  'work_order_status_changed',
  'batch_record_created',
  'batch_record_updated',
  'batch_record_submitted',
  'manufacturing_step_completed',
  'quality_test_completed',
  'quality_review_completed'
]);

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityType: activityLogTypeEnum("activity_type").notNull(),
  entityId: integer("entity_id"),
  entityType: text("entity_type"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Priority Levels
export const priorityLevelEnum = pgEnum('priority_level', ['low', 'medium', 'high']);

// Define all relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedWorkOrders: many(workOrders, { relationName: "operator_work_orders" }),
  operatedBatchRecords: many(batchRecords, { relationName: "operator_batch_records" }),
  reviewedQualityReviews: many(qualityReviews, { relationName: "reviewer_quality_reviews" }),
  activityLogs: many(activityLogs),
}));

export const productsRelations = relations(products, ({ many }) => ({
  workOrders: many(workOrders)
}));

export const workOrdersRelations = relations(workOrders, ({ one, many }) => ({
  product: one(products, {
    fields: [workOrders.productId],
    references: [products.id],
  }),
  operator: one(users, {
    fields: [workOrders.assignedOperatorId],
    references: [users.id],
    relationName: "operator_work_orders"
  }),
  batchRecord: one(batchRecords)
}));

export const batchRecordsRelations = relations(batchRecords, ({ one, many }) => ({
  workOrder: one(workOrders, {
    fields: [batchRecords.workOrderId],
    references: [workOrders.id],
  }),
  operator: one(users, {
    fields: [batchRecords.operatorId],
    references: [users.id],
    relationName: "operator_batch_records"
  }),
  manufacturingSteps: many(manufacturingSteps),
  qualityControlTests: many(qualityControlTests),
  qualityReview: one(qualityReviews)
}));

export const manufacturingStepsRelations = relations(manufacturingSteps, ({ one }) => ({
  batchRecord: one(batchRecords, {
    fields: [manufacturingSteps.batchRecordId],
    references: [batchRecords.id],
  }),
  completedByUser: one(users, {
    fields: [manufacturingSteps.completedBy],
    references: [users.id],
  })
}));

export const qualityControlTestsRelations = relations(qualityControlTests, ({ one }) => ({
  batchRecord: one(batchRecords, {
    fields: [qualityControlTests.batchRecordId],
    references: [batchRecords.id],
  }),
  completedByUser: one(users, {
    fields: [qualityControlTests.completedBy],
    references: [users.id],
  })
}));

export const qualityReviewsRelations = relations(qualityReviews, ({ one }) => ({
  batchRecord: one(batchRecords, {
    fields: [qualityReviews.batchRecordId],
    references: [batchRecords.id],
  }),
  reviewer: one(users, {
    fields: [qualityReviews.reviewerId],
    references: [users.id],
    relationName: "reviewer_quality_reviews"
  })
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertBatchRecordSchema = createInsertSchema(batchRecords).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  submittedAt: true 
});

export const insertManufacturingStepSchema = createInsertSchema(manufacturingSteps).omit({ 
  id: true, 
  createdAt: true, 
  completedAt: true, 
  completedBy: true 
});

export const insertQualityControlTestSchema = createInsertSchema(qualityControlTests).omit({ 
  id: true, 
  createdAt: true, 
  completedAt: true, 
  completedBy: true,
  isPassed: true 
});

export const insertQualityReviewSchema = createInsertSchema(qualityReviews).omit({ 
  id: true, 
  createdAt: true, 
  reviewedAt: true 
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ 
  id: true, 
  createdAt: true 
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type WorkOrder = typeof workOrders.$inferSelect;

export type InsertBatchRecord = z.infer<typeof insertBatchRecordSchema>;
export type BatchRecord = typeof batchRecords.$inferSelect;

export type InsertManufacturingStep = z.infer<typeof insertManufacturingStepSchema>;
export type ManufacturingStep = typeof manufacturingSteps.$inferSelect;

export type InsertQualityControlTest = z.infer<typeof insertQualityControlTestSchema>;
export type QualityControlTest = typeof qualityControlTests.$inferSelect;

export type InsertQualityReview = z.infer<typeof insertQualityReviewSchema>;
export type QualityReview = typeof qualityReviews.$inferSelect;

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// Extended schemas with relationships
export type WorkOrderWithRelations = WorkOrder & {
  product: Product;
  operator: User;
  batchRecord?: BatchRecord;
};

export type BatchRecordWithRelations = BatchRecord & {
  workOrder: WorkOrder;
  operator: User;
  manufacturingSteps: ManufacturingStep[];
  qualityControlTests: QualityControlTest[];
  qualityReview?: QualityReview;
};

export type QualityReviewWithRelations = QualityReview & {
  batchRecord: BatchRecordWithRelations;
  reviewer: User;
};

export type ActivityLogWithRelations = ActivityLog & {
  user: User;
};
