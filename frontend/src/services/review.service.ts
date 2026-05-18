import { api } from "../lib/axios";

export interface Review {
  id: string;
  tenancyId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
  tenancy?: {
    property: {
      title: string;
    };
    room: {
      title: string;
    };
  };
}

export interface CreateReviewDto {
  tenancyId: string;
  rating: number;
  comment: string;
}

export const ReviewService = {
  create: async (dto: CreateReviewDto): Promise<Review> => {
    const response = await api.post("/reviews", dto);
    return response.data?.data || response.data;
  },

  findMyReviews: async (): Promise<Review[]> => {
    const response = await api.get("/reviews/me");
    return response.data?.data || response.data;
  },
};
