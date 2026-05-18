import { baseTemplate, heading, para, infoCard } from '../shared/base.template';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Đang chờ xử lý', color: '#f59e0b' },
  IN_PROGRESS: { label: 'Đang xử lý', color: '#3b82f6' },
  COMPLETED: { label: 'Đã hoàn thành', color: '#16a34a' },
  CANCELLED: { label: 'Đã hủy', color: '#dc2626' },
};

export function maintenanceUpdatedTemplate(
  tenant: { fullName?: string | null },
  ticket: { id: string; title: string; status: string; comment?: string | null },
) {
  const name = tenant.fullName || 'bạn';
  const s = STATUS_MAP[ticket.status] ?? { label: ticket.status, color: '#6b7280' };
  const subject = `Cập nhật yêu cầu sửa chữa: ${ticket.title}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const bodyHtml = `
    ${heading('Cập nhật yêu cầu sửa chữa 🔧')}
    ${para(`Xin chào <strong>${name}</strong>,`)}
    ${para(`Yêu cầu bảo trì của bạn đã được chủ nhà cập nhật.`)}
    ${infoCard(`
      <strong>🔧 Yêu cầu:</strong> ${ticket.title}<br/>
      <strong>📋 Trạng thái mới:</strong> <span style="color:${s.color};font-weight:600;">${s.label}</span>
      ${ticket.comment ? `<br/><strong>💬 Ghi chú từ chủ nhà:</strong> ${ticket.comment}` : ''}
    `)}
    ${para('Nếu bạn có thắc mắc, hãy liên hệ chủ nhà qua mục <strong>Tin nhắn</strong> trên ứng dụng.')}
  `;

  return {
    subject,
    html: baseTemplate({
      subject,
      previewText: `Yêu cầu sửa chữa "${ticket.title}" — ${s.label}`,
      bodyHtml,
      ctaLabel: 'Xem chi tiết',
      ctaUrl: `${frontendUrl}/app/tenant/dashboard`,
    }),
  };
}
