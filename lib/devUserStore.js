import { ROLES } from "@/config/constants";
import { getDevAuthConfig } from "@/lib/devAuth";

function generateUserId() {
  return `dev-user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildInitialDevUsers() {
  const config = getDevAuthConfig();

  return [
    {
      _id: config.userId,
      name: config.name,
      email: config.email,
      role: config.role,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSessionUser: true,
    },
    {
      _id: "dev-user-manager",
      name: "Jane Manager",
      email: "manager@demo.com",
      role: ROLES.MANAGER,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "dev-user-viewer",
      name: "Sam Viewer",
      email: "viewer@demo.com",
      role: ROLES.VIEWER,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

let devUsers = buildInitialDevUsers();

function serializeDevUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function listDevUsers() {
  return [...devUsers]
    .map(serializeDevUser)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getDevUserById(id) {
  const user = devUsers.find((item) => item._id === id);
  return user ? serializeDevUser(user) : null;
}

export function createDevUser({ name, email, role }) {
  const normalizedEmail = email.toLowerCase().trim();
  const exists = devUsers.some(
    (user) => user.email.toLowerCase() === normalizedEmail
  );

  if (exists) {
    return { error: "A user with this email already exists", user: null };
  }

  const now = new Date().toISOString();
  const user = {
    _id: generateUserId(),
    name: name.trim(),
    email: normalizedEmail,
    role,
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  devUsers = [...devUsers, user];
  return { error: null, user: serializeDevUser(user) };
}

export function updateDevUserRole(id, role) {
  const index = devUsers.findIndex((item) => item._id === id);
  if (index === -1) return { error: "User not found", user: null };

  const updated = {
    ...devUsers[index],
    role,
    updatedAt: new Date().toISOString(),
  };

  devUsers = [...devUsers.slice(0, index), updated, ...devUsers.slice(index + 1)];
  return { error: null, user: serializeDevUser(updated) };
}

export function deactivateDevUser(id) {
  const index = devUsers.findIndex((item) => item._id === id);
  if (index === -1) return { error: "User not found", user: null };

  const updated = {
    ...devUsers[index],
    active: false,
    updatedAt: new Date().toISOString(),
  };

  devUsers = [...devUsers.slice(0, index), updated, ...devUsers.slice(index + 1)];
  return { error: null, user: serializeDevUser(updated) };
}

export function countDevActiveAdmins(excludeUserId = null) {
  return devUsers.filter(
    (user) =>
      user.active &&
      user.role === ROLES.ADMIN &&
      user._id !== excludeUserId
  ).length;
}
