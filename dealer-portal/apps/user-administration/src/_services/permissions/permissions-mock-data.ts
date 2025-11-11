import { AccessControlLevel, AdditionalClaim, PageAccessoryCategory, PermissionPage, Permissions } from '@dealer-portal/polaris-core';

// Categories available for access control
const categories: PageAccessoryCategory[] = [
  { displayName: "No Access", value: AccessControlLevel.None },
  { displayName: "Read Only", value: AccessControlLevel.Read },
  { displayName: "Read / Write", value: AccessControlLevel.ReadWrite },
];

// Mock permissions tree
// eslint-disable-next-line @typescript-eslint/naming-convention
const MOCK_PERMISSIONS = new Permissions({
  pageAccessCategories: categories,
  pages: [
    new PermissionPage({
      menuName: "Marketing",              // Page
      access: AccessControlLevel.None,
      availablePageAccessTypes: categories,
      children: [
        new PermissionPage({
          menuName: "Campaigns",          // 🔥 Category level
          access: AccessControlLevel.None,
          availablePageAccessTypes: categories,
          children: [
            new PermissionPage({
              menuName: "Campaign Manager", // Permission
              access: AccessControlLevel.ReadWrite,
              availablePageAccessTypes: categories,
              additionalClaims: [
                new AdditionalClaim({ name: "Create Campaign", isSelected: false, value: "create" }),
                new AdditionalClaim({ name: "Delete Campaign", isSelected: false, value: "delete" }),
                new AdditionalClaim({ name: "Dealer Principal", isSelected: false, value: "dp" }), // exclusivity test
              ],
            }),
            new PermissionPage({
              menuName: "Reports",          // Permission
              access: AccessControlLevel.Read,
              availablePageAccessTypes: categories,
              additionalClaims: [],
            }),
          ],
        }),
      ],
    }),
  ],
});

export default MOCK_PERMISSIONS;
