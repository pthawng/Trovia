import { PrismaClient, AppRole, LandlordStatus, PropertyType, PropertyStatus, RentalRequestStatus, ConversationStatus, MessageType, ContractStatus, PaymentType, PaymentStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear existing database entries
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "users" CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "roles" CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "amenities" CASCADE;`);
  console.log('🧹 Cleaned up existing database tables.');

  // 2. Seed Roles
  const tenantRole = await prisma.role.create({ data: { name: AppRole.TENANT } });
  const landlordRole = await prisma.role.create({ data: { name: AppRole.LANDLORD } });
  const adminRole = await prisma.role.create({ data: { name: AppRole.ADMIN } });
  console.log('👥 Roles seeded.');

  // 3. Hash Passwords using Argon2
  const tenantPassHash = await argon2.hash('trovia_tenant_pass');
  const landlordPassHash = await argon2.hash('trovia_landlord_pass');
  const adminPassHash = await argon2.hash('trovia_admin_pass');

  // 4. Create Demo Users
  const tenantUser = await prisma.user.create({
    data: {
      email: 'tenant@trovia.vn',
      passwordHash: tenantPassHash,
      fullName: 'Trần Văn Học (Sinh Viên)',
      phone: '0912345678',
      city: 'Hồ Chí Minh',
      isEmailVerified: true,
      userRoles: {
        create: { roleId: tenantRole.id },
      },
    },
  });

  const landlordUser = await prisma.user.create({
    data: {
      email: 'landlord@trovia.vn',
      passwordHash: landlordPassHash,
      fullName: 'Lê Thế Điền (Chủ Trọ)',
      phone: '0901234567',
      city: 'Hồ Chí Minh',
      isEmailVerified: true,
      userRoles: {
        createMany: {
          data: [
            { roleId: tenantRole.id },
            { roleId: landlordRole.id },
          ],
        },
      },
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@trovia.vn',
      passwordHash: adminPassHash,
      fullName: 'Admin Hệ Thống',
      phone: '0999999999',
      city: 'Hồ Chí Minh',
      isEmailVerified: true,
      userRoles: {
        create: { roleId: adminRole.id },
      },
    },
  });
  console.log('👤 Demo Users seeded.');

  // 5. Seed Landlord Profile
  const landlordProfile = await prisma.landlordProfile.create({
    data: {
      userId: landlordUser.id,
      status: LandlordStatus.ACTIVE,
      businessName: 'Hệ thống nhà trọ Trovia HCMC',
      businessAddress: '15 Lê Văn Chí, Linh Trung, Thủ Đức, HCMC',
      businessEmail: 'lanhdoanh@trovia.vn',
      businessPhone: '0901234567',
      identityCardNumber: '079099001234',
      identityCardFrontUrl: 'https://example.com/front.jpg',
      identityCardBackUrl: 'https://example.com/back.jpg',
      identityVerifiedAt: new Date(),
      activatedAt: new Date(),
    },
  });
  console.log('🏡 Landlord Profile created.');

  // 6. Seed Amenities
  const wifi = await prisma.amenity.create({ data: { name: 'Free Wi-Fi', icon: 'wifi' } });
  const ac = await prisma.amenity.create({ data: { name: 'Máy lạnh', icon: 'ac' } });
  const parking = await prisma.amenity.create({ data: { name: 'Nhà để xe', icon: 'parking' } });
  const washing = await prisma.amenity.create({ data: { name: 'Máy giặt chung', icon: 'washing' } });
  const security = await prisma.amenity.create({ data: { name: 'Bảo vệ 24/7', icon: 'security' } });
  const toilet = await prisma.amenity.create({ data: { name: 'WC khép kín', icon: 'toilet' } });
  const balcony = await prisma.amenity.create({ data: { name: 'Ban công', icon: 'balcony' } });
  const fridge = await prisma.amenity.create({ data: { name: 'Tủ lạnh', icon: 'fridge' } });
  console.log('⚡ Amenities seeded.');

  // 7. Seed 3 Properties
  // Property 1: Boarding house in Thu Duc for students
  const propThuDuc = await prisma.property.create({
    data: {
      landlordId: landlordUser.id,
      title: 'Nhà trọ sinh viên giá rẻ gần Làng Đại Học',
      description: 'Nhà trọ sạch sẽ, gần Đại học Bách Khoa, KHTN, Nhân Văn. Phòng trọ an ninh, có quản lý hỗ trợ.',
      address: '22 Đường 8, Linh Trung, Thủ Đức',
      city: 'Hồ Chí Minh',
      district: 'Thủ Đức',
      ward: 'Linh Trung',
      latitude: 10.8694,
      longitude: 106.8028,
      type: PropertyType.BOARDING_HOUSE,
      status: PropertyStatus.PUBLISHED,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5', order: 0 },
        ],
      },
      propertyAmenities: {
        createMany: {
          data: [
            { amenityId: wifi.id },
            { amenityId: parking.id },
            { amenityId: washing.id },
            { amenityId: security.id },
          ],
        },
      },
    },
  });

  // Property 2: Studio Apartment in Binh Thanh for office workers
  const propBinhThanh = await prisma.property.create({
    data: {
      landlordId: landlordUser.id,
      title: 'Căn hộ Studio dịch vụ full nội thất ngay ngã tư Hàng Xanh',
      description: 'Căn hộ sang trọng, đầy đủ tiện nghi, giờ giấc tự do, bảo vệ an ninh cao cấp. Phù hợp cho nhân viên văn phòng đi làm Q1, Q3, Bình Thạnh.',
      address: '120 Điện Biên Phủ, Phường 15, Bình Thạnh',
      city: 'Hồ Chí Minh',
      district: 'Bình Thạnh',
      ward: 'Phường 15',
      latitude: 10.7997,
      longitude: 106.7095,
      type: PropertyType.STUDIO,
      status: PropertyStatus.PUBLISHED,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', order: 0 },
        ],
      },
      propertyAmenities: {
        createMany: {
          data: [
            { amenityId: wifi.id },
            { amenityId: ac.id },
            { amenityId: toilet.id },
            { amenityId: balcony.id },
            { amenityId: fridge.id },
            { amenityId: parking.id },
          ],
        },
      },
    },
  });

  // Property 3: Luxury Apartment in District 7
  const propD7 = await prisma.property.create({
    data: {
      landlordId: landlordUser.id,
      title: 'Chung cư cao cấp Sunrise City 2PN view Landmark 81',
      description: 'Căn hộ cao cấp đầy đủ nội thất, hồ bơi tràn bờ, phòng gym nội khu, an ninh tuyệt đối.',
      address: '23 Nguyễn Hữu Thọ, Tân Hưng, Quận 7',
      city: 'Hồ Chí Minh',
      district: 'Quận 7',
      ward: 'Tân Hưng',
      latitude: 10.7423,
      longitude: 106.7001,
      type: PropertyType.APARTMENT,
      status: PropertyStatus.PUBLISHED,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', order: 0 },
        ],
      },
      propertyAmenities: {
        createMany: {
          data: [
            { amenityId: wifi.id },
            { amenityId: ac.id },
            { amenityId: toilet.id },
            { amenityId: balcony.id },
            { amenityId: fridge.id },
            { amenityId: security.id },
            { amenityId: parking.id },
          ],
        },
      },
    },
  });
  console.log('🏢 Properties seeded.');

  // 8. Seed 8 Rooms
  // Rooms for Thu Duc Boarding House (3 rooms)
  const roomTD1 = await prisma.room.create({
    data: {
      propertyId: propThuDuc.id,
      title: 'Phòng trọ gác lửng 101',
      description: 'Phòng trọ có gác lửng đúc sạch sẽ, kệ bếp nấu ăn riêng.',
      price: 2500000,
      area: 18,
      deposit: 2500000,
      capacity: 2,
      isAvailable: true,
      roomAmenities: {
        create: { amenityId: toilet.id },
      },
    },
  });

  const roomTD2 = await prisma.room.create({
    data: {
      propertyId: propThuDuc.id,
      title: 'Phòng trọ gác lửng 102',
      description: 'Phòng rộng rãi sạch sẽ thoáng mát.',
      price: 2500000,
      area: 18,
      deposit: 2500000,
      capacity: 2,
      isAvailable: true,
    },
  });

  const roomTD3 = await prisma.room.create({
    data: {
      propertyId: propThuDuc.id,
      title: 'Phòng trọ máy lạnh 201',
      description: 'Phòng lầu 1 có cửa sổ lớn và lắp sẵn máy lạnh inverter.',
      price: 3200000,
      area: 20,
      deposit: 3200000,
      capacity: 3,
      isAvailable: true,
      roomAmenities: {
        create: { amenityId: ac.id },
      },
    },
  });

  // Rooms for Binh Thanh Studio (3 rooms)
  const roomBT1 = await prisma.room.create({
    data: {
      propertyId: propBinhThanh.id,
      title: 'Studio VIP Ban công lầu 3',
      description: 'Phòng studio VIP ban công rộng thoáng mát, view ngã tư Hàng Xanh.',
      price: 6500000,
      area: 28,
      deposit: 6500000,
      capacity: 2,
      isAvailable: true,
    },
  });

  const roomBT2 = await prisma.room.create({
    data: {
      propertyId: propBinhThanh.id,
      title: 'Studio Standard lầu 2',
      description: 'Đầy đủ nội thất cao cấp.',
      price: 5500000,
      area: 25,
      deposit: 5500000,
      capacity: 2,
      isAvailable: true,
    },
  });

  const roomBT3 = await prisma.room.create({
    data: {
      propertyId: propBinhThanh.id,
      title: 'Studio Standard lầu 1',
      description: 'Thoáng mát, yên tĩnh, đầy đủ bếp.',
      price: 5500000,
      area: 25,
      deposit: 5500000,
      capacity: 2,
      isAvailable: true,
    },
  });

  // Rooms for District 7 Luxury Apartment (2 rooms)
  const roomD71 = await prisma.room.create({
    data: {
      propertyId: propD7.id,
      title: 'Master Bedroom view sông',
      description: 'Phòng ngủ Master view sông Phú Mỹ Hưng cực đẹp, WC riêng có bồn tắm.',
      price: 8000000,
      area: 32,
      deposit: 8000000,
      capacity: 2,
      isAvailable: true,
    },
  });

  const roomD72 = await prisma.room.create({
    data: {
      propertyId: propD7.id,
      title: 'Cosy Bedroom view nội khu',
      description: 'Phòng ngủ nhỏ ấm cúng đầy đủ tủ âm tường.',
      price: 6000000,
      area: 22,
      deposit: 6000000,
      capacity: 1,
      isAvailable: true,
    },
  });
  console.log('🛏️ Rooms seeded.');

  // 9. Seed 1 Saved Property favorite
  await prisma.savedProperty.create({
    data: {
      tenantId: tenantUser.id,
      propertyId: propBinhThanh.id,
    },
  });
  console.log('⭐ Saved Property record created.');

  // 10. Seed 1 Pending Rental Request
  const rentalRequest = await prisma.rentalRequest.create({
    data: {
      tenantId: tenantUser.id,
      landlordId: landlordUser.id,
      propertyId: propThuDuc.id,
      roomId: roomTD1.id,
      status: RentalRequestStatus.PENDING,
      message: 'Chào anh Lê Thế Điền, em là sinh viên năm 2 muốn đăng ký qua xem phòng 101 chiều nay ạ.',
      phone: '0912345678',
      moveInDate: new Date('2026-06-01T00:00:00Z'),
      rentalDurationMonths: 12,
    },
  });
  console.log('📅 Sample Rental Request created.');

  // 11. Seed 1 Conversation
  const conversation = await prisma.conversation.create({
    data: {
      rentalRequestId: rentalRequest.id,
      propertyId: propThuDuc.id,
      tenantId: tenantUser.id,
      landlordId: landlordUser.id,
      status: ConversationStatus.OPEN,
    },
  });
  console.log('💬 Conversation created.');

  // 12. Seed 3 Messages
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: tenantUser.id,
      type: MessageType.SYSTEM,
      content: 'Yêu cầu thuê đã được gửi',
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: tenantUser.id,
      type: MessageType.TEXT,
      content: 'Chào anh, em muốn hỏi xem chiều nay qua xem phòng lúc 3h được không ạ?',
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: landlordUser.id,
      type: MessageType.TEXT,
      content: 'Chào em, chiều nay anh có mặt ở khu nhà trọ lúc 3h nhé. Hẹn gặp em tại địa chỉ 22 Đường 8.',
    },
  });
  console.log('✉️ Conversation messages seeded.');

  // 13. Seed 1 Draft Contract (accepted status request allows contract creation)
  // Let's create an accepted request first
  const acceptedRequest = await prisma.rentalRequest.create({
    data: {
      tenantId: tenantUser.id,
      landlordId: landlordUser.id,
      propertyId: propBinhThanh.id,
      roomId: roomBT1.id,
      status: RentalRequestStatus.ACCEPTED,
      message: 'Tôi muốn thuê căn hộ studio này.',
      phone: '0912345678',
      moveInDate: new Date('2026-06-01T00:00:00Z'),
      rentalDurationMonths: 12,
    },
  });

  const contractConversation = await prisma.conversation.create({
    data: {
      rentalRequestId: acceptedRequest.id,
      propertyId: propBinhThanh.id,
      tenantId: tenantUser.id,
      landlordId: landlordUser.id,
      status: ConversationStatus.OPEN,
    },
  });

  const draftContract = await prisma.contract.create({
    data: {
      rentalRequestId: acceptedRequest.id,
      conversationId: contractConversation.id,
      tenantId: tenantUser.id,
      landlordId: landlordUser.id,
      propertyId: propBinhThanh.id,
      roomId: roomBT1.id,
      status: ContractStatus.DRAFT,
      monthlyRent: 6500000,
      depositAmount: 6500000,
      durationMonths: 12,
      startDate: new Date('2026-06-01T00:00:00Z'),
      endDate: new Date('2027-05-31T00:00:00Z'),
      terms: '1. Thời hạn thuê là 12 tháng kể từ ngày 01/06/2026. 2. Tiền đặt cọc là 6,500,000 VND và sẽ hoàn lại khi hết hạn hợp đồng. 3. Tiền nhà thanh toán trước ngày 5 hàng tháng.',
    },
  });
  console.log('📄 Draft Contract created.');

  // 14. Seed 1 Pending Payment for another sent/accepted contract
  const acceptedContract = await prisma.contract.create({
    data: {
      rentalRequestId: acceptedRequest.id,
      conversationId: contractConversation.id,
      tenantId: tenantUser.id,
      landlordId: landlordUser.id,
      propertyId: propBinhThanh.id,
      roomId: roomBT2.id,
      status: ContractStatus.ACCEPTED,
      monthlyRent: 5500000,
      depositAmount: 5500000,
      durationMonths: 12,
      startDate: new Date('2026-06-01T00:00:00Z'),
      endDate: new Date('2027-05-31T00:00:00Z'),
      terms: 'Hợp đồng mẫu đã được ký chấp nhận bởi hai bên.',
      acceptedAt: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      contractId: acceptedContract.id,
      tenantId: tenantUser.id,
      landlordId: landlordUser.id,
      amount: 5500000,
      type: PaymentType.DEPOSIT,
      status: PaymentStatus.PENDING,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Due in 3 days
    },
  });
  console.log('💳 Pending deposit payment created.');

  console.log('🏁 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
