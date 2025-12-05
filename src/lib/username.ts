export const USERNAME_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;
export const USERNAME_RULES_MESSAGE =
  "Usa de 3 a 30 caracteres en minúsculas, sin espacios y con guiones medios opcionales.";

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function validateUsernameInput(value: unknown): {
  valid: boolean;
  normalized?: string;
  message?: string;
} {
  if (typeof value !== "string") {
    return { valid: false, message: "El nombre de usuario es obligatorio." };
  }

  const normalized = normalizeUsername(value);

  if (!normalized) {
    return { valid: false, message: "El nombre de usuario es obligatorio." };
  }

  if (normalized.length < 3 || normalized.length > 30) {
    return {
      valid: false,
      message: "El nombre de usuario debe tener entre 3 y 30 caracteres.",
    };
  }

  if (!USERNAME_REGEX.test(normalized)) {
    return { valid: false, message: USERNAME_RULES_MESSAGE };
  }

  return { valid: true, normalized };
}
