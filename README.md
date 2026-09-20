# SkyRush-SeverRoot

Bot Discord quản trị server và Auto Role.

## Lệnh Prefix

!ban @user [lý do]
!kick @user [lý do]
!hanche @user [thời gian] [lý do]
!bohanche @user

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
4. Điền DISCORD_TOKEN, CLIENT_ID và GUILD_ID.
5. Bật Server Members Intent và Message Content Intent trong Discord Developer Portal.
6. Chạy npm run deploy.
7. Chạy npm start.

Bot cần các quyền phù hợp: View Channels, Send Messages, Manage Messages, Manage Roles, Moderate Members, Kick Members và Ban Members.
