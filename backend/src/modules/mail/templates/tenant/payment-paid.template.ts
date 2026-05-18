import { baseTemplate, heading, para, infoCard } from '../shared/base.template';

const TYPE_MAP: Record<string, string> = {
  DEPOSIT: 'Tiền đặt cọc',
  FIRST_MONTH_RENT: 'Tiền thuê tháng đầu',
  MONTHLY_RENT: 'Tiền thuê hàng tháng',
  SERVICE_FEE: 'Phí dịch vụ',
};

export function paymentPaidTenantTemplate(
  tenant: { fullName?: string | null },
  payment: { id: string; propertyTitle: string; amount: number; type: string },
) {
  const name = tenant.fullName || 'bạn';
  const subject = 'Thanh toán của bạn đã được xác nhận — Trovia';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const amountFormatted = payment.amount.toLocaleString('vi-VN');

  const bodyHtml = `
    ${heading('Thanh toán thành công ✅')}
    ${para(`Xin chào <strong>${name}</strong>,`)}
    ${para(`Khoản thanh toán <strong>${TYPE_MAP[payment.type] ?? payment.type}</strong> của bạn tại <strong>${payment.propertyTitle}</strong> đã được xác nhận thành công.`)}
    ${infoCard(`
      <strong>💰 Số tiền:</strong> <span style="font-size:18px;font-weight:700;color:#16a34a;">${amountFormatted} VNĐ</span><br/>
      <strong>📋 Loại:</strong> ${TYPE_MAP[payment.type] ?? payment.type}<br/>
      <strong>🏠 Bất động sản:</strong> ${payment.propertyTitle}<br/>
      <strong>📅 Ngày thanh toán:</strong> ${new Date().toLocaleDateString('vi-VN')}
    `)}
    ${para('Cảm ơn bạn đã thanh toán đúng hạn! 🎉')}
  `;

  return {
    subject,
    html: baseTemplate({
      subject,
      previewText: `Thanh toán ${amountFormatted} VNĐ thành công tại ${payment.propertyTitle}`,
      bodyHtml,
      ctaLabel: 'Xem lịch sử thanh toán',
      ctaUrl: `${frontendUrl}/app/payments`,
    }),
  };
}
