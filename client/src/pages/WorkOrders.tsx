import { useState } from "react";
import { PlusIcon, FilterIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import CreateWorkOrderForm from "@/components/WorkOrders/CreateWorkOrderForm";
import WorkOrderTable from "@/components/WorkOrders/WorkOrderTable";
import { WorkOrderWithRelations } from "@shared/schema";

const WorkOrders = () => {
  const [newWorkOrderDialogOpen, setNewWorkOrderDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleViewWorkOrder = (workOrder: WorkOrderWithRelations) => {
    // View handler is implemented in the WorkOrderTable component
    console.log("View work order:", workOrder.workOrderNumber);
  };

  const handleEditWorkOrder = (workOrder: WorkOrderWithRelations) => {
    // Edit handler is implemented in the WorkOrderTable component
    console.log("Edit work order:", workOrder.workOrderNumber);
  };

  return (
    <div className="space-y-6">
      {/* Header section with title and "New Work Order" button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Work Orders</h2>
        <Dialog open={newWorkOrderDialogOpen} onOpenChange={setNewWorkOrderDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-dark">
              <PlusIcon className="h-5 w-5 mr-2" />
              <span>New Work Order</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="text-lg font-medium mb-4">Create New Work Order</div>
            <CreateWorkOrderForm onSuccess={() => setNewWorkOrderDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="statusFilter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <Label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">Date Range</Label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger id="dateFilter">
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <Label htmlFor="productFilter" className="block text-sm font-medium text-gray-700 mb-1">Product</Label>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger id="productFilter">
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="moisturizer">Moisturizer</SelectItem>
                <SelectItem value="cleanser">Cleanser</SelectItem>
                <SelectItem value="serum">Serum</SelectItem>
                <SelectItem value="sunscreen">Sunscreen</SelectItem>
                <SelectItem value="mask">Face Mask</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <Label htmlFor="workOrderSearch" className="block text-sm font-medium text-gray-700 mb-1">Search</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="workOrderSearch"
                className="pl-10"
                placeholder="Search by ID, product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Work Orders Table */}
      <WorkOrderTable 
        onViewClick={handleViewWorkOrder}
        onEditClick={handleEditWorkOrder}
      />
    </div>
  );
};

export default WorkOrders;
