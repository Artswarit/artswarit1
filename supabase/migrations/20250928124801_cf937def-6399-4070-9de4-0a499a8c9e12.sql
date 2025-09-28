-- Create tasks table for automatic task management
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  function_name TEXT NOT NULL,
  component_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function_logs table for comprehensive logging
CREATE TABLE public.function_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  component_name TEXT,
  action_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_message TEXT,
  execution_time_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function_task_mappings for automatic task assignment
CREATE TABLE public.function_task_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL UNIQUE,
  component_name TEXT,
  task_template JSONB NOT NULL DEFAULT '{}',
  auto_create_task BOOLEAN NOT NULL DEFAULT true,
  auto_assign BOOLEAN NOT NULL DEFAULT false,
  default_priority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.function_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.function_task_mappings ENABLE ROW LEVEL SECURITY;

-- RLS policies for tasks
CREATE POLICY "Users can view tasks assigned to them or created by them"
ON public.tasks FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can create tasks"
ON public.tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks or assigned tasks"
ON public.tasks FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = assigned_to);

-- RLS policies for function_logs
CREATE POLICY "Users can view their own logs"
ON public.function_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert logs"
ON public.function_logs FOR INSERT
WITH CHECK (true);

-- RLS policies for function_task_mappings (admin only for modifications)
CREATE POLICY "Anyone can read function mappings"
ON public.function_task_mappings FOR SELECT
USING (true);

CREATE POLICY "Admin can manage function mappings"
ON public.function_task_mappings FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create indexes for performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at);
CREATE INDEX idx_function_logs_user_id ON public.function_logs(user_id);
CREATE INDEX idx_function_logs_function_name ON public.function_logs(function_name);
CREATE INDEX idx_function_logs_task_id ON public.function_logs(task_id);
CREATE INDEX idx_function_logs_created_at ON public.function_logs(created_at);

-- Add triggers for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_function_task_mappings_updated_at
  BEFORE UPDATE ON public.function_task_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.function_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.function_task_mappings;