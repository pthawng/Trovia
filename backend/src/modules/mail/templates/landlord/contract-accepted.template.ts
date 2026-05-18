import { baseTemplate, heading, para, infoCard } from '../shared/base.template';

export function contractAcceptedTemplate(
  landlord: { fullName?: string | null },
  contract: { id: string; propertyTitle: string; tenantName: string },
) {
  const name = landlord.fullName || 'chủ nhà';
  const subject = `${contract.tenantName} đã ký chấp nhận hợp đồng tại ${contract.propertyTitle}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const bodyHtml = `
    ${heading('Hợp đồng đã được ký ✍️')}
    ${para(`Xin chào <strong>${name}</strong>,`)}
    ${para(`Tuyệt vời! <strong>${contract.tenantName}</strong> đã đọc kỹ và ký chấp nhận hợp đồng thuê phòng tại <strong>${contract.propertyTitle}</strong>.`)}
    ${infoCard(`
      <strong>👤 Người thuê:</strong> ${contract.tenantName}<br/>
      <strong>🏠 Bất động sản:</strong> ${contract.propertyTitle}<br/>
      <strong>📋 Trạng thái:</strong> <span style="color:#16a34a;font-weight:600;">Đã ký chấp nhận ✅</span>
    `)}
    ${para('Người thuê sẽ hoàn tất thanh toán đặt cọc để hợp đồng chính thức có hiệu lực. Bạn sẽ nhận được thông báo khi khoản cọc được thanh toán.')}
  `;

  return {
    subject,
    html: baseTemplate({
      subject,
      previewText: `${contract.tenantName} đã ký hợp đồng tại ${contract.propertyTitle}`,
      bodyHtml,
      ctaLabel: 'Xem hợp đồng',
      ctaUrl: `${frontendUrl}/app/landlord`,
    }),
  };
}
