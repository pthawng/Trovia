import { baseTemplate, heading, para, infoCard } from '../shared/base.template';

export function rentalRequestSubmittedTemplate(
  tenant: { fullName?: string | null },
  request: { id: string; propertyTitle: string; roomTitle?: string | null },
) {
  const name = tenant.fullName || 'bạn';
  const subject = 'Yêu cầu thuê phòng đã được gửi — Trovia';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const bodyHtml = `
    ${heading('Yêu cầu thuê phòng đã được gửi ✅')}
    ${para(`Xin chào <strong>${name}</strong>,`)}
    ${para('Yêu cầu thuê phòng của bạn đã được gửi thành công. Chủ nhà sẽ xem xét và phản hồi sớm nhất có thể.')}
    ${infoCard(`
      <strong>📍 Bất động sản:</strong> ${request.propertyTitle}<br/>
      ${request.roomTitle ? `<strong>🚪 Phòng:</strong> ${request.roomTitle}<br/>` : ''}
      <strong>🔖 Mã yêu cầu:</strong> <code>${request.id.slice(0, 8).toUpperCase()}</code>
    `)}
    ${para('Bạn có thể theo dõi trạng thái yêu cầu trong mục <strong>Yêu cầu thuê</strong> trên ứng dụng.')}
  `;

  return {
    subject,
    html: baseTemplate({
      subject,
      previewText: `Yêu cầu thuê phòng tại ${request.propertyTitle} đã được gửi`,
      bodyHtml,
      ctaLabel: 'Xem yêu cầu của tôi',
      ctaUrl: `${frontendUrl}/app/requests`,
    }),
  };
}
