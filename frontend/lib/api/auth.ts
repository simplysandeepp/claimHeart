"use client";

import { readStorage, writeStorage } from "@/lib/api/storage";
import type { AppUser, UserRole } from "@/types";

const USERS_KEY = "users";
const CURRENT_USER_KEY = "claimheart.currentUser";
const ROLE_KEY = "claimheart.role";

export type SignupPayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  patientId?: string;
  dob?: string;
  policyNumber?: string;
  insuranceCompany?: string;
  sumInsured?: number;
  doctorName?: string;
  hospitalRegNo?: string;
  city?: string;
  department?: string;
  employeeId?: string;
  website?: string;
  organizationType?: string;
  organizationCode?: string;
};

export const getUsers = async (): Promise<AppUser[]> => {
  return readStorage<AppUser[]>(USERS_KEY, []);
};

export const getCurrentUser = async (): Promise<AppUser | null> => {
  return readStorage<AppUser | null>(CURRENT_USER_KEY, null);
};

export const getRole = async (): Promise<UserRole | null> => {
  const user = await getCurrentUser();
  if (user) {
    return user.role;
  }

  return readStorage<UserRole | null>(ROLE_KEY, null);
};

export const setCurrentUser = async (user: AppUser) => {
  writeStorage(CURRENT_USER_KEY, user);
  writeStorage(ROLE_KEY, user.role);
  window.localStorage.setItem("role", user.role);
  window.localStorage.setItem("user", JSON.stringify(user));
  return user;
};

export const loginUser = async (email: string, password: string, role: UserRole) => {
  const users = await getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user =
    users.find(
      (entry) =>
        entry.email.trim().toLowerCase() === normalizedEmail &&
        entry.password === password &&
        entry.role === role,
    ) ?? null;
  if (!user) {
    return null;
  }

  await setCurrentUser(user);
  return user;
};

export const signupUser = async (payload: SignupPayload) => {
  const users = await getUsers();
  const normalizedEmail = payload.email.trim().toLowerCase();
  const existingUser = users.find((entry) => entry.email.trim().toLowerCase() === normalizedEmail);

  if (existingUser) {
    throw new Error("An account with this email already exists in the local demo data.");
  }

  const generatedPatientId = `P-${Date.now()}`;
  const user: AppUser = {
    id: `${payload.role[0].toUpperCase()}-${Date.now()}`,
    name: payload.name.trim(),
    email: normalizedEmail,
    phone: payload.phone?.trim(),
    password: payload.password,
    role: payload.role,
    patientId: payload.role === "patient" ? payload.patientId?.trim() || generatedPatientId : undefined,
    dob: payload.dob,
    policyNumber: payload.policyNumber?.trim(),
    insuranceCompany: payload.insuranceCompany?.trim(),
    sumInsured: payload.sumInsured,
    doctorName: payload.doctorName?.trim(),
    hospitalRegNo: payload.hospitalRegNo?.trim(),
    city: payload.city?.trim(),
    department: payload.department?.trim(),
    employeeId: payload.employeeId?.trim(),
    website: payload.website?.trim(),
    organizationType: payload.organizationType?.trim(),
    organizationCode: payload.organizationCode?.trim(),
  };

  const updatedUsers = [user, ...users];
  writeStorage(USERS_KEY, updatedUsers);
  await setCurrentUser(user);
  return user;
};

export const getDashboardPath = (role: UserRole | null) => {
  if (role === "patient") {
    return "/dashboard/patient";
  }

  if (role === "hospital") {
    return "/dashboard/hospital";
  }

  return "/dashboard/insurer";
};

export const logout = (withConfirmation: boolean = true) => {
  if (typeof window === "undefined") {
    return;
  }

  if (withConfirmation && !window.confirm("Are you sure you want to logout?")) {
    return;
  }

  window.localStorage.removeItem("role");
  window.localStorage.removeItem("user");
  window.localStorage.removeItem(CURRENT_USER_KEY);
  window.localStorage.removeItem(ROLE_KEY);
  window.location.href = "/login";
};
