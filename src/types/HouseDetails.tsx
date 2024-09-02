export type HouseDetails = {
  id: string;
  title: string;
  imgUrls: string[];
  description: string;
  status: string;
  price?: string;
  bed?: string;
  bath?: string;
  street: string;
  city: string;
  state: string;
  zip_code?: string;
  house_size_m2?: string;
  userId: string;
  userName?: string;
};
