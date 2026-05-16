import heroImg from "@/assets/hero-apartment.jpg";
import p1 from "@/assets/property-1.jpg";
import p2 from "@/assets/property-2.jpg";
import p3 from "@/assets/property-3.jpg";

export type Property = {
  id: string; title: string; location: string; price: number; beds: number; baths: number;
  area: number; rating: number; reviews: number; image: string; amenities: string[]; type: string;
  landlord: { name: string; initials: string; verified: boolean };
};

export const PROPERTIES: Property[] = [
  { id: "p1", title: "Sunlit studio near campus", location: "District 2 · Ho Chi Minh", price: 420, beds: 1, baths: 1, area: 32, rating: 4.9, reviews: 84, image: p1, amenities: ["Wi-Fi", "AC", "Laundry", "Furnished"], type: "Studio", landlord: { name: "Trang Bui", initials: "TB", verified: true } },
  { id: "p2", title: "Boarding room with garden", location: "Tay Ho · Hanoi", price: 280, beds: 1, baths: 1, area: 22, rating: 4.8, reviews: 51, image: p2, amenities: ["Wi-Fi", "Shared kitchen", "Bike storage"], type: "Boarding room", landlord: { name: "Minh Tran", initials: "MT", verified: true } },
  { id: "p3", title: "Modern 1BR with balcony", location: "District 7 · Ho Chi Minh", price: 640, beds: 1, baths: 1, area: 45, rating: 4.95, reviews: 120, image: p3, amenities: ["Wi-Fi", "Gym", "Pool", "Furnished"], type: "Apartment", landlord: { name: "Hoa Pham", initials: "HP", verified: true } },
  { id: "p4", title: "Cozy room, walkable street", location: "Hai Chau · Da Nang", price: 240, beds: 1, baths: 1, area: 18, rating: 4.7, reviews: 33, image: heroImg, amenities: ["Wi-Fi", "AC"], type: "Room", landlord: { name: "An Le", initials: "AL", verified: true } },
  { id: "p5", title: "Quiet studio, fast metro", location: "Cau Giay · Hanoi", price: 380, beds: 1, baths: 1, area: 28, rating: 4.85, reviews: 64, image: p1, amenities: ["Wi-Fi", "Elevator", "Furnished"], type: "Studio", landlord: { name: "Linh Vu", initials: "LV", verified: true } },
  { id: "p6", title: "Spacious 2BR for sharing", location: "Binh Thanh · HCMC", price: 720, beds: 2, baths: 2, area: 62, rating: 4.78, reviews: 47, image: p3, amenities: ["Wi-Fi", "Parking", "Balcony"], type: "Apartment", landlord: { name: "Khoa Do", initials: "KD", verified: true } },
];
