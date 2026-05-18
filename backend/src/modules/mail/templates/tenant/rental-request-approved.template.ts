import { baseTemplate, heading, para, infoCard } from '../shared/base.template';

const STATUS_MAP: Record<string, { label: string; emoji: string }> = {
  ACCEPTED: { label: 'Chấp nhận', emoji: '✅' },
  REJECTED: { label: 'Từ chối', emoji: '❌' },
  IN_DISCUSSION: { label: 'Đang thảo luận', emoji: '💬' },
  CANCELLED: { label: 'Đã hủy', emoji: '🚫' },
};

export function rentalRequestApprovedTemplate(
  tenant: { fullName?: string | null },
  request: { id: string; propertyTitle: string; status: string },
) {
  const name = tenant.fullName || 'bạn';
  const s = STATUS_MAP[request.status] ?? { label: request.status, emoji: '📢' };
  const subject = `Yêu cầu thuê phòng của bạn đã được ${s.label} ${s.emoji}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const isAccepted = request.status === 'ACCEPTED';

  const bodyHtml = `
    ${heading(`Cập nhật yêu cầu thuê phòng ${s.emoji}`)}
    ${para(`Xin chào <strong>${name}</strong>,`)}
    ${para(`Yêu cầu thuê phòng của bạn tại <strong>${request.propertyTitle}</strong> đã được chủ nhà <strong>${s.label.toLowerCase()}</strong>.`)}
    ${infoCard(`
      <strong>🏠 Bất động sản:</strong> ${request.propertyTitle}<br/>
      <strong>📋 Trạng thái mới:</strong> <span style="color:${isAccepted ? '#16a34a' : '#dc2626'};font-weight:600;">${s.label} ${s.emoji}</span>
    `)}
    ${isAccepted
      ? para('Chúc mừng! Chủ nhà sẽ sớm gửi dự thảo hợp đồng thuê. Theo dõi mục <strong>Hợp đồng</strong> của bạn.')
      : para('Đừng nản lòng! Bạn có thể tiếp tục tìm kiếm và gửi yêu cầu thuê phòng khác.')}
  `;

  return {
    subject,
    html: baseTemplate({
      subject,
      previewText: `Yêu cầu thuê phòng tại ${request.propertyTitle}: ${s.label}`,
      bodyHtml,
      ctaLabel: isAccepted ? 'Xem hợp đồng' : 'Tìm phòng khác',
      ctaUrl: isAccepted
        ? `${frontendUrl}/app/contracts`
        : `${frontendUrl}/app/explore`,
    }),
  };
}
