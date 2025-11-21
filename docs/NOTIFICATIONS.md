# Tính năng Nhắc lịch Chi tiêu

## Mô tả

Ứng dụng hỗ trợ **local push notification** (không cần server) để nhắc nhở người dùng ghi chép chi tiêu hàng ngày.

## Tính năng

- ✅ Nhận thông báo nhắc nhở hàng ngày
- ✅ Tùy chỉnh giờ nhận thông báo
- ✅ Bật/tắt nhắc nhở dễ dàng
- ✅ Gửi thông báo thử nghiệm
- ✅ Hoạt động hoàn toàn offline (không cần internet)

## Cách sử dụng

### 1. Mở cài đặt nhắc nhở

- Vào màn hình **Thêm** (More)
- Chọn **Nhắc lịch chi tiêu**

### 2. Bật nhắc nhở

- Bật công tắc **Bật nhắc nhở**
- Ứng dụng sẽ yêu cầu quyền gửi thông báo (lần đầu tiên)

### 3. Chọn giờ nhận thông báo

- Nhấn vào **Giờ nhắc nhở**
- Chọn giờ phù hợp (mặc định: 20:00)
- Thông báo sẽ được gửi hàng ngày vào giờ này

### 4. Thử nghiệm

- Nhấn **Gửi thông báo thử** để kiểm tra
- Bạn sẽ nhận ngay thông báo test

## Yêu cầu hệ thống

### Android

- Android 13 (API 33) trở lên: Cần cấp quyền thông báo
- Android 12 trở xuống: Tự động có quyền

### iOS

- Cần cấp quyền thông báo khi chạy lần đầu

## Cấu hình kỹ thuật

### Files được thêm mới

```
src/
├── services/
│   └── notificationService.ts    # Service xử lý notifications
├── stores/
│   └── reminderStore.ts          # Zustand store cho reminder settings
└── components/
    └── ReminderSettingsModal.tsx # UI cài đặt nhắc nhở
```

### Dependencies

- `react-native-push-notification` - Local push notification
- `@react-native-community/push-notification-ios` - iOS support
- `@react-native-community/datetimepicker` - Time picker

### Android Permissions

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

## API Reference

### notificationService.ts

#### `initializeNotifications()`

Khởi tạo notification service khi app khởi động.

#### `scheduleDailyReminder(hour: number, minute: number)`

Đặt lịch nhắc nhở hàng ngày.

- `hour`: Giờ (0-23)
- `minute`: Phút (0-59)

#### `cancelDailyReminder()`

Hủy nhắc nhở hàng ngày.

#### `sendTestNotification()`

Gửi ngay thông báo thử nghiệm.

### reminderStore.ts

#### State

- `enabled: boolean` - Trạng thái bật/tắt
- `hour: number` - Giờ nhắc nhở
- `minute: number` - Phút nhắc nhở

#### Actions

- `setEnabled(enabled: boolean)` - Bật/tắt nhắc nhở
- `setTime(hour: number, minute: number)` - Đặt giờ nhắc nhở
- `initReminder()` - Khởi tạo từ AsyncStorage

## Troubleshooting

### Không nhận được thông báo?

1. Kiểm tra quyền thông báo trong Settings của hệ thống
2. Đảm bảo **Bật nhắc nhở** đang bật
3. Thử **Gửi thông báo thử** để kiểm tra
4. Khởi động lại app

### Thông báo bị trễ?

- Android có thể trì hoãn thông báo để tiết kiệm pin
- Tắt Battery Optimization cho app trong Settings

### Build bị lỗi?

- Chạy `npm install` để cài đặt dependencies
- Chạy `npx patch-package` để apply patches
- Android: `cd android && ./gradlew clean`

## Technical Notes

### Notification Channel (Android)

```typescript
channelId: 'daily-reminder';
channelName: 'Nhắc nhở hàng ngày';
importance: HIGH;
```

### Scheduling Logic

- Nếu giờ đã chọn < giờ hiện tại → Schedule cho ngày mai
- Repeat type: `'day'` (hàng ngày)
- allowWhileIdle: `true` (hoạt động khi device idle)

### Data Persistence

Settings được lưu trong AsyncStorage với key:

```
sochitieu.reminder.settings
```

Format:

```json
{
  "enabled": true,
  "hour": 20,
  "minute": 0
}
```
