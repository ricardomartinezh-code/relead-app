import { compare, hashSync } from "bcrypt";
import { randomUUID } from "crypto";

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  password?: string;
  profileId?: string;
};

export type ProfileRecord = {
  id: string;
  userId: string;
  title: string;
  bio?: string | null;
  avatarUrl?: string | null;
  slug: string;
  theme: "default" | "dark" | "pastel";
};

export type LinkRecord = {
  id: string;
  profileId: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
};

export type PageViewRecord = {
  id: string;
  profileId: string;
  referrer?: string | null;
  userAgent?: string | null;
  ip?: string | null;
  createdAt: Date;
};

export type LinkClickRecord = {
  id: string;
  linkId: string;
  referrer?: string | null;
  userAgent?: string | null;
  ip?: string | null;
  createdAt: Date;
};

export type WhatsAppAccountRecord = {
  id: string;
  phoneNumberId: string;
  wabaId?: string;
  label?: string | null;
  accessToken: string;
  expiresIn?: number | null;
};

const initialPassword = hashSync("demo123", 10);
const defaultUser: UserRecord = {
  id: randomUUID(),
  email: "demo@relead.app",
  name: "Cuenta demo",
  password: initialPassword,
};

const defaultProfile: ProfileRecord = {
  id: randomUUID(),
  userId: defaultUser.id,
  title: "ReLead Demo",
  bio: "Explora una versión sin base de datos respaldada por datos en memoria.",
  avatarUrl: null,
  slug: "demo",
  theme: "default",
};

defaultUser.profileId = defaultProfile.id;

const state: {
  users: UserRecord[];
  profiles: ProfileRecord[];
  links: LinkRecord[];
  pageViews: PageViewRecord[];
  linkClicks: LinkClickRecord[];
  whatsAppAccounts: WhatsAppAccountRecord[];
} = {
  users: [defaultUser],
  profiles: [defaultProfile],
  links: [
    {
      id: randomUUID(),
      profileId: defaultProfile.id,
      label: "Sitio oficial de ReLead",
      url: "https://relead.app",
      order: 0,
      isActive: true,
    },
    {
      id: randomUUID(),
      profileId: defaultProfile.id,
      label: "Demo rápida",
      url: "https://example.com/demo",
      order: 1,
      isActive: true,
    },
  ],
  pageViews: [],
  linkClicks: [],
  whatsAppAccounts: [],
};

export const getUserByEmail = (email: string) => state.users.find((u) => u.email === email);

export const getUserWithProfileByEmail = (email: string) => {
  const user = getUserByEmail(email);
  if (!user?.profileId) return null;
  const profile = state.profiles.find((p) => p.id === user.profileId);
  if (!profile) return null;
  return { ...user, profile };
};

export const findProfileBySlug = (slug: string) => state.profiles.find((p) => p.slug === slug);

export const findProfileById = (id: string) => state.profiles.find((p) => p.id === id);

export const isSlugTaken = (slug: string, ignoreProfileId?: string) =>
  state.profiles.some((p) => p.slug === slug && p.id !== ignoreProfileId);

export const generateUniqueSlugFromState = (base: string) => {
  const cleaned = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  let slug = cleaned || "user";
  let suffix = 0;
  while (isSlugTaken(slug)) {
    suffix += 1;
    slug = `${cleaned || "user"}-${suffix}`;
  }
  return slug;
};

export const createUserWithProfile = async ({
  email,
  name,
  password,
  slugBase,
}: {
  email: string;
  name: string;
  password?: string;
  slugBase?: string;
}) => {
  if (getUserByEmail(email)) throw new Error("El email ya está registrado");
  const userId = randomUUID();
  const profileId = randomUUID();
  const finalPassword = password ? hashSync(password, 10) : undefined;
  const profile: ProfileRecord = {
    id: profileId,
    userId,
    title: name,
    bio: null,
    avatarUrl: null,
    slug: generateUniqueSlugFromState(slugBase || email.split("@")[0]),
    theme: "default",
  };
  const user: UserRecord = {
    id: userId,
    email,
    name,
    password: finalPassword,
    profileId,
  };
  state.users.push(user);
  state.profiles.push(profile);
  return { user, profile };
};

export const updateProfile = ({
  profileId,
  title,
  bio,
  avatarUrl,
  slug,
  theme,
}: Partial<ProfileRecord> & { profileId: string }) => {
  const profile = findProfileById(profileId);
  if (!profile) return null;
  if (slug && isSlugTaken(slug, profileId)) return "slug-taken" as const;
  Object.assign(profile, { title, bio, avatarUrl, slug, theme });
  return profile;
};

export const getLinksForProfile = (profileId: string) =>
  state.links.filter((link) => link.profileId === profileId).sort((a, b) => a.order - b.order);

export const createLink = ({
  profileId,
  label,
  url,
  order = 0,
  isActive = true,
}: Omit<LinkRecord, "id"> & { profileId: string }) => {
  const link: LinkRecord = { id: randomUUID(), profileId, label, url, order, isActive };
  state.links.push(link);
  return link;
};

export const findLinkById = (id: string) => state.links.find((l) => l.id === id);

export const updateLink = (id: string, changes: Partial<LinkRecord>) => {
  const link = state.links.find((l) => l.id === id);
  if (!link) return null;
  Object.assign(link, changes);
  return link;
};

export const deleteLink = (id: string) => {
  const index = state.links.findIndex((l) => l.id === id);
  if (index === -1) return false;
  state.links.splice(index, 1);
  return true;
};

export const recordLinkClick = ({
  linkId,
  referrer,
  userAgent,
  ip,
}: {
  linkId: string;
  referrer?: string | null;
  userAgent?: string | null;
  ip?: string | null;
}) => {
  const link = state.links.find((l) => l.id === linkId);
  if (!link) return null;
  const click: LinkClickRecord = {
    id: randomUUID(),
    linkId,
    referrer: referrer || null,
    userAgent: userAgent || null,
    ip,
    createdAt: new Date(),
  };
  state.linkClicks.push(click);
  return click;
};

export const recordPageView = ({
  profileId,
  referrer,
  userAgent,
  ip,
}: {
  profileId: string;
  referrer?: string | null;
  userAgent?: string | null;
  ip?: string | null;
}) => {
  const profile = findProfileById(profileId);
  if (!profile) return null;
  const view: PageViewRecord = { id: randomUUID(), profileId, referrer: referrer || null, userAgent: userAgent || null, ip, createdAt: new Date() };
  state.pageViews.push(view);
  return view;
};

export const getActiveLinksForSlug = (slug: string) => {
  const profile = findProfileBySlug(slug);
  if (!profile) return null;
  return getLinksForProfile(profile.id).filter((link) => link.isActive);
};

export const verifyCredentials = async (email: string, password: string) => {
  const user = getUserByEmail(email);
  if (!user?.password) return null;
  const valid = await compare(password, user.password);
  return valid ? user : null;
};

export const findWhatsAppAccountByPhoneNumberId = (phoneNumberId: string) =>
  state.whatsAppAccounts.find((account) => account.phoneNumberId === phoneNumberId);

export const upsertWhatsAppAccount = ({
  phoneNumberId,
  wabaId,
  accessToken,
  expiresIn,
  label,
}: Omit<WhatsAppAccountRecord, "id">) => {
  const existing = findWhatsAppAccountByPhoneNumberId(phoneNumberId);
  if (existing) {
    Object.assign(existing, { wabaId, accessToken, expiresIn, label });
    return existing;
  }
  const created: WhatsAppAccountRecord = {
    id: randomUUID(),
    phoneNumberId,
    wabaId,
    accessToken,
    expiresIn,
    label,
  };
  state.whatsAppAccounts.push(created);
  return created;
};

export const stateSnapshot = () => ({ ...state });
