// username validation
// min length 3 characters, no spaces or special chars
export const usernameRegex: RegExp = /^\w{3,20}$/;

// email validation
// (no spaces o @) + @ + (no spaces o @) + . + (no spaces o @)
export const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// password validation
// min length 8 characters, at least one uppercase letter, one lowercase letter, one number and one special char
export const passwordRegex: RegExp =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#.%^&?*])[A-Za-z0-9!@#.%^&?*]{8,}$/;
