export interface Member {
  id?: string;
  name: string;
  phone: string;
  address: string;
  role: string;
  joinedAt: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}
