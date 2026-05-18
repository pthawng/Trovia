import { baseTemplate, heading, para, infoCard } from '../shared/base.template';

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Thấp', color: '#6b7280' },
  MEDIUM: { label: 'Trung bình', color: '#f59e0b' },
  HIGH: { label: 'Cao', color: '#dc2626' },
};

export function maintenanceRequestTemplate(
  landlord: { fullName?: string | null },
  ticket: {
    id: string;
    propertyTitle: string;
    tenantName: string;
    title: string;
    priority: string;
  },
) {
  const name = landlord.fullName || 'chủ nhà';
  const p = PRIORITY_MAP[ticket.priority] ?? { label: ticket.priority, color: '#6b7280' };
  const subject = `Yêu cầu sửa chữa mới tại ${ticket.propertyTitle}: ${ticket.title}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const bodyHtml = `
    ${heading('Yêu cầu bảo trì mới 🔧')}
    ${para(`Xin chào <strong>${name}</strong>,`)}
    ${para(`Người thuê tại <strong>${ticket.propertyTitle}</strong> vừa gửi một yêu cầu bảo trì cần bạn xem xét.`)}
    ${infoCard(`
      <strong>📋 Tiêu đề:</strong> ${ticket.title}<br/>
      <strong>👤 Người thuê:</strong> ${ticket.tenantName}<br/>
      <strong>🏠 Bất động sản:</strong> ${ticket.propertyTitle}<br/>
      <strong>🔥 Mức độ ưu tiên:</strong> <span style="color:${p.color};font-weight:600;">${p.label}</span>
    `)}
    ${para('Vui lòng xem xét và xử lý yêu cầu trong thời gian sớm nhất để đảm bảo trải nghiệm tốt cho người thuê.')}
  `;

  return {
    subject,
    html: baseTemplate({
      subject,
      previewText: `[${p.label}] ${ticket.tenantName} yêu cầu sửa chữa tại ${ticket.propertyTitle}`,
      bodyHtml,
      ctaLabel: 'Xem & xử lý yêu cầu',
      ctaUrl: `${frontendUrl}/app/landlord`,
    }),
  };
}
