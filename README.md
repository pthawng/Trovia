# 🌐 Trovia — Trusted Rental Marketplace Platform
> **Production-Grade Decentralized Rental Marketplace** engineered for maximum scalability, transactional integrity, and seamless bank reconciliation.
> **Nền tảng Chợ Thuê Trọ Đáng Tin Cậy cấp độ Production** được thiết kế để tối ưu khả năng mở rộng, tính toàn vẹn giao dịch và đối soát ngân hàng tự động.

---

## 📌 Table of Contents / Mục lục
1. [System Architecture / Kiến trúc Hệ thống](#-system-architecture--kien-truc-he-thong)
2. [Tech Stack / Công nghệ sử dụng](#-tech-stack--cong-nghe-su-dung)
3. [Repository Structure / Cấu trúc mã nguồn](#-repository-structure--cau-truc-ma-nguon)
4. [Local Setup / Cài đặt cục bộ](#-local-setup--cai-dat-cuc-bo)
5. [GCP Production Deployment / Triển khai lên GCP](#-gcp-production-deployment--trien-khai-len-gcp)
6. [Security & Compliance / Bảo mật & Tuân thủ](#-security--compliance--bao-mat--tuan-thu)

---

## 🏗️ System Architecture / Kiến trúc Hệ thống

### High-Level Architecture / Sơ đồ Kiến trúc Tổng quan
```mermaid
graph TD
    Client([🌐 Client: Browser / Web SPA]) -->|HTTPS / WSS| LoadBalancer[🚦 GCP Global Load Balancer & CDN]
    
    subgraph Frontend_Cluster [Frontend Tier]
        LoadBalancer -->|SSR & Hydration| CloudRunFE[🚀 Cloud Run: TanStack Start SSR]
    end

    subgraph Backend_Cluster [Backend Service Tier]
        LoadBalancer -->|REST API / Sockets| CloudRunBE[🚀 Cloud Run: NestJS API Engine]
    end

    subgraph Cloud_Infrastructure [Managed Infrastructure]
        CloudRunBE -->|Secure IAM Connection| CloudSQL[(🗄️ Cloud SQL: PostgreSQL HA)]
        CloudRunBE -->|Object Storage APIs| GCS[🪣 Google Cloud Storage: Property Images & Contracts]
        CloudRunBE -->|SMTP secure handshakes| SMTP[📧 SMTP Relay / Gmail Server]
        CloudRunBE -->|Secret Fetching| SecretManager[🔑 GCP Secret Manager]
    end

    classFE[CloudRunFE]
    classBE[CloudRunBE]
    classDB[CloudSQL]
```

### Key Architectural Decisions / Các Quyết định Kiến trúc Cốt lõi
*   **Monorepo Separation (Chia tách Monorepo)**: Clean separation between `frontend` and `backend`, making it highly modular and independently deployable.
    *   *Việt hóa*: Phân tách rõ ràng giữa `frontend` và `backend`, tăng tính mô-đun và cho phép triển khai độc lập.
*   **TanStack Start SSR**: Combined the blazing speed of client-side React Query with server-side pre-rendering (SSR) to ensure maximum SEO optimization for public property discovery.
    *   *Việt hóa*: Kết hợp tốc độ vượt trội của React Query phía client với cơ chế kết xuất phía máy chủ (SSR) để tối ưu hóa SEO cho trang khám phá phòng trọ.
*   **Atomic Lease Operations (Tính toàn vẹn của hợp đồng)**: Leverages Prisma relational database transactions to ensure that rent applications, contract generation, and room status updates either commit together or roll back safely.
    *   *Việt hóa*: Sử dụng transaction của cơ sở dữ liệu quan hệ Prisma để đảm bảo các thao tác đăng ký thuê, tạo hợp đồng và cập nhật trạng thái phòng đều diễn ra đồng thời hoặc khôi phục an toàn nếu có lỗi.
*   **Automated Payment Reconciliation (Đối soát hóa đơn tự động)**: Integrates deep bank VietQR payment verification to automate payment tracking from tenants to landlords.
    *   *Việt hóa*: Tích hợp đối soát mã VietQR ngân hàng để tự động hóa quy trình theo dõi hóa đơn và thanh toán từ người thuê đến chủ nhà.

---

## 🛠️ Tech Stack / Công nghệ sử dụng

| Component / Thành phần | Technology / Công nghệ | Rationale / Lý do lựa chọn |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TanStack Start (SSR) | SEO-optimized, highly interactive state hydration, zero-boilerplate routes. |
| **Data Fetching** | TanStack React Query v5 | Auto-caching, optimistic mutations, query invalidation pipelines. |
| **Backend Engine** | NestJS (TypeScript) | Highly structured architecture, built-in dependency injection, scalable module system. |
| **Database ORM** | Prisma Client | Type-safe queries, migration control, relational schema integrity. |
| **Real-time Gateway**| Socket.io (WebSockets) | Real-time chat summaries, live notifications, and instant rental request status updates. |
| **Mail Subsystem** | Centralized Nodemailer Core | Centralized email delivery system using HTML email templates and secure SMTP configurations. |
| **Styling** | Tailwind CSS | Utility-first styling with modern Vietnamese glassmorphism and animations. |

---

## 📂 Repository Structure / Cấu trúc mã nguồn

```text
trovia-home-hub/
├── backend/                  # NestJS API Application
│   ├── prisma/               # Schema configuration and migrations
│   └── src/
│       ├── config/           # Centralized configuration loaders
│       ├── modules/          # Encapsulated Business Modules
│       │   ├── auth/         # Authentication & Session controller
│       │   ├── listings/     # Public discoveries & property listing APIs
│       │   ├── mail/         # Centralized Email Service using Nodemailer
│       │   ├── rental-requests/ # Tenant application and booking request engine
│       │   └── tenancies/    # Active lease agreements & landlord workspace controller
│       └── main.ts           # Server entry point
└── frontend/                 # TanStack Start Web Application
    ├── src/
    │   ├── components/       # Premium atomic and composite components
    │   ├── routes/           # Strongly-typed routing tree (TanStack Router)
    │   │   ├── _authenticated/ # Protected dashboard & explore routes
    │   │   └── about.tsx ... # SEO-optimized static public routes (bilingual)
    │   ├── services/         # API connection layers
    │   └── main.tsx          # Client-side mounting portal
```

---

## 💻 Local Setup / Cài đặt cục bộ

### Prerequisites / Yêu cầu hệ thống
*   Node.js (v18.x or later)
*   PostgreSQL (Local instance or Docker container)

### Step 1: Clone and Install / Bước 1: Tải mã nguồn và Cài đặt
```bash
# Clone the repository / Tải mã nguồn
git clone https://github.com/pthawng/Trovia.git
cd trovia-home-hub

# Install dependencies for both tiers / Cài đặt thư viện cho cả hai lớp
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Configuration / Bước 2: Thiết lập cấu hình
Create `.env` file in the `backend/` directory / Tạo tệp `.env` tại thư mục `backend/`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/trovia?schema=public"
JWT_SECRET="your_jwt_secret_key_here"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM_NAME="Trovia Notification"
```

### Step 3: Database Migration & Run / Bước 3: Di cư CSDL & Khởi chạy
```bash
# In backend / Tại thư mục backend
npx prisma migrate dev
npm run start:dev

# In frontend / Tại thư mục frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application / Truy cập [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

---

## ☁️ GCP Production Deployment / Triển khai lên GCP

This architecture is optimized for a highly-scalable, serverless deployment on **Google Cloud Platform (GCP)** utilizing secure, managed services.
*Kiến trúc này được tối ưu hóa cho mô hình triển khai Serverless, tự động mở rộng trên **Google Cloud Platform (GCP)** bằng các dịch vụ quản lý bảo mật.*

```text
                                  Triển khai Production trên GCP
  GitHub Push ➔ Cloud Build ➔ Artifact Registry ➔ Cloud Run (Frontend & Backend) ➔ Cloud SQL (DB)
```

### Phase 1: Database Setup (Cloud SQL) / Giai đoạn 1: Khởi tạo CSDL
1.  Enable the **Cloud SQL Admin API** / Kích hoạt **Cloud SQL Admin API**.
2.  Create a **Cloud SQL (PostgreSQL)** instance / Tạo một máy chủ **Cloud SQL (PostgreSQL)**.
3.  Set up Private IP connections utilizing **Serverless VPC Access** to guarantee that the database is isolated from the public internet.
    *   *Việt hóa*: Thiết lập kết nối IP nội bộ thông qua **Serverless VPC Access** để đảm bảo cơ sở dữ liệu được cô lập hoàn toàn khỏi internet công cộng.

### Phase 2: Secure Secret Storage (Secret Manager) / Giai đoạn 2: Quản lý biến bảo mật
Never hardcode credentials or commit `.env` files. Store your production environment variables securely inside **GCP Secret Manager**:
*Không bao giờ lưu cứng thông tin tài khoản hoặc đẩy file `.env` lên Git. Lưu trữ tất cả biến môi trường an toàn trong **GCP Secret Manager**:*

```bash
# Create secrets / Tạo các khóa bí mật
gcloud secrets create DATABASE_URL --replication-policy="automatic"
gcloud secrets create JWT_SECRET --replication-policy="automatic"
gcloud secrets create SMTP_PASSWORD --replication-policy="automatic"

# Add versions / Thêm giá trị cho khóa
echo -n "postgresql://user:pass@private-ip:5432/dbname" | gcloud secrets versions add DATABASE_URL --data-file=-
```

### Phase 3: Containerization & Build (Cloud Build) / Giai đoạn 3: Đóng gói & Xây dựng
Deploy a standard `Dockerfile` inside both `backend` and `frontend` folders. 
*Đặt tệp `Dockerfile` tiêu chuẩn vào cả hai thư mục `backend` và `frontend`.*

#### Backend Dockerfile Example:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
EXPOSE 8080
ENV PORT=8080
CMD ["node", "dist/main"]
```

Run Cloud Build to compile and push images to **GCP Artifact Registry**:
*Chạy Cloud Build để biên dịch và đẩy container image lên **GCP Artifact Registry**:*

```bash
# Create Registry / Tạo kho chứa Image
gcloud artifacts repositories create trovia-repo --repository-format=docker --location=us-central1

# Build Backend Image / Biên dịch Image Backend
gcloud builds submit --tag us-central1-docker.pkg.dev/your-project-id/trovia-repo/backend:latest ./backend
```

### Phase 4: Serverless Execution (Cloud Run) / Giai đoạn 4: Khởi chạy Serverless
Deploy the built containers directly to **Cloud Run**, ensuring that they auto-scale from 0 to hundreds of instances seamlessly based on request load.
*Triển khai các container đã dựng trực tiếp lên **Cloud Run**, đảm bảo tự động co giãn từ 0 đến hàng trăm máy chủ tùy theo lưu lượng truy cập.*

```bash
# Deploy Backend Service to Cloud Run / Triển khai dịch vụ Backend lên Cloud Run
gcloud run deploy trovia-backend \
  --image=us-central1-docker.pkg.dev/your-project-id/trovia-repo/backend:latest \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --vpc-connector=projects/your-project-id/locations/us-central1/connectors/trovia-vpc-connector \
  --set-secrets=DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest
```

---

## 🔒 Security & Compliance / Bảo mật & Tuân thủ

To align with modern corporate and FAANG security checklists, the following measures are enforced:
*Để đảm bảo tuân thủ danh mục bảo mật chuẩn doanh nghiệp và các tập đoàn lớn (FAANG), hệ thống áp dụng:*

*   **Principle of Least Privilege (Nguyên tắc Đặc quyền Tối thiểu)**: Cloud Run instances run under dedicated Service Accounts with minimal IAM permissions, restricted only to necessary Secret Manager keys and Cloud SQL proxies.
    *   *Việt hóa*: Các máy chủ Cloud Run được chạy dưới các Service Account chuyên biệt với quyền hạn IAM tối thiểu, chỉ được phép truy cập các khóa Secret Manager cụ thể và Cloud SQL proxy cần thiết.
*   **Data at Rest & Transit Encryption (Mã hóa Dữ liệu)**: All database connections utilize SSL/TLS. Critical documents and user assets uploaded to **Google Cloud Storage** are encrypted at rest via Google-Managed Encryption Keys (GMEK) or Customer-Managed Encryption Keys (CMEK).
    *   *Việt hóa*: Tất cả kết nối CSDL sử dụng SSL/TLS. Tài liệu và hình ảnh tải lên **Google Cloud Storage** được mã hóa tĩnh thông qua Google-Managed Encryption Keys (GMEK).
*   **DDoS & Web Protection (Phòng chống tấn công)**: Integrated with **GCP Cloud Armor** at the Global Load Balancer to defend against SQL Injection, Cross-Site Scripting (XSS), and Layer 7 DDoS attacks.
    *   *Việt hóa*: Tích hợp **GCP Cloud Armor** tại Bộ cân bằng tải để phòng chống các đòn tấn công SQL Injection, XSS và DDoS tầng 7.

---
> **GCP Agent Documentation Specialist** — *Ensuring enterprise scalability, absolute security compliance, and premium documentation architectures.*
> **GCP Agent Documentation Specialist** — *Đảm bảo khả năng mở rộng quy mô doanh nghiệp, tuân thủ bảo mật tuyệt đối và kiến trúc tài liệu cao cấp.*
