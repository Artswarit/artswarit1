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

// Removed withLogging HOC to avoid invalid hook usage.
// Use useLoggedFunction to wrap functions with logging.


// Hook to wrap component functions with logging
export const useLoggedFunction = <T extends (...args: any[]) => any>(
  fn: T,
  functionName: string,
  componentName: string,
  actionType: string
): T => {
  const { logAndTrack } = useLogging();

  return useCallback((...args: Parameters<T>) => {
    const startTime = performance.now();
    try {
      const result = (fn as any)(...args);
      if (result && typeof (result as any).then === 'function') {
        return (result as Promise<any>)
          .then((res) => {
            logAndTrack(
              functionName,
              componentName,
              actionType,
              args.length > 0 ? args : undefined,
              res
            ).catch((logErr) => console.error('Failed to log function execution:', logErr));
            return res as ReturnType<T>;
          })
          .catch((err: Error) => {
            logAndTrack(
              functionName,
              componentName,
              actionType,
              args.length > 0 ? args : undefined,
              undefined,
              err
            ).catch((logErr) => console.error('Failed to log function execution:', logErr));
            throw err;
          });
      } else {
        logAndTrack(
          functionName,
          componentName,
          actionType,
          args.length > 0 ? args : undefined,
          result
        ).catch((logErr) => console.error('Failed to log function execution:', logErr));
        return result as ReturnType<T>;
      }
    } catch (error) {
      logAndTrack(
        functionName,
        componentName,
        actionType,
        args.length > 0 ? args : undefined,
        undefined,
        error as Error
      ).catch((logErr) => console.error('Failed to log function execution:', logErr));
      throw error;
    }
  }, [fn, functionName, componentName, actionType, logAndTrack]) as T;
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