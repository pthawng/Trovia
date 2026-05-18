import { baseTemplate, heading, para, infoCard } from '../shared/base.template';

export function forgotPasswordTemplate(
  user: { fullName?: string | null },
  resetUrl: string,
) {
  const name = user.fullName || 'bạn';
  const subject = 'Đặt lại mật khẩu Trovia';

  const bodyHtml = `
    ${heading('Yêu cầu đặt lại mật khẩu')}
    ${para(`Xin chào <strong>${name}</strong>,`)}
    ${para('Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Trovia của bạn. Nhấn vào nút bên dưới để tiếp tục.')}
    ${infoCard(`
      <strong>⏰ Liên kết hết hạn sau 15 phút.</strong><br/>
      Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.
    `)}
    ${para('Sau khi đặt lại mật khẩu, tất cả các phiên đăng nhập hiện tại sẽ bị hủy.')}
  `;

  return {
    subject,
    html: baseTemplate({
      subject,
      previewText: 'Nhấn để đặt lại mật khẩu Trovia của bạn (hết hạn sau 15 phút)',
      bodyHtml,
      ctaLabel: 'Đặt lại mật khẩu',
      ctaUrl: resetUrl,
    }),
  };
}
