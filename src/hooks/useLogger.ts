import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LogEntry {
  function_name: string;
  component_name?: string;
  action_type: string;
  input_data?: any;
  output_data?: any;
  error_message?: string;
  execution_time_ms?: number;
  success?: boolean;
  task_id?: string;
}

export interface TaskData {
  title: string;
  description?: string;
  function_name: string;
  component_name?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: any;
}

export const useLogger = () => {
  const { user } = useAuth();

  const logFunction = useCallback(async (logEntry: LogEntry) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('function_logs')
        .insert({
          ...logEntry,
          user_id: user.id,
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent,
          session_id: user.id // Using user ID as session for now
        });

      if (error) {
        console.error('Failed to log function:', error);
      }
    } catch (err) {
      console.error('Logger error:', err);
    }
  }, [user]);

  const createTask = useCallback(async (taskData: TaskData) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: user.id,
          assigned_to: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create task:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Task creation error:', err);
      return null;
    }
  }, [user]);

  const updateTaskStatus = useCallback(async (
    taskId: string, 
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled',
    metadata?: any
  ) => {
    try {
      const updates: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'in_progress' && !metadata?.started_at) {
        updates.started_at = new Date().toISOString();
      }

      if (status === 'completed' || status === 'failed') {
        updates.completed_at = new Date().toISOString();
      }

      if (metadata) {
        updates.metadata = metadata;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) {
        console.error('Failed to update task status:', error);
      }
    } catch (err) {
      console.error('Task update error:', err);
    }
  }, []);

  const checkFunctionMapping = useCallback(async (functionName: string, componentName?: string) => {
    try {
      const { data, error } = await supabase
        .from('function_task_mappings')
        .select('*')
        .eq('function_name', functionName)
        .maybeSingle();

      if (error) {
        console.error('Failed to check function mapping:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Function mapping check error:', err);
      return null;
    }
  }, []);

  const logAndTrack = useCallback(async (
    functionName: string,
    componentName: string,
    actionType: string,
    inputData?: any,
    outputData?: any,
    error?: Error
  ) => {
    const startTime = performance.now();
    
    try {
      // Check if this function should auto-create tasks
      const mapping = await checkFunctionMapping(functionName, componentName);
      let taskId: string | undefined;

      if (mapping?.auto_create_task) {
        const taskTemplate = mapping.task_template as any;
        const task = await createTask({
          title: taskTemplate?.title || `${actionType} in ${componentName}`,
          description: taskTemplate?.description || `Automated task for ${functionName}`,
          function_name: functionName,
          component_name: componentName,
          priority: mapping.default_priority as any,
          metadata: { auto_created: true, input_data: inputData }
        });
        taskId = task?.id;
      }

      const executionTime = Math.round(performance.now() - startTime);

      // Log the function execution
      await logFunction({
        function_name: functionName,
        component_name: componentName,
        action_type: actionType,
        input_data: inputData,
        output_data: outputData,
        error_message: error?.message,
        execution_time_ms: executionTime,
        success: !error,
        task_id: taskId
      });

      // Update task status if task was created
      if (taskId) {
        await updateTaskStatus(
          taskId,
          error ? 'failed' : 'completed',
          { 
            execution_time_ms: executionTime,
            error_message: error?.message,
            output_data: outputData
          }
        );
      }

      return taskId;
    } catch (logError) {
      console.error('Failed to log and track:', logError);
    }
  }, [logFunction, createTask, updateTaskStatus, checkFunctionMapping]);

  return {
    logFunction,
    createTask,
    updateTaskStatus,
    checkFunctionMapping,
    logAndTrack
  };
};

// Helper function to get client IP (approximation)
async function getClientIP(): Promise<string | null> {
  try {
    const response = await fetch('https://ipapi.co/ip/');
    return await response.text();
  } catch {
    return null;
  }
}