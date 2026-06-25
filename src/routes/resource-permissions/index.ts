///// Resource Permissions ///////
// | GET    | `/resource-permissions`               | List all resource permissions |
// | GET    | `/resource-permissions/:permissionId` | Get a permission assignment   |
// | POST   | `/resource-permissions`               | Grant a permission            |
// | PATCH  | `/resource-permissions/:permissionId` | Update a permission           |
// | DELETE | `/resource-permissions/:permissionId` | Revoke a permission           |

// | Method | Endpoint                            | Purpose                 |
// | ------ | ----------------------------------- | ----------------------- |
// | POST   | `/resource-permissions/bulk-grant`  | Grant many permissions  |
// | DELETE | `/resource-permissions/bulk-revoke` | Revoke many permissions |
// | PATCH  | `/resource-permissions/bulk-update` | Update many permissions |

// | Method | Endpoint                  | Purpose                        |
// | ------ | ------------------------- | ------------------------------ |
// | POST   | `/resource-permissions/check`      | Check if a user has permission |
// | POST   | `/resource-permissions/check-many` | Check multiple permissions     |

// | Method | Endpoint                                 | Purpose                              |
// | ------ | ---------------------------------------- | ------------------------------------ |
// | GET    | `/job-titles/:jobTitleId/permissions`    | Users with access to this job title  |
// | GET    | `/departments/:departmentId/permissions` | Users with access to this department |
// | GET    | `/exams/:examId/permissions`             | Users with access to this exam       |
// | GET    | `/questions/:questionId/permissions`     | Users with access to this question   |

// Permission Matrix

// This is ideal for admin screens.

// Method	Endpoint	Purpose
// GET	/users/:userId/permission-matrix	Complete permission matrix for a user
// GET	/permission-matrix	List all assignments grouped by user/resource

// Audit Endpoints

// Permissions are security-sensitive, so tracking changes is valuable.

// Method	Endpoint	Purpose
// GET	/resource-permissions/audit	Permission change history
// GET	/users/:userId/permission-history	Permission history for a user

// /auth

// /users
//     /:userId/resource-permissions
//     /:userId/permission-matrix

// /resource-permissions
//     /bulk-grant
//     /bulk-revoke
//     /bulk-update

// /permissions
//     /check
//     /check-many

// /permission-groups

// /job-titles
//     /:jobTitleId/permissions

// /departments
//     /:departmentId/permissions

// /factories
//     /:factoryId/permissions

// /questions
//     /:questionId/permissions

// /exams
//     /:examId/permissions
