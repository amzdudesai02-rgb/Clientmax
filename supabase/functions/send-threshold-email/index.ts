import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ThresholdEmailRequest {
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

const handler = async (req: Request): Promise<Response> => {
  console.log("Threshold email function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      notificationType,
      recipientEmail,
      recipientName,
      thresholdType,
      thresholdValue,
      actualValue,
      clientName,
      teamLeadName,
      department,
      additionalDetails
    }: ThresholdEmailRequest = await req.json();

    console.log("Sending threshold email:", { notificationType, recipientEmail, thresholdType });

    let subject = "";
    let htmlContent = "";

    switch (notificationType) {
      case 'feedback_alert':
        subject = `⚠️ Low Client Feedback Score Alert - ${clientName || 'Client'}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">⚠️ Feedback Alert</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937;">Low Client Feedback Score Detected</h2>
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
                <p><strong>Client:</strong> ${clientName || 'Unknown'}</p>
                <p><strong>Feedback Score:</strong> <span style="color: #ef4444; font-size: 24px; font-weight: bold;">${actualValue}/10</span></p>
                <p><strong>Threshold:</strong> Below ${thresholdValue}/10</p>
                ${additionalDetails ? `<p><strong>Details:</strong> ${additionalDetails}</p>` : ''}
              </div>
              <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px;">
                <p style="margin: 0; color: #92400e;"><strong>Recommended Action:</strong> Schedule a call with the client to understand their concerns and address any issues.</p>
              </div>
            </div>
            <div style="padding: 20px; background: #1f2937; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">ClientMax Pro - Automated Alert System</p>
            </div>
          </div>
        `;
        break;

      case 'utilization_alert':
        subject = `📊 Team Utilization Alert - ${department || 'Department'}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">📊 Utilization Alert</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937;">Team Utilization Below Threshold</h2>
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p><strong>Team Lead:</strong> ${teamLeadName || 'Unknown'}</p>
                <p><strong>Department:</strong> ${department || 'Unknown'}</p>
                <p><strong>Current Utilization:</strong> <span style="color: #f59e0b; font-size: 24px; font-weight: bold;">${actualValue}%</span></p>
                <p><strong>Threshold:</strong> Below ${thresholdValue}%</p>
              </div>
              <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px;">
                <p style="margin: 0; color: #92400e;"><strong>Recommended Action:</strong> Review team capacity and consider reallocating resources or taking on additional clients.</p>
              </div>
            </div>
            <div style="padding: 20px; background: #1f2937; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">ClientMax Pro - Automated Alert System</p>
            </div>
          </div>
        `;
        break;

      case 'critical_alert':
        subject = `🚨 Critical Alert - Immediate Attention Required`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">🚨 Critical Alert</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937;">Immediate Attention Required</h2>
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
                <p><strong>Alert Type:</strong> ${thresholdType}</p>
                <p><strong>Current Value:</strong> <span style="color: #dc2626; font-size: 24px; font-weight: bold;">${actualValue}</span></p>
                <p><strong>Expected Threshold:</strong> ${thresholdValue}</p>
                ${clientName ? `<p><strong>Client:</strong> ${clientName}</p>` : ''}
                ${additionalDetails ? `<p><strong>Details:</strong> ${additionalDetails}</p>` : ''}
              </div>
              <div style="margin-top: 20px; padding: 15px; background: #fee2e2; border-radius: 8px;">
                <p style="margin: 0; color: #991b1b;"><strong>Action Required:</strong> This alert requires immediate attention. Please review and take appropriate action.</p>
              </div>
            </div>
            <div style="padding: 20px; background: #1f2937; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">ClientMax Pro - Automated Alert System</p>
            </div>
          </div>
        `;
        break;
    }

    const emailResponse = await resend.emails.send({
      from: "ClientMax Pro <onboarding@resend.dev>",
      to: [recipientEmail],
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the email to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("email_notification_log").insert({
      notification_type: notificationType,
      recipient_email: recipientEmail,
      subject,
      threshold_type: thresholdType,
      threshold_value: thresholdValue,
      actual_value: actualValue,
      status: 'sent'
    });

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in send-threshold-email function:", error);
    const err = error instanceof Error ? error : new Error(String(error));
    
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
