import { baseTemplate, heading, para, infoCard } from '../shared/base.template';

export function verifyEmailTemplate(
  user: { fullName?: string | null },
  verifyUrl: string,
) {
  const name = user.fullName || 'bạn';
  const subject = 'Xác minh địa chỉ email của bạn — Trovia';

  const bodyHtml = `
    ${heading('Xác minh email')}
    ${para(`Xin chào <strong>${name}</strong>,`)}
    ${para('Để hoàn tất đăng ký, vui lòng xác minh địa chỉ email của bạn bằng cách nhấn vào nút bên dưới.')}
    ${infoCard('<strong>⏰ Lưu ý:</strong> Liên kết xác minh có hiệu lực trong vòng <strong>24 giờ</strong>.')}
    ${para('Nếu bạn không tạo tài khoản Trovia, hãy bỏ qua email này.')}
  `;

  return {
    subject,
    html: baseTemplate({
      subject,
      previewText: 'Xác minh email để kích hoạt tài khoản Trovia của bạn',
      bodyHtml,
      ctaLabel: 'Xác minh email ngay',
      ctaUrl: verifyUrl,
    }),
  };
}
