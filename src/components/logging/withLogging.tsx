import React, { useEffect } from 'react';
import { useLogging } from './LoggingProvider';

interface WithLoggingOptions {
  componentName: string;
  logMount?: boolean;
  logUnmount?: boolean;
  logProps?: boolean;
}

export function withLogging<P extends object>(
  Component: React.ComponentType<P>,
  options: WithLoggingOptions
) {
  const {
    componentName,
    logMount = true,
    logUnmount = true,
    logProps = false
  } = options;

  return function LoggedComponent(props: P) {
    const { logAndTrack } = useLogging();

    useEffect(() => {
      if (logMount) {
        logAndTrack(
          'componentMount',
          componentName,
          'mount',
          logProps ? { props } : undefined
        ).catch(err => console.error('Component mount logging failed:', err));
      }

      return () => {
        if (logUnmount) {
          logAndTrack(
            'componentUnmount',
            componentName,
            'unmount',
            undefined
          ).catch(err => console.error('Component unmount logging failed:', err));
        }
      };
    }, []);

    return <Component {...props} />;
  };
}
