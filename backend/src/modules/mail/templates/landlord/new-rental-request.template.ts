import { baseTemplate, heading, para, infoCard } from '../shared/base.template';

export function newRentalRequestTemplate(
  landlord: { fullName?: string | null },
  request: {
    id: string;
    propertyTitle: string;
    tenantName: string;
    moveInDate: Date;
  },
) {
  const name = landlord.fullName || 'chủ nhà';
  const subject = `Có người vừa gửi yêu cầu thuê phòng tại ${request.propertyTitle}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const moveInFormatted = new Date(request.moveInDate).toLocaleDateString('vi-VN');

  const bodyHtml = `
    ${heading('Yêu cầu thuê phòng mới 🏠')}
    ${para(`Xin chào <strong>${name}</strong>,`)}
    ${para(`Bạn vừa nhận được một yêu cầu thuê phòng mới tại <strong>${request.propertyTitle}</strong>.`)}
    ${infoCard(`
      <strong>👤 Người thuê:</strong> ${request.tenantName}<br/>
      <strong>🏠 Bất động sản:</strong> ${request.propertyTitle}<br/>
      <strong>📅 Ngày muốn vào:</strong> ${moveInFormatted}<br/>
      <strong>🔖 Mã yêu cầu:</strong> <code>${request.id.slice(0, 8).toUpperCase()}</code>
    `)}
    ${para('Hãy xem xét và phản hồi sớm để không bỏ lỡ người thuê tốt!')}
  `;

  return {
    subject,
    html: baseTemplate({
      subject,
      previewText: `${request.tenantName} muốn thuê phòng tại ${request.propertyTitle}`,
      bodyHtml,
      ctaLabel: 'Xem yêu cầu ngay',
      ctaUrl: `${frontendUrl}/app/landlord`,
    }),
  };
}
