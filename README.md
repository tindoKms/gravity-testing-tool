# Gravity Testing Tool

Công cụ để kiểm thử và xác thực kết quả đánh giá LLM trong quy trình audit.

## Yêu cầu hệ thống

- Node.js >= 14.0.0
- npm >= 6.0.0

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd gravity-testing-tool
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file cấu hình môi trường:
```bash
cp .env.example .env
```

4. Cập nhật các biến môi trường trong file `.env`

## Biến môi trường

Tạo file `.env` trong thư mục gốc của project với các biến sau:

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `SERVER_ENDPOINT` | Địa chỉ API server | `http://localhost:3000` |
| `ACCESS_TOKEN` | Token để xác thực với API | `your-access-token` |
| `BATCHNAME` | Tên batch để kiểm thử | `Test` |
| `ACCOUNT_ID` | ID tài khoản | `your-account-id` |
| `INSTANCE_ID` | ID instance | `your-instance-id` |
| `AUDIT_FILE_PATH` | Đường dẫn đến file Excel audit | `data/audit_data.xlsx` |

## Sử dụng

### 1. Tạo Template Audit

Lấy dữ liệu từ API và tạo file Excel template:

```bash
npm run build-template
```

Hoặc:
```bash
node src/index.js build-template
```

File sẽ được tạo tại: `data/audit_template.xlsx`

### 2. Submit câu trả lời

Gửi câu trả lời từ file Excel lên hệ thống audit:

```bash
npm run submit -- --index=1 --questionId=abc123
```

Hoặc:
```bash
node src/index.js submit --index=1 --questionId=abc123
```

**Tham số:**
- `--index`: Số thứ tự câu hỏi trong file Excel
- `--questionId`: ID của câu hỏi

### 3. Lấy kết quả

Lấy kết quả xác thực từ AI và cập nhật vào file Excel:

```bash
npm run get-result -- --index=1 --questionId=abc123
```

Hoặc:
```bash
node src/index.js get-result --index=1 --questionId=abc123
```

**Tham số:**
- `--index`: Số thứ tự câu hỏi trong file Excel
- `--questionId`: ID của câu hỏi

## Cấu trúc thư mục

```
gravity-testing-tool/
├── src/
│   ├── commands/         # Các command CLI
│   ├── services/         # Business logic
│   ├── utils/           # Utility functions
│   └── index.js         # Entry point
├── data/                # Thư mục chứa file Excel
├── .env                 # Biến môi trường (không commit)
└── package.json         # Dependencies và scripts
```

## License

ISC
