import { supabase } from '@/integrations/supabase/client';

interface ThresholdEmailParams {
  notificationType: 'feedback_alert' | 'utilization_alert' | 'critical_alert';
  recipientEmail: string;
  recipientName?: string;
  thresholdType: string;
  thresholdValue: number;
  actualValue: number;
  clientName?: string;
  teamLeadName?: string;
  department?: string;
  additionalDetails?: string;
}

export const sendThresholdEmail = async (params: ThresholdEmailParams) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-threshold-email', {
      body: params
    });

    if (error) {
      console.error('Error sending threshold email:', error);
      throw error;
    }

    console.log('Threshold email sent:', data);
    return data;
  } catch (error) {
    console.error('Failed to send threshold email:', error);
    throw error;
  }
};

export const checkAndSendFeedbackAlert = async (
  clientName: string,
  feedbackScore: number,
  thresholdValue: number,
  recipientEmail: string
) => {
  if (feedbackScore < thresholdValue) {
    await sendThresholdEmail({
      notificationType: 'feedback_alert',
      recipientEmail,
      thresholdType: 'Client Feedback Score',
      thresholdValue,
      actualValue: feedbackScore,
      clientName
    });
    return true;
  }
  return false;
};

export const checkAndSendUtilizationAlert = async (
  teamLeadName: string,
  department: string,
  utilization: number,
  thresholdValue: number,
  recipientEmail: string
) => {
  if (utilization < thresholdValue) {
    await sendThresholdEmail({
      notificationType: 'utilization_alert',
      recipientEmail,
      thresholdType: 'Team Utilization',
      thresholdValue,
      actualValue: utilization,
      teamLeadName,
      department
    });
    return true;
  }
  return false;
};
