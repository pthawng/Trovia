import { baseTemplate, heading, para, infoCard } from '../shared/base.template';

export function moveOutRequestTemplate(
  landlord: { fullName?: string | null },
  tenancy: {
    id: string;
    propertyTitle: string;
    roomTitle: string;
    tenantName: string;
  },
) {
  const name = landlord.fullName || 'chủ nhà';
  const subject = `Người thuê yêu cầu trả phòng tại ${tenancy.propertyTitle}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const bodyHtml = `
    ${heading('Yêu cầu trả phòng mới 🏠')}
    ${para(`Xin chào <strong>${name}</strong>,`)}
    ${para(`<strong>${tenancy.tenantName}</strong> đã gửi yêu cầu trả phòng và kết thúc hợp đồng thuê. Bạn cần xác nhận để hoàn tất thủ tục.`)}
    ${infoCard(`
      <strong>👤 Người thuê:</strong> ${tenancy.tenantName}<br/>
      <strong>🏠 Bất động sản:</strong> ${tenancy.propertyTitle}<br/>
      <strong>🚪 Phòng:</strong> ${tenancy.roomTitle}<br/>
      <strong>📅 Ngày yêu cầu:</strong> ${new Date().toLocaleDateString('vi-VN')}
    `)}
    ${para('Sau khi bạn phê duyệt, hợp đồng sẽ kết thúc và phòng trở về trạng thái sẵn sàng cho thuê.')}
  `;

  return {
    subject,
    html: baseTemplate({
      subject,
      previewText: `${tenancy.tenantName} yêu cầu trả phòng tại ${tenancy.propertyTitle}`,
      bodyHtml,
      ctaLabel: 'Xem & phê duyệt',
      ctaUrl: `${frontendUrl}/app/landlord`,
    }),
  };
}
