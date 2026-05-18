/**
 * Shared base HTML wrapper for all Trovia transactional emails.
 *
 * Usage:
 *   import { baseTemplate } from '../shared/base.template';
 *   return baseTemplate({ subject: '...', bodyHtml: '...' });
 */

export interface BaseTemplateOptions {
  subject: string;
  previewText?: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export function baseTemplate(opts: BaseTemplateOptions): string {
  const { subject, previewText = subject, bodyHtml, ctaLabel, ctaUrl } = opts;

  const ctaBlock =
    ctaLabel && ctaUrl
      ? `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
        <tr>
          <td align="center">
            <a href="${ctaUrl}"
               target="_blank"
               style="
                 display:inline-block;
                 background:#4f46e5;
                 color:#ffffff;
                 font-family:'Inter',sans-serif;
                 font-size:15px;
                 font-weight:600;
                 letter-spacing:0.3px;
                 text-decoration:none;
                 border-radius:10px;
                 padding:14px 36px;
                 mso-padding-alt:0;
                 border:0;
               ">
              ${ctaLabel}
            </a>
          </td>
        </tr>
      </table>`
      : '';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${subject}</title>
  <!--[if !mso]><!-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  </style>
  <!--<![endif]-->
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Inter',Arial,sans-serif;">
  <!-- preview text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${previewText}&nbsp;&#847;&nbsp;
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f7;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="https://trovia.vn" target="_blank" style="text-decoration:none;">
                <span style="
                  display:inline-block;
                  font-family:'Inter',sans-serif;
                  font-size:26px;
                  font-weight:700;
                  color:#4f46e5;
                  letter-spacing:-0.5px;
                ">Trovia</span>
              </a>
            </td>
          </tr>

          <!-- CARD -->
          <tr>
            <td style="
              background:#ffffff;
              border-radius:16px;
              padding:40px 44px;
              box-shadow:0 2px 12px rgba(0,0,0,0.06);
            ">
              ${bodyHtml}
              ${ctaBlock}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                Bạn nhận được email này vì tài khoản Trovia của bạn đã kích hoạt thông báo.<br/>
                Nếu bạn cần hỗ trợ, hãy liên hệ
                <a href="mailto:support@trovia.vn" style="color:#4f46e5;text-decoration:none;">support@trovia.vn</a>.<br/>
                &copy; ${new Date().getFullYear()} Trovia &mdash; Nền tảng cho thuê nhà thông minh.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Renders a subtle info card inside the email body */
export function infoCard(html: string): string {
  return `<div style="
    background:#f8f7ff;
    border-left:4px solid #4f46e5;
    border-radius:8px;
    padding:16px 20px;
    margin:24px 0;
    font-size:14px;
    color:#374151;
    line-height:1.7;
  ">${html}</div>`;
}

/** Standard heading style */
export function heading(text: string): string {
  return `<h1 style="
    margin:0 0 8px;
    font-size:22px;
    font-weight:700;
    color:#111827;
    letter-spacing:-0.3px;
  ">${text}</h1>`;
}

/** Standard body paragraph */
export function para(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.7;">${text}</p>`;
}
