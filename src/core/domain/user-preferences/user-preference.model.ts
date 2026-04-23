import { User } from "@/core/domain/users";

export interface UserPreferenceIntent {
  id: string;
  code: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPreferencePropertyType {
  id: string;
  code: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPreferenceLocation {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPreference {
  id: string;
  user: Pick<User, "id" | "firstName" | "lastName" | "email" | "phoneNumber">;
  intent: UserPreferenceIntent;
  propertyTypes: UserPreferencePropertyType[];
  locations: UserPreferenceLocation[];
  budgetMin: string;
  budgetMax: string;
  createdAt?: string;
  updatedAt?: string;
}
