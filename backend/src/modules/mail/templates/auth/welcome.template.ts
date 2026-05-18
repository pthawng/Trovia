import { baseTemplate, heading, para } from '../shared/base.template';

export function welcomeTemplate(user: { fullName?: string | null }) {
  const name = user.fullName || 'bạn';
  const subject = 'Chào mừng bạn đến với Trovia 🎉';

  const bodyHtml = `
    ${heading('Chào mừng đến với Trovia!')}
    ${para(`Xin chào <strong>${name}</strong>,`)}
    ${para('Tài khoản của bạn đã được tạo thành công. Trovia giúp bạn tìm kiếm và thuê nhà thông minh, nhanh chóng và an toàn.')}
    ${para('Bắt đầu khám phá các phòng trọ chất lượng ngay hôm nay — miễn phí, không phí trung gian.')}
    ${para('<em>Đội ngũ Trovia</em>')}
  `;

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  return {
    subject,
    html: baseTemplate({
      subject,
      previewText: `Chào mừng ${name} đến với Trovia!`,
      bodyHtml,
      ctaLabel: 'Khám phá phòng ngay',
      ctaUrl: `${frontendUrl}/app/explore`,
    }),
  };
}
