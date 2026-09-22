# SkyRush-SeverRoot

Bot Discord quản trị server, Auto Role và Nhà tù.

## Lệnh Prefix

/help
!ban @user [lý do]
!kick @user [lý do]
!hanche @user [thời gian] [lý do]
!bohanche @user

## Nhà tù

### Cấu hình

Dùng một trong hai cách:

`!nhatu role @role #kenh 3`

- Dùng role nhà tù có sẵn.
- `#kenh` là kênh người bị tù được phép vào.
- `3` là số lần cần dùng `!laudon` để được ra.

Hoặc:

`!nhatu tao #kenh 3`

Bot sẽ tự tạo role `⛓️ Tù nhân`.

Xem cấu hình:

`!nhatu info`

### Tống tù

`!phattu @user [lý do]`

Bot sẽ:
- Lưu các role hiện tại của thành viên.
- Tháo các role mà bot có thể quản lý.
- Thêm role tù nhân.
- Giới hạn role tù nhân chỉ xem và nhắn trong kênh nhà tù.
- Gửi hướng dẫn cách ra tù.

### Ra tù

Người bị tù vào kênh nhà tù và dùng:

`!laudon`

Mỗi lần dùng tăng 1 lượt. Khi đủ số lượt yêu cầu, bot tự tháo role tù nhân và khôi phục các role trước đó.

## Lệnh Slash

/xoa [so_luong]
/themrole @user @role
/xoarole @user @role
/autorole

## Auto Role

Dùng /autorole để mở panel với các nút Chọn Role, Bật, Tắt và Thông tin.

Khi thành viên mới vào server, bot sẽ tự thêm role đã chọn nếu Auto Role đang bật.

Bot cần Manage Roles và role của bot phải nằm cao hơn role Auto Role.

## Cài đặt

1. Cài Node.js 20+.
2. Chạy npm install.
3. Copy .env.example thành .env.
4. Điền DISCORD_TOKEN và CLIENT_ID. GUILD_ID là tùy chọn.
5. Bật Server Members Intent và Message Content Intent trong Discord Developer Portal.
6. Chạy npm run deploy.
7. Chạy npm start.

Bot cần các quyền phù hợp: View Channels, Send Messages, Read Message History, Manage Messages, Manage Roles, Manage Channels, Moderate Members, Kick Members và Ban Members.
