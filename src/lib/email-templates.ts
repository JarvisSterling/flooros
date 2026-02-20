interface EmailTemplate {
  subject: string;
  html: string;
}

function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#111118;border-radius:12px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;">
        <tr><td style="padding:32px 32px 0;">
          <div style="font-size:20px;font-weight:700;color:#3b82f6;margin-bottom:24px;">FloorOS</div>
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#ffffff;">${title}</h1>
        </td></tr>
        <tr><td style="padding:0 32px 32px;color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;">
          ${body}
        </td></tr>
        <tr><td style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.05);color:rgba(255,255,255,0.3);font-size:12px;">
          &copy; FloorOS &mdash; Event Floor Plan Platform
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function reservationConfirmedEmail(
  exhibitorName: string,
  boothNumber: string,
  eventName: string,
): EmailTemplate {
  return {
    subject: `Booth ${boothNumber} confirmed — ${eventName}`,
    html: baseTemplate(
      'Reservation Confirmed!',
      `<p>Hi ${exhibitorName},</p>
      <p>Great news! Your reservation for <strong style="color:#ffffff;">Booth ${boothNumber}</strong> at <strong style="color:#ffffff;">${eventName}</strong> has been confirmed.</p>
      <p>You can now access your exhibitor portal to manage your booth profile, upload branding, and prepare for the event.</p>
      <div style="margin:24px 0;">
        <a href="#" style="display:inline-block;background-color:#3b82f6;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View Your Booth</a>
      </div>
      <p>If you have any questions, please reach out to the event organizer.</p>`,
    ),
  };
}

export function reservationRejectedEmail(
  exhibitorName: string,
  eventName: string,
): EmailTemplate {
  return {
    subject: `Reservation update — ${eventName}`,
    html: baseTemplate(
      'Reservation Update',
      `<p>Hi ${exhibitorName},</p>
      <p>We regret to inform you that your booth reservation for <strong style="color:#ffffff;">${eventName}</strong> could not be approved at this time.</p>
      <p>This may be due to availability or other factors determined by the event organizer. We encourage you to explore other available booths or reach out to the organizer directly.</p>
      <div style="margin:24px 0;">
        <a href="#" style="display:inline-block;background-color:#3b82f6;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Browse Available Booths</a>
      </div>`,
    ),
  };
}

export function teamInvitationEmail(
  inviterName: string,
  orgName: string,
  role: string,
  inviteLink: string,
): EmailTemplate {
  return {
    subject: `You've been invited to ${orgName} on FloorOS`,
    html: baseTemplate(
      'Team Invitation',
      `<p>Hi there,</p>
      <p><strong style="color:#ffffff;">${inviterName}</strong> has invited you to join <strong style="color:#ffffff;">${orgName}</strong> as a <strong style="color:#ffffff;">${role}</strong> on FloorOS.</p>
      <p>Click the button below to accept the invitation and set up your account.</p>
      <div style="margin:24px 0;">
        <a href="${inviteLink}" style="display:inline-block;background-color:#3b82f6;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Accept Invitation</a>
      </div>
      <p style="font-size:13px;color:rgba(255,255,255,0.4);">If you didn't expect this invitation, you can safely ignore this email.</p>`,
    ),
  };
}

export function passwordResetEmail(resetLink: string): EmailTemplate {
  return {
    subject: 'Reset your FloorOS password',
    html: baseTemplate(
      'Password Reset',
      `<p>We received a request to reset your password. Click the button below to choose a new password.</p>
      <div style="margin:24px 0;">
        <a href="${resetLink}" style="display:inline-block;background-color:#3b82f6;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Reset Password</a>
      </div>
      <p>This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>`,
    ),
  };
}
