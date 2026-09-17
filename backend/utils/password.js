export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/;

export const PASSWORD_HINT =
  "Password must contain at least one uppercase letter and one special character.";

export const isStrongPassword = (password) =>
  PASSWORD_REGEX.test(String(password || ""));
