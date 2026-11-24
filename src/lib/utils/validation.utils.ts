export const validateEmail = (value: string): boolean => {
  // If empty, it's valid (optional)
  if (!value || value.trim() === "") return true;
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value.trim());
};

export const validatePhone = (value: string): boolean => {
  const patterns = [
    /^\+8801[3-9]\d{8}$/, // +88013XXXXXXXX to +88019XXXXXXXX
    /^01[3-9]\d{8}$/, // 013XXXXXXXX to 019XXXXXXXX
  ];
  return patterns.some((pattern) => pattern.test(value));
};
