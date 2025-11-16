## 📒 Sổ Thu Chi

Ứng dụng React Native giúp ghi chép, phân tích và trực quan hóa dòng tiền cá nhân. Dự án đã được cấu hình đầy đủ: bottom tabs, database SQLite, bộ lọc nâng cao, theme sáng/tối, quảng cáo test và nhiều tiện ích mở rộng.

### 🔑 Tính năng chính

- **Trang Tổng quan**: thẻ thống kê động, bộ lọc có animation, danh sách giao dịch kèm biểu đồ mini và banner quảng cáo test.
- **Thêm thu/chi**: nhập số tiền với `react-native-currency-input`, chọn danh mục, ví, ngày, ghi chú và hiển thị quảng cáo toàn màn hình (interstitial test).
- **Lịch tháng/năm**: `react-native-calendars` đánh dấu thu/chi theo ngày, điều hướng tháng, tóm tắt thu/chi và danh sách giao dịch mỗi ngày.
- **Báo cáo**: biểu đồ tròn theo danh mục (SVG + d3-shape), cột so sánh thu/chi 6 tháng, bộ lọc tháng/năm/toàn thời gian.
- **Tiện ích khác**: đổi theme (light/dark/system) được lưu bằng AsyncStorage, các phím tắt hữu ích, banner quảng cáo thử nghiệm.
- **Lưu trữ**: SQLite (`react-native-sqlite-storage`) cho giao dịch, AsyncStorage cho thiết lập, seed demo data để thử nhanh.

### 🧱 Kiến trúc & thư viện

- Điều hướng: `@react-navigation/native`, bottom tabs, gesture-handler, reanimated, screens.
- UI nâng cao: `react-native-linear-gradient`, `react-native-vector-icons`, `react-native-safe-area-context`.
- Dữ liệu & tiện ích: `react-native-sqlite-storage`, `react-native-async-storage`, `react-native-calendars`, `react-native-currency-input`, `react-native-google-mobile-ads` (test IDs), `d3-shape`, `react-native-svg`.

### 🚀 Cài đặt & chạy

```sh
npm install
npx pod-install   # bắt buộc trên iOS sau khi cài deps

# Start Metro
npm start

# Chạy ứng dụng
npm run android
npm run ios

# Test Jest + React Test Renderer
npm test
```

### 📱 Ghi chú triển khai

- Quảng cáo sử dụng test IDs của Google (banner + interstitial). Hãy thay bằng ID thật trước khi phát hành.
- SQLite được khởi tạo với dữ liệu mẫu. Dùng `seedDemoDataIfNeeded()` để reset hoặc thay bằng migration thật.
- Theme preference được lưu trong AsyncStorage, có thể chuyển nhanh ở tab **Khác**.
- Nếu bật Flipper hoặc Hermes, nhớ chạy `npx pod-install` sau khi thêm native deps.

### 🧪 Kiểm thử & lint

- `jest.setup.js` đã mock gesture-handler, reanimated, sqlite, ads… để test React components không phụ thuộc native.
- `npm test` chạy một smoke test cho `App.tsx`. Bạn có thể bổ sung tests cụ thể cho từng screen/provider.

### 📂 Cấu trúc nổi bật

- `src/theme/ThemeProvider.tsx` – quản lý palette, toggle theme, persist AsyncStorage.
- `src/context/TransactionContext.tsx` – CRUD giao dịch + thống kê theo tháng/danh mục.
- `src/screens/*` – mỗi tab có UI/animation/ads riêng.
- `src/data/database.ts` – khởi tạo SQLite, seed demo và helper CRUD.

Chúc bạn xây dựng thêm nhiều tiện ích thú vị trên nền tảng Sổ Thu Chi! 💸
