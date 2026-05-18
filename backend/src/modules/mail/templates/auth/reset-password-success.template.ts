import { baseTemplate, heading, para, infoCard } from '../shared/base.template';

export function resetPasswordSuccessTemplate(user: { fullName?: string | null }) {
  const name = user.fullName || 'bạn';
  const subject = 'Mật khẩu Trovia đã được thay đổi thành công';

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const bodyHtml = `
    ${heading('Mật khẩu đã được đặt lại ✅')}
    ${para(`Xin chào <strong>${name}</strong>,`)}
    ${para(`Mật khẩu tài khoản Trovia của bạn đã được thay đổi thành công vào lúc <strong>${new Date().toLocaleString('vi-VN')}</strong>.`)}
    ${infoCard(`
      <strong>⚠️ Không phải bạn thực hiện thao tác này?</strong><br/>
      Hãy liên hệ ngay với chúng tôi qua
      <a href="mailto:support@trovia.vn" style="color:#4f46e5;">support@trovia.vn</a>
      để khóa tài khoản và được hỗ trợ kịp thời.
    `)}
  `;

  return {
    subject,
    html: baseTemplate({
      subject,
      previewText: 'Mật khẩu tài khoản Trovia của bạn đã được thay đổi',
      bodyHtml,
      ctaLabel: 'Đăng nhập',
      ctaUrl: `${frontendUrl}/login`,
    }),
  };
}
