import { baseTemplate, heading, para, infoCard } from '../shared/base.template';

const TYPE_MAP: Record<string, string> = {
  DEPOSIT: 'Tiền đặt cọc',
  FIRST_MONTH_RENT: 'Tiền thuê tháng đầu',
  MONTHLY_RENT: 'Tiền thuê hàng tháng',
  SERVICE_FEE: 'Phí dịch vụ',
};

export function paymentInvoiceTemplate(
  tenant: { fullName?: string | null },
  payment: {
    id: string;
    propertyTitle: string;
    amount: number;
    type: string;
    dueDate: Date;
  },
) {
  const name = tenant.fullName || 'bạn';
  const subject = `Hóa đơn ${TYPE_MAP[payment.type] ?? payment.type} mới — Trovia`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const amountFormatted = payment.amount.toLocaleString('vi-VN');
  const dueDateFormatted = new Date(payment.dueDate).toLocaleDateString('vi-VN');

  const bodyHtml = `
    ${heading('Hóa đơn thanh toán mới 📄')}
    ${para(`Xin chào <strong>${name}</strong>,`)}
    ${para(`Một hóa đơn mới đã được tạo cho căn hộ tại <strong>${payment.propertyTitle}</strong>.`)}
    ${infoCard(`
      <strong>📋 Loại hóa đơn:</strong> ${TYPE_MAP[payment.type] ?? payment.type}<br/>
      <strong>💰 Số tiền:</strong> <span style="font-size:18px;font-weight:700;color:#4f46e5;">${amountFormatted} VNĐ</span><br/>
      <strong>⏰ Hạn thanh toán:</strong> ${dueDateFormatted}<br/>
      <strong>🏠 Bất động sản:</strong> ${payment.propertyTitle}
    `)}
    ${para('Vui lòng thanh toán trước ngày đến hạn để tránh phát sinh phí trễ hạn.')}
  `;

  return {
    subject,
    html: baseTemplate({
      subject,
      previewText: `Hóa đơn ${TYPE_MAP[payment.type] ?? payment.type}: ${amountFormatted} VNĐ — hạn ${dueDateFormatted}`,
      bodyHtml,
      ctaLabel: 'Thanh toán ngay',
      ctaUrl: `${frontendUrl}/app/payments`,
    }),
  };
}
