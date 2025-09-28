import React from 'react';
import { Input } from '@/components/ui/input';
import { useLogging } from '@/components/logging/LoggingProvider';

interface LoggedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  functionName: string;
  componentName: string;
  logOnChange?: boolean;
  logOnBlur?: boolean;
  logOnFocus?: boolean;
}

export const LoggedInput: React.FC<LoggedInputProps> = ({
  functionName,
  componentName,
  logOnChange = true,
  logOnBlur = true,
  logOnFocus = false,
  onChange,
  onBlur,
  onFocus,
  ...props
}) => {
  const { logAndTrack } = useLogging();

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (logOnChange) {
      try {
        await logAndTrack(
          functionName,
          componentName,
          'input_change',
          { 
            value: event.target.value,
            name: event.target.name,
            type: event.target.type
          }
        );
      } catch (error) {
        console.error('Input change logging failed:', error);
      }
    }

    if (onChange) {
      onChange(event);
    }
  };

  const handleBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    if (logOnBlur) {
      try {
        await logAndTrack(
          functionName,
          componentName,
          'input_blur',
          { 
            value: event.target.value,
            name: event.target.name
          }
        );
      } catch (error) {
        console.error('Input blur logging failed:', error);
      }
    }

    if (onBlur) {
      onBlur(event);
    }
  };

  const handleFocus = async (event: React.FocusEvent<HTMLInputElement>) => {
    if (logOnFocus) {
      try {
        await logAndTrack(
          functionName,
          componentName,
          'input_focus',
          { 
            name: event.target.name,
            type: event.target.type
          }
        );
      } catch (error) {
        console.error('Input focus logging failed:', error);
      }
    }

    if (onFocus) {
      onFocus(event);
    }
  };

  return (
    <Input
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      {...props}
    />
  );
};