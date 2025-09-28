import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  function_name: string;
  component_name?: string | null;
  user_id: string;
  assigned_to?: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata: any;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FunctionLog {
  id: string;
  function_name: string;
  component_name?: string;
  action_type: string;
  user_id: string;
  task_id?: string;
  input_data: any;
  output_data: any;
  error_message?: string;
  execution_time_ms?: number;
  success: boolean;
  created_at: string;
}

export const useTaskManager = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<FunctionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data || []).map(task => ({
        ...task,
        status: task.status as Task['status'],
        priority: task.priority as Task['priority']
      })));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, [user]);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('function_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  }, [user]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Task change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [payload.new as Task, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(task => 
              task.id === payload.new.id ? payload.new as Task : task
            ));
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => task.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `assigned_to=eq.${user.id}`
        },
        (payload) => {
          console.log('Assigned task change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            setTasks(prev => {
              const exists = prev.find(t => t.id === payload.new.id);
              return exists ? prev : [payload.new as Task, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(task => 
              task.id === payload.new.id ? payload.new as Task : task
            ));
          }
        }
      )
      .subscribe();

    const logsChannel = supabase
      .channel('logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'function_logs',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Log change received:', payload);
          setLogs(prev => [payload.new as FunctionLog, ...prev.slice(0, 99)]);
        }
      )
      .subscribe();

    setRealtimeSubscription({ tasksChannel, logsChannel });

    return () => {
      tasksChannel.unsubscribe();
      logsChannel.unsubscribe();
    };
  }, [user]);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      Promise.all([fetchTasks(), fetchLogs()]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user, fetchTasks, fetchLogs]);

  // Task management functions
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }, []);

  // Analytics functions
  const getTaskStats = useCallback(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const failed = tasks.filter(t => t.status === 'failed').length;

    return {
      total,
      completed,
      pending,
      inProgress,
      failed,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }, [tasks]);

  const getLogStats = useCallback(() => {
    const total = logs.length;
    const successful = logs.filter(l => l.success).length;
    const failed = logs.filter(l => !l.success).length;
    const avgExecutionTime = logs.length > 0 
      ? logs.reduce((sum, log) => sum + (log.execution_time_ms || 0), 0) / logs.length 
      : 0;

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      avgExecutionTime: Math.round(avgExecutionTime)
    };
  }, [logs]);

  const getRecentActivity = useCallback(() => {
    return [...tasks, ...logs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }, [tasks, logs]);

  return {
    tasks,
    logs,
    loading,
    updateTask,
    deleteTask,
    fetchTasks,
    fetchLogs,
    getTaskStats,
    getLogStats,
    getRecentActivity,
    realtimeSubscription
  };
};