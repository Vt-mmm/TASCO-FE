# Task Member Management với User Dropdown

## Vấn đề đã giải quyết

Trước đây, việc thêm thành viên vào task yêu cầu nhập thủ công User ID, điều này rất bất tiện và dễ sai sót.

## Giải pháp đã implement

### 1. **UserSelectorDropdown Component**

- Autocomplete dropdown với search functionality
- Hiển thị danh sách users với avatar, tên và email
- Tự động fill thông tin khi chọn user
- Loại trừ users đã được thêm vào task

### 2. **useProjectMembers Hook**

- Lấy danh sách project members từ Redux store (currentProject)
- Không cần gọi API riêng biệt vì backend không có endpoint GET members
- Filter members đã approved và chưa bị removed

### 3. **Cập nhật TaskMemberDialogs**

- **Add Dialog**: Sử dụng UserSelectorDropdown thay vì TextField cho User ID
- **Edit Dialog**: Disable các field không thể chỉnh sửa, chỉ cho phép thay đổi role
- Tự động điền tên và email khi chọn user

### 4. **Cập nhật TaskMemberManager**

- Thêm prop `projectId` để truyền vào hook
- Truyền `excludeUserIds` để loại trừ members đã có trong task

## Backend API Note

**Quan trọng**: Backend hiện tại **KHÔNG CÓ** endpoint `GET /api/projects/{projectId}/members`

Thay vào đó, danh sách project members được lấy từ:

- Endpoint: `GET /api/projects/{projectId}`
- Response bao gồm property `members: ProjectMember[]`

## Cách sử dụng

1. Mở dialog "Quản lý thành viên task"
2. Click "Thêm Thành Viên"
3. Chọn user từ dropdown (hiển thị email)
4. Tên và email sẽ được tự động điền
5. Chọn vai trò và click "Thêm"

## Lợi ích

✅ UX tốt hơn - không cần nhập thủ công User ID  
✅ Tránh lỗi sai User ID  
✅ Hiển thị thông tin rõ ràng (email, tên)  
✅ Loại trừ users đã được thêm  
✅ Tự động điền thông tin khi chọn
