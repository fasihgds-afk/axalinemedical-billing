import { APP_NAME } from "@/config/constants";

let devBusinessProfile = {
  _id: "dev-business-profile",
  businessName: APP_NAME,
  logo: null,
  email: "",
  phone: "",
  address: "",
  website: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function getDevBusinessProfile() {
  return { ...devBusinessProfile };
}

export function updateDevBusinessProfile(data) {
  devBusinessProfile = {
    ...devBusinessProfile,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return getDevBusinessProfile();
}
