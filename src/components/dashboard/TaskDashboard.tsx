import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTaskManager } from '@/hooks/useTaskManager';
import { useLogging } from '@/components/logging/LoggingProvider';
import { Activity, CheckCircle, Clock, AlertCircle, BarChart3, Zap } from 'lucide-react';
import { format } from 'date-fns';

export const TaskDashboard: React.FC = () => {
  const { tasks, logs, loading, updateTask, getTaskStats, getLogStats } = useTaskManager();
  const { logAndTrack } = useLogging();
  const [selectedTab, setSelectedTab] = useState('overview');

  const taskStats = getTaskStats();
  const logStats = getLogStats();

  const getRecentActivity = () => {
    const activities = [
      ...tasks.map(task => ({ ...task, itemType: 'task' as const })),
      ...logs.map(log => ({ ...log, itemType: 'log' as const }))
    ];
    return activities
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  };

  const recentActivity = getRecentActivity();

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      await logAndTrack(
        'handleTaskStatusUpdate',
        'TaskDashboard',
        'task_status_update',
        { taskId, newStatus }
      );
      
      await updateTask(taskId, { 
        status: newStatus as any,
        ...(newStatus === 'in_progress' && { started_at: new Date().toISOString() }),
        ...(newStatus === 'completed' && { completed_at: new Date().toISOString() })
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'failed': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task & Logging Dashboard</h1>
          <p className="text-muted-foreground">Monitor system activity and task progress</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {taskStats.completionRate.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.completed}</div>
            <Progress value={taskStats.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Function Calls</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {logStats.successRate.toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Execution</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logStats.avgExecutionTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="logs">Function Logs</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Pending</span>
                  <Badge variant="outline">{taskStats.pending}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>In Progress</span>
                  <Badge variant="secondary">{taskStats.inProgress}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Completed</span>
                  <Badge variant="default">{taskStats.completed}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Failed</span>
                  <Badge variant="destructive">{taskStats.failed}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Success Rate</span>
                  <span className="font-semibold">{logStats.successRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Calls</span>
                  <span className="font-semibold">{logStats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Failed Calls</span>
                  <span className="font-semibold text-red-600">{logStats.failed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Avg Response Time</span>
                  <span className="font-semibold">{logStats.avgExecutionTime}ms</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(task.priority) as any}>
                        {task.priority}
                      </Badge>
                      <Badge variant={getStatusColor(task.status) as any}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {task.description || `Function: ${task.function_name}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Created: {format(new Date(task.created_at), 'PPp')}
                      {task.component_name && (
                        <span className="ml-2">Component: {task.component_name}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {task.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleTaskStatusUpdate(task.id, 'in_progress')}
                        >
                          Start
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleTaskStatusUpdate(task.id, 'completed')}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {tasks.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No tasks found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="space-y-2">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {log.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{log.function_name}</span>
                      <Badge variant="outline">{log.action_type}</Badge>
                      {log.component_name && (
                        <Badge variant="secondary">{log.component_name}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {log.execution_time_ms && (
                        <span>{log.execution_time_ms}ms</span>
                      )}
                      <span>{format(new Date(log.created_at), 'HH:mm:ss')}</span>
                    </div>
                  </div>
                  {log.error_message && (
                    <div className="mt-2 text-sm text-red-600">
                      Error: {log.error_message}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {logs.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No function logs found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="space-y-2">
            {recentActivity.map((item) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.itemType === 'log' ? (
                        <>
                          <Zap className="h-4 w-4 text-blue-600" />
                          <span>Function Call: {(item as any).function_name}</span>
                        </>
                      ) : (
                        <>
                          <Activity className="h-4 w-4 text-purple-600" />
                          <span>Task: {(item as any).title}</span>
                        </>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(item.created_at), 'PPp')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {recentActivity.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No recent activity</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};