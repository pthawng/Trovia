import { baseTemplate, heading, para, infoCard } from '../shared/base.template';

const TYPE_MAP: Record<string, string> = {
  DEPOSIT: 'Tiền đặt cọc',
  FIRST_MONTH_RENT: 'Tiền thuê tháng đầu',
  MONTHLY_RENT: 'Tiền thuê hàng tháng',
  SERVICE_FEE: 'Phí dịch vụ',
};

export function tenantPaymentPaidTemplate(
  landlord: { fullName?: string | null },
  payment: { id: string; propertyTitle: string; amount: number; type: string },
) {
  const name = landlord.fullName || 'chủ nhà';
  const subject = `Người thuê đã thanh toán ${TYPE_MAP[payment.type] ?? payment.type} — ${payment.propertyTitle}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const amountFormatted = payment.amount.toLocaleString('vi-VN');

  const bodyHtml = `
    ${heading('Nhận thanh toán thành công 💰')}
    ${para(`Xin chào <strong>${name}</strong>,`)}
    ${para(`Người thuê đã hoàn tất thanh toán <strong>${TYPE_MAP[payment.type] ?? payment.type}</strong> tại <strong>${payment.propertyTitle}</strong>.`)}
    ${infoCard(`
      <strong>💰 Số tiền:</strong> <span style="font-size:18px;font-weight:700;color:#16a34a;">${amountFormatted} VNĐ</span><br/>
      <strong>📋 Loại:</strong> ${TYPE_MAP[payment.type] ?? payment.type}<br/>
      <strong>🏠 Bất động sản:</strong> ${payment.propertyTitle}<br/>
      <strong>📅 Ngày nhận:</strong> ${new Date().toLocaleDateString('vi-VN')}
    `)}
    ${payment.type === 'DEPOSIT'
      ? para('Hợp đồng đã chính thức có hiệu lực và phòng đã được đặt. Chào mừng người thuê mới! 🎉')
      : para('Giao dịch đã được ghi nhận trong hệ thống Trovia.')}
  `;

  return {
    subject,
    html: baseTemplate({
      subject,
      previewText: `Nhận ${amountFormatted} VNĐ từ người thuê tại ${payment.propertyTitle}`,
      bodyHtml,
      ctaLabel: 'Xem lịch sử giao dịch',
      ctaUrl: `${frontendUrl}/app/landlord`,
    }),
  };
}
