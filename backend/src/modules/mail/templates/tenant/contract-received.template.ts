import { baseTemplate, heading, para, infoCard } from '../shared/base.template';

export function contractReceivedTemplate(
  tenant: { fullName?: string | null },
  contract: {
    id: string;
    propertyTitle: string;
    monthlyRent: number;
    durationMonths: number;
    startDate: Date;
  },
) {
  const name = tenant.fullName || 'bạn';
  const subject = 'Bạn vừa nhận được hợp đồng thuê phòng — Trovia';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const rentFormatted = contract.monthlyRent.toLocaleString('vi-VN');
  const startFormatted = new Date(contract.startDate).toLocaleDateString('vi-VN');

  const bodyHtml = `
    ${heading('Hợp đồng thuê phòng đang chờ ký 📄')}
    ${para(`Xin chào <strong>${name}</strong>,`)}
    ${para(`Chủ nhà đã gửi dự thảo hợp đồng thuê phòng tại <strong>${contract.propertyTitle}</strong>. Vui lòng đọc kỹ các điều khoản trước khi ký.`)}
    ${infoCard(`
      <strong>🏠 Bất động sản:</strong> ${contract.propertyTitle}<br/>
      <strong>💰 Tiền thuê hàng tháng:</strong> ${rentFormatted} VNĐ<br/>
      <strong>⏳ Thời hạn hợp đồng:</strong> ${contract.durationMonths} tháng<br/>
      <strong>📅 Ngày bắt đầu:</strong> ${startFormatted}
    `)}
    ${para('Nhấn vào nút bên dưới để xem chi tiết và ký hợp đồng.')}
  `;

  return {
    subject,
    html: baseTemplate({
      subject,
      previewText: `Hợp đồng thuê phòng tại ${contract.propertyTitle} đang chờ bạn ký`,
      bodyHtml,
      ctaLabel: 'Xem & ký hợp đồng',
      ctaUrl: `${frontendUrl}/app/contracts`,
    }),
  };
}
