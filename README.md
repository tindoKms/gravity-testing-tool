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

**Lưu ý:**
- File sẽ được tạo tại: `data/audit_template.xlsx`
- Nếu file đã tồn tại, nó sẽ bị ghi đè

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
- `--index`: Số thứ tự câu hỏi trong file Excel, nếu không khai báo index thì sẽ tự động set index=1
- `--questionId`: ID của câu hỏi, nếu không có questionId thì sẽ submit hết tất cả answer tương ứng với cột index
- `--auto-validate`: Tự động validate answer sau khi submit thành công. Nếu validate thành công sẽ fill `ValidateAi=Yes` và `SubmitValidateStatus=SUCCESS`, nếu fail sẽ fill `ValidateAi=Yes` và `SubmitValidateStatus=FAIL`

**Ví dụ submit với auto-validate:**
```bash
npm run submit -- --index=1 --questionId=abc123 --auto-validate
```

**Lưu ý:**
- Nếu không có `--questionId`, tất cả các answer trong cột index sẽ được submit
- Answer rỗng sẽ bị skip và Status được set là SKIP
- Version sẽ được tự động lấy từ audit template trên server
- Khi sử dụng `--auto-validate`, validation sẽ chỉ chạy sau khi submit thành công

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
- `--index`: Số thứ tự câu hỏi trong file Excel, nếu không khai báo index thì sẽ tự động set index=1
- `--questionId`: ID của câu hỏi, nếu không có questionId thì sẽ get result tất cả answer tương ứng với cột index

**Lưu ý:**
- Command này lấy kết quả đánh giá từ AI và cập nhật vào các cột: `AiScore`, `AiProcessedAt`, `AiAnswer`
- Chỉ lấy kết quả cho các answer đã được submit thành công
- Nếu AI chưa xử lý xong, kết quả có thể chưa có

### 4. Validate Answer

Trigger AI validation cho các answer đã submit:

```bash
npm run validate-answer -- --questionId=abc123
```

Hoặc:
```bash
node src/index.js validate-answer --questionId=abc123
```

**Tham số:**
- `--questionId`: ID của câu hỏi, nếu không có questionId thì sẽ validate tất cả answer có `ValidateAi` không rỗng

**Lưu ý:**
- Command này chỉ validate các row có cột `ValidateAi` không rỗng
- Kết quả sẽ được cập nhật vào cột `SubmitValidateStatus` (SUCCESS/FAILED/SKIP)
- Có delay 300ms giữa các request khi validate nhiều question để tránh rate limiting

### 5. Sync prompt lên server

Tự động tạo prompt từ Excel lên trên system, nếu promptName đã tồn tại thì sẽ không hợp lệ, nếu promptName và userPrompt thì sẽ bị SKIP

```bash
npm run sync-prompt -- --questionId=abc123
```

Hoặc:
```bash
node src/index.js sync-prompt --questionId=abc123
```

**Tham số:**
- `--questionId`: ID của câu hỏi, nếu không có questionId thì sẽ submit tất cả prompt

**Lưu ý:**
- Command này chỉ sync các row có cả `PromptName` và `UserPrompt` không rỗng
- Nếu `PromptName` đã tồn tại trên server, prompt sẽ không được tạo và bị đánh dấu FAILED
- Row thiếu thông tin sẽ bị SKIP

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
