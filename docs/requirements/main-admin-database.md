
# Main Admin and Inventory — Database Requirements

## Developer
Yasasmi Nimnadi

## Module Responsibilities
- User account management
- Roles and permissions
- Employee profile management
- Employee leave approval
- Service category management
- Chemical and equipment inventory
- Chemical compliance documentation

## Entities

### 1. User
Purpose: Stores login and account information.

Fields:
- user_id — Primary Key
- username — Unique
- email — Unique
- password_hash
- phone
- status
- created_at

Relationships:
- One user may have multiple roles.
- One user may have a customer or employee profile.

### 2. Role
Purpose: Stores available system roles.

Fields:
- role_id — Primary Key
- role_name — Unique
- description
- status

Examples:
- Main Admin
- Sub Admin
- Customer
- Employee

### 3. Employee
Purpose: Stores staff profile details.

Fields:
- employee_id — Primary Key
- user_id — Foreign Key to User
- employee_no — Unique
- full_name
- specialization
- hire_date
- employment_status

### 4. LeaveRequest
Purpose: Records employee leave requests.

Suggested fields:
- leave_id — Primary Key
- employee_id — Foreign Key to Employee
- leave_type
- start_date
- end_date
- half_day_session
- reason
- status
- reviewed_by_user_id
- reviewed_at

Business Rules:
- Employees submit leave requests.
- Main Admin approves or rejects requests.
- Approved leave affects scheduling.

## Remaining Entities to Document
- Permission
- UserRole
- RolePermission
- ServiceCategory
- InventoryItem
- PestCategory
- InventoryItemCategory
- StockMovement
- ComplianceDocument

## Important Business Rules
- Passwords must be securely hashed.
- Only authorized users manage permissions.
- Stock cannot be allocated beyond availability.
- Expired or unverified chemicals must be blocked
  from allocation when ineligible.
- Chemical compliance documents require verification.

## Dependencies
- Sub Admin uses inventory availability.
- Sub Admin scheduling checks approved leave.
- Customer views applicable verified documents.
- Employee records actual chemical usage.
