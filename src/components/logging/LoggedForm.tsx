import React from 'react';
import { useLogging } from './LoggingProvider';

interface LoggedFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  functionName: string;
  componentName: string;
  logOnSubmit?: boolean;
  formData?: any;
}

export const LoggedForm: React.FC<LoggedFormProps> = ({
  functionName,
  componentName,
  logOnSubmit = true,
  formData,
  onSubmit,
  children,
  ...props
}) => {
  const { logAndTrack } = useLogging();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (logOnSubmit) {
      try {
        const formElement = event.currentTarget;
        const formDataObj = new FormData(formElement);
        const formValues = Object.fromEntries(formDataObj.entries());

        await logAndTrack(
          functionName,
          componentName,
          'form_submit',
          {
            formData: formData || formValues,
            timestamp: new Date().toISOString()
          }
        );
      } catch (error) {
        console.error('Form submit logging failed:', error);
      }
    }

    if (onSubmit) {
      onSubmit(event);
    }
  };

  return (
    <form onSubmit={handleSubmit} {...props}>
      {children}
    </form>
  );
};
