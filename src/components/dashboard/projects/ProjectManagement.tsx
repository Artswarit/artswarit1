import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, CheckCircle, Loader2 } from "lucide-react";

const ProjectManagement = () => {
  const [projects] = useState([]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Project Management</h2>
          <p className="text-muted-foreground">Manage client projects and track their progress</p>
        </div>
        <Button className="bg-gradient-to-r from-artswarit-purple to-blue-500 border-none">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6 grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="active" className="flex gap-2 items-center">
            <Clock size={16} />
            <span>Active (0)</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex gap-2 items-center">
            <Loader2 size={16} />
            <span>Pending (0)</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex gap-2 items-center">
            <CheckCircle size={16} />
            <span>Completed (0)</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No active projects</h3>
            <p className="text-muted-foreground mt-1">You don't have any active projects at the moment.</p>
            <Button className="mt-4 bg-gradient-to-r from-artswarit-purple to-blue-500 border-none">
              <PlusCircle className="mr-2 h-4 w-4" />
              Start New Project
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
            <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No pending projects</h3>
            <p className="text-muted-foreground mt-1">You don't have any pending project requests at the moment.</p>
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No completed projects</h3>
            <p className="text-muted-foreground mt-1">You haven't completed any projects yet.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectManagement;