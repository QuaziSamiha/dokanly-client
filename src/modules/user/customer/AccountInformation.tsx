"use client";

import Profile from "@/modules/user/admin/profile/Profile";

/**
 * "Account Details": the same profile screen admins use (photo, name, phone,
 * password, verification), without the staff-only badges.
 */
export default function AccountInformation() {
  return <Profile variant="customer" />;
}
