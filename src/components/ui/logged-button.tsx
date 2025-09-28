import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useLogging } from '@/components/logging/LoggingProvider';

interface LoggedButtonProps extends ButtonProps {
  functionName: string;
  componentName: string;
  actionType: string;
  inputData?: any;
}

export const LoggedButton: React.FC<LoggedButtonProps> = ({
  functionName,
  componentName,
  actionType,
  inputData,
  onClick,
  children,
  ...props
}) => {
  const { logAndTrack } = useLogging();

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      // Log the button click
      await logAndTrack(
        functionName,
        componentName,
        actionType,
        { inputData, event: 'click' }
      );

      // Execute the original onClick handler
      if (onClick) {
        onClick(event);
      }
    } catch (error) {
      console.error('Button click logging failed:', error);
      // Still execute the original onClick handler even if logging fails
      if (onClick) {
        onClick(event);
      }
    }
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
};