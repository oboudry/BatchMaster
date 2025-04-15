import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User } from "@shared/schema";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  
  // Get current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/current-user'],
  });
  
  // Handle form submit (mock function)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would submit the form data to the server
    alert("Settings saved successfully!");
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted grid w-full grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Manage your account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xl font-bold">
                    {currentUser?.fullName.split(' ').map(name => name[0]).join('')}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue={currentUser?.fullName} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={currentUser?.username} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={currentUser?.email || ''} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" readOnly value={
                      currentUser?.role === 'quality_controller' ? 'Quality Controller' : 
                      currentUser?.role === 'operator' ? 'Operator' : 'Admin'
                    } />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you want to be notified about system events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notifyNewWorkOrder" />
                      <Label htmlFor="notifyNewWorkOrder">New work order assigned to you</Label>
                    </div>
                    <Select defaultValue="immediately">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediately">Immediately</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notifyQCRequest" defaultChecked />
                      <Label htmlFor="notifyQCRequest">Batch record ready for QC review</Label>
                    </div>
                    <Select defaultValue="immediately">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediately">Immediately</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notifyQCDecision" defaultChecked />
                      <Label htmlFor="notifyQCDecision">QC decision made</Label>
                    </div>
                    <Select defaultValue="immediately">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediately">Immediately</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notifyReports" />
                      <Label htmlFor="notifyReports">Weekly production reports</Label>
                    </div>
                    <Select defaultValue="weekly">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium pt-4">In-App Notifications</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inAppNotifications">Enable in-app notifications</Label>
                    <Switch id="inAppNotifications" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notificationSound">Play sound for new notifications</Label>
                    <Switch id="notificationSound" />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit">Save Preferences</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings and defaults.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Quality Control Workflow</h3>
                
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="defaultQCApprover">Default QC Approver</Label>
                    <Select defaultValue="3">
                      <SelectTrigger id="defaultQCApprover">
                        <SelectValue placeholder="Select approver" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">Sara Williams</SelectItem>
                        <SelectItem value="4">David Smith</SelectItem>
                        <SelectItem value="5">Emily Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="requireDoubleQC">Require double QC approval for high-value batches</Label>
                    <Switch id="requireDoubleQC" />
                  </div>
                </div>
                
                <h3 className="text-lg font-medium pt-4">Work Order Settings</h3>
                
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="workOrderNumberFormat">Work Order Number Format</Label>
                    <Select defaultValue="WO-YYYY-XXX">
                      <SelectTrigger id="workOrderNumberFormat">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WO-YYYY-XXX">WO-YYYY-XXX</SelectItem>
                        <SelectItem value="WOYYYYXXX">WOYYYYXXX</SelectItem>
                        <SelectItem value="WO/YYYY/XXX">WO/YYYY/XXX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="batchNumberFormat">Batch Number Format</Label>
                    <Select defaultValue="PP-YY-XXX-QTY">
                      <SelectTrigger id="batchNumberFormat">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PP-YY-XXX-QTY">PP-YY-XXX-QTY</SelectItem>
                        <SelectItem value="PPYYXXXQTY">PPYYXXXQTY</SelectItem>
                        <SelectItem value="PP/YY/XXX/QTY">PP/YY/XXX/QTY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium pt-4">Data Retention</h3>
                
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="dataRetentionPeriod">Data Retention Period</Label>
                    <Select defaultValue="5years">
                      <SelectTrigger id="dataRetentionPeriod">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1year">1 Year</SelectItem>
                        <SelectItem value="3years">3 Years</SelectItem>
                        <SelectItem value="5years">5 Years</SelectItem>
                        <SelectItem value="7years">7 Years</SelectItem>
                        <SelectItem value="indefinite">Indefinite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="archiveCompleted">Automatically archive completed work orders</Label>
                    <Switch id="archiveCompleted" defaultChecked />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit">Save System Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-md p-4 cursor-pointer bg-white">
                    <div className="h-20 bg-gray-50 border mb-2 rounded"></div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="lightTheme" checked />
                      <Label htmlFor="lightTheme">Light</Label>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 cursor-pointer">
                    <div className="h-20 bg-gray-800 border border-gray-700 mb-2 rounded"></div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="darkTheme" />
                      <Label htmlFor="darkTheme">Dark</Label>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 cursor-pointer">
                    <div className="h-20 bg-gradient-to-r from-white to-gray-800 border mb-2 rounded"></div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="systemTheme" />
                      <Label htmlFor="systemTheme">System</Label>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium pt-4">Color Scheme</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border rounded-md p-2 cursor-pointer">
                    <div className="h-8 bg-[#0f766e] mb-2 rounded"></div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="tealColor" checked />
                      <Label htmlFor="tealColor">Teal</Label>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-2 cursor-pointer">
                    <div className="h-8 bg-[#1e40af] mb-2 rounded"></div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="blueColor" />
                      <Label htmlFor="blueColor">Blue</Label>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-2 cursor-pointer">
                    <div className="h-8 bg-[#7c3aed] mb-2 rounded"></div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="purpleColor" />
                      <Label htmlFor="purpleColor">Purple</Label>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-2 cursor-pointer">
                    <div className="h-8 bg-[#be123c] mb-2 rounded"></div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="redColor" />
                      <Label htmlFor="redColor">Red</Label>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium pt-4">Layout</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compactMode">Compact Mode</Label>
                    <Switch id="compactMode" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sidebarCollapsed">Collapsed Sidebar by Default</Label>
                    <Switch id="sidebarCollapsed" />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit">Save Appearance</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
