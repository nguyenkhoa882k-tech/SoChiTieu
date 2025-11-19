# Tính năng Xuất/Nhập Dữ liệu

## Mô tả
Ứng dụng Sổ Chi Tiêu hỗ trợ sao lưu và khôi phục dữ liệu với mã hóa bảo mật.

## Tính năng

### 1. Xuất dữ liệu
- Xuất tất cả giao dịch và danh mục tùy chỉnh ra file được mã hóa
- File được lưu với định dạng `.sct` (SoChiTieu)
- Dữ liệu được mã hóa bằng thuật toán XOR cipher với khóa bí mật
- File được lưu vào thư mục Downloads (Android) hoặc Documents (iOS)
- Có thể chia sẻ file qua email, cloud storage, messaging apps

### 2. Nhập dữ liệu
- Chọn file sao lưu từ danh sách file đã xuất
- Xác nhận trước khi nhập để tránh nhầm lẫn
- Dữ liệu mới sẽ được **thêm vào** dữ liệu hiện tại (không ghi đè)
- Tự động nhập cả danh mục tùy chỉnh

## Cách sử dụng

### Xuất dữ liệu
1. Vào màn hình "Thêm" (tab cuối cùng)
2. Chọn "Xuất dữ liệu"
3. Đợi quá trình xuất hoàn tất
4. Chọn "Chia sẻ" để gửi file hoặc "Không" để chỉ lưu trên máy

### Nhập dữ liệu
1. Vào màn hình "Thêm" (tab cuối cùng)
2. Chọn "Nhập dữ liệu"
3. Chọn file sao lưu từ danh sách
4. Xác nhận để nhập dữ liệu

## Cấu trúc file

File sao lưu chứa:
- `version`: Phiên bản định dạng (hiện tại: 1.0)
- `exportDate`: Ngày giờ xuất file
- `transactions`: Danh sách tất cả giao dịch
- `customCategories`: Danh mục tùy chỉnh (nếu có)

## Bảo mật

### Mã hóa
- Dữ liệu được mã hóa bằng XOR cipher
- Khóa mã hóa: `SoChiTieu@2025#SecureKey!`
- Dữ liệu được encode sang Base64 trước khi lưu file

### Lưu ý
- File `.sct` chỉ có thể đọc được bởi ứng dụng Sổ Chi Tiêu
- Không chia sẻ file sao lưu với người lạ
- Nên lưu file sao lưu ở nơi an toàn (cloud storage cá nhân)

## Thư viện sử dụng

- `@dr.pogodin/react-native-fs`: Đọc/ghi file
- `react-native-share`: Chia sẻ file
- `base-64`: Encode/decode Base64
- `@react-native-async-storage/async-storage`: Lưu trữ local

## Lộ trình phát triển

### Hiện tại (v1.0)
- ✅ Xuất dữ liệu với mã hóa
- ✅ Nhập dữ liệu từ file
- ✅ Chia sẻ file sao lưu
- ✅ Danh sách file sao lưu

### Tương lai
- [ ] Tự động sao lưu định kỳ
- [ ] Đồng bộ với cloud (Google Drive, iCloud)
- [ ] Nén dữ liệu trước khi mã hóa
- [ ] Mã hóa mạnh hơn (AES-256)
- [ ] Import/Export CSV cho Excel

## Xử lý lỗi

### Xuất dữ liệu thất bại
- Kiểm tra quyền ghi file trong Settings
- Đảm bảo đủ dung lượng lưu trữ

### Nhập dữ liệu thất bại
- File có thể bị hỏng hoặc không đúng định dạng
- File không phải được tạo bởi ứng dụng Sổ Chi Tiêu
- Phiên bản file quá cũ hoặc quá mới

## Hỗ trợ

Nếu gặp vấn đề, vui lòng liên hệ:
- Email: support@sochitieu.app
- GitHub Issues: [link]
