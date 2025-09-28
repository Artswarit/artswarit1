import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { useLogger } from '@/hooks/useLogger';

interface LoggingContextType {
  logAndTrack: (
    functionName: string,
    componentName: string,
    actionType: string,
    inputData?: any,
    outputData?: any,
    error?: Error
  ) => Promise<string | undefined>;
  createTask: (taskData: any) => Promise<any>;
  updateTaskStatus: (taskId: string, status: any, metadata?: any) => Promise<void>;
}

const LoggingContext = createContext<LoggingContextType | undefined>(undefined);

export const useLogging = () => {
  const context = useContext(LoggingContext);
  if (!context) {
    throw new Error('useLogging must be used within a LoggingProvider');
  }
  return context;
};

// Higher-order component to wrap functions with logging
export const withLogging = <T extends (...args: any[]) => any>(
  fn: T,
  functionName: string,
  componentName: string,
  actionType: string
): T => {
  return ((...args: Parameters<T>) => {
    const { logAndTrack } = useLogging();
    
    const executeWithLogging = async () => {
      const startTime = performance.now();
      let result: any;
      let error: Error | undefined;

      try {
        result = await fn(...args);
        return result;
      } catch (err) {
        error = err as Error;
        throw err;
      } finally {
        const executionTime = performance.now() - startTime;
        
        // Log the function execution
        logAndTrack(
          functionName,
          componentName,
          actionType,
          args.length > 0 ? args : undefined,
          result,
          error
        ).catch(logErr => {
          console.error('Failed to log function execution:', logErr);
        });
      }
    };

    // Handle both sync and async functions
    if (fn.constructor.name === 'AsyncFunction') {
      return executeWithLogging();
    } else {
      try {
        const result = fn(...args);
        logAndTrack(
          functionName,
          componentName,
          actionType,
          args.length > 0 ? args : undefined,
          result
        ).catch(logErr => {
          console.error('Failed to log function execution:', logErr);
        });
        return result;
      } catch (error) {
        logAndTrack(
          functionName,
          componentName,
          actionType,
          args.length > 0 ? args : undefined,
          undefined,
          error as Error
        ).catch(logErr => {
          console.error('Failed to log function execution:', logErr);
        });
        throw error;
      }
    }
  }) as T;
};

// Hook to wrap component functions with logging
export const useLoggedFunction = <T extends (...args: any[]) => any>(
  fn: T,
  functionName: string,
  componentName: string,
  actionType: string
): T => {
  const { logAndTrack } = useLogging();

  return useCallback(
    withLogging(fn, functionName, componentName, actionType),
    [fn, functionName, componentName, actionType, logAndTrack]
  ) as T;
};

interface LoggingProviderProps {
  children: ReactNode;
}

export const LoggingProvider: React.FC<LoggingProviderProps> = ({ children }) => {
  const { logAndTrack, createTask, updateTaskStatus } = useLogger();

  const value: LoggingContextType = {
    logAndTrack,
    createTask,
    updateTaskStatus
  };

  return (
    <LoggingContext.Provider value={value}>
      {children}
    </LoggingContext.Provider>
  );
};