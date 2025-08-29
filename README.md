# Volt AI - Smart Offline Wallet

A modern AI-assisted offline wallet that integrates blockchain technology with conventional banking systems, featuring advanced card scanning, POS functionality, and secure offline transaction processing.

## 🚀 Features

### Core Functionality
- 🔐 **Secure Authentication** with tokenized password reset via email
- 💰 **Multi-account Wallet Management** with real-time balance tracking
- 🤖 **AI-powered Financial Insights** and personalized recommendations
- 📱 **Mobile-First POS System** accessible on all devices
- 🏷️ **Volt Tag Money Transfers** for instant peer-to-peer payments
- 🏦 **Bank Integration Support** for seamless account linking

### Advanced Security Features
- 📷 **AI Card Scanner** with OCR and immediate data destruction
- 🔒 **Zero Card Storage Policy** - no PAN, CVV, or card details stored anywhere
- 🛡️ **Single-Use Tokens** - all payment tokens are one-time only
- 🚫 **Auto-Lockout System** - 3-strike rule with fraud detection
- 🔐 **Memory Hygiene** - automatic zeroization of sensitive data
- 📊 **PCI-DSS Compliant Architecture** with provider SDK integration

### POS/ATM Features
- 🏪 **Mobile-Accessible POS** - works on phones, tablets, and desktops
- 💳 **Multi-provider Payment Processing** (Stripe, Paystack, Flutterwave)
- 🧾 **Digital Receipts** with print/email options
- 📈 **Transaction Analytics** with detailed reporting
- 🔄 **Offline Intent Drafts** - prepare payments offline, process when online

## 🛡️ Security & Compliance

### Zero Card Storage Policy
**CRITICAL**: This application implements a strict no-storage policy for card data:

- ❌ **Never Stored**: PAN, CVV, expiry dates, cardholder names, card brands, last4 digits
- ❌ **No Persistence**: Card data is never saved to databases, logs, localStorage, IndexedDB, or caches
- ✅ **Immediate Destruction**: All card data is zeroized in memory after tokenization
- ✅ **Single-Use Tokens**: Payment tokens are used once and immediately invalidated
- ✅ **Provider SDKs**: Sensitive operations handled by certified payment provider SDKs

### Password Reset Security
- **Tokenized Reset Links**: Single-use, time-limited tokens (15 minutes)
- **Rate Limiting**: Prevents brute force attacks on reset requests
- **User Enumeration Protection**: Generic success messages regardless of email existence
- **Strong Password Policy**: Enforced with zxcvbn strength checking
- **Session Rotation**: All sessions invalidated on password change

### Fraud Prevention & Lockouts
- **3-Strike Rule**: Account locked after 3 failed payment attempts
- **Fraud Detection**: Automatic lockout for suspicious patterns:
  - High-risk decline codes (suspected_fraud, stolen_card, etc.)
  - Rapid multiple attempts (>5 in 5 minutes)
  - Multiple different card attempts
- **Temporary Lockouts**: 30-minute default lockout period
- **Device Fingerprinting**: Track attempts per user/device/IP combination
- **Admin Override**: Elevated auth required to clear locks

### Offline Security Model
- **No Offline Card Processing**: Cards cannot be charged without internet connection
- **Payment Intent Drafts**: Only non-sensitive payment details stored offline
- **Card Re-entry Required**: Users must re-scan/re-enter cards when back online
- **Encrypted Queue**: Any queued data uses session-based encryption
- **Auto-Cleanup**: Expired drafts and completed transactions automatically removed

## 📱 Mobile-First Design

### POS Accessibility
- **Always Visible**: POS accessible on all screen sizes without hidden navigation
- **Bottom Navigation**: Mobile users get persistent bottom tab bar
- **Responsive Buttons**: Full-width on mobile, auto-width on desktop
- **Touch-Friendly**: Large tap targets and gesture support
- **No Redirects**: Authentication handled in-page, never redirects away from POS

### UI/UX Improvements
- **Light Grey Background**: Consistent `bg-gray-50` across all pages
- **Responsive Typography**: Scales appropriately for mobile and desktop
- **Accessible Forms**: Proper labels, focus states, and keyboard navigation
- **Loading States**: Skeleton screens and progress indicators
- **Error Handling**: Clear, actionable error messages

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for responsive, utility-first styling
- **Framer Motion** for smooth animations and transitions
- **Zustand** for lightweight state management
- **React Query** for server state management (ready for integration)

### Security & Compliance
- **Web Crypto API** for client-side encryption
- **Tesseract.js** for on-device OCR processing
- **zxcvbn** for password strength validation
- **Automatic Log Redaction** for sensitive data protection
- **Device Fingerprinting** for fraud prevention

### Payment Processing
- **Provider Abstraction**: Supports Stripe, Paystack, Flutterwave
- **Mock Provider** for development and testing
- **Single-Use Tokenization** for PCI-DSS compliance
- **Idempotency Keys** for duplicate prevention

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account for backend services
- Payment provider accounts (optional for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd volt-ai-wallet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/voltai
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-here
   NEXTAUTH_SECRET=your-nextauth-secret-here
   NEXTAUTH_URL=http://localhost:3000
   
   # Email Provider
   EMAIL_PROVIDER=console
   # EMAIL_PROVIDER=smtp
   # EMAIL_PROVIDER=resend
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   RESEND_API_KEY=your-resend-api-key
   
   # Payment Provider
   PAYMENT_PROVIDER=mock
   # PAYMENT_PROVIDER=stripe
   # PAYMENT_PROVIDER=paystack
   # PAYMENT_PROVIDER=flutterwave
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   PAYSTACK_SECRET_KEY=sk_test_...
   FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
   
   # Security Settings
   MAX_FAILED_ATTEMPTS=3
   LOCKOUT_MINUTES=30
   FRAUD_WINDOW_MINUTES=15
   
   # Feature Flags
   NEXT_PUBLIC_POS_ENABLED=true
   ENABLE_CARD_SCANNER=true
   ENABLE_OFFLINE_MODE=true
   
   # App Configuration
   PUBLIC_APP_NAME=Volt AI
   PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open [http://localhost:5173](http://localhost:5173)
   - Create an account or sign in
   - Navigate to `/pos` for the Point of Sale interface

## 🔐 Security Implementation Details

### Card Data Handling
```typescript
// ✅ CORRECT: Immediate destruction after use
const cardHandler = new SecureCardHandler(cardData);
const token = await cardHandler.processAndDestroy(async (data) => {
  return await provider.tokenizeCard(data);
});
// Card data is automatically zeroized

// ❌ WRONG: Never store card data
const user = { cardNumber: "1234...", cvv: "123" }; // NEVER DO THIS
```

### Offline Behavior
```typescript
// ✅ CORRECT: Only store non-sensitive payment intents
const intentId = await offlineQueue.createPaymentIntentDraft(
  userId, 
  amount, 
  currency, 
  description
);
// When back online, user must re-enter card details

// ❌ WRONG: Never queue card data
await offlineQueue.queueTransaction(request, cardData); // NEVER DO THIS
```

### Fraud Prevention
```typescript
// Automatic lockout after failed attempts
await recordAttempt({
  userId: user.id,
  deviceId: generateDeviceFingerprint(),
  ip: getClientIP(),
  success: false,
  reason: 'card_declined'
});

// Check lock status before processing
const lockStatus = await isLocked({ userId, deviceId, ip });
if (lockStatus.locked) {
  throw new Error(`Account locked until ${lockStatus.until}`);
}
```

## 📱 Mobile POS Usage

### Accessing POS on Mobile
1. **Sign In**: Use the mobile-optimized login form
2. **Navigate**: Tap "POS" in the bottom navigation bar
3. **Enter Amount**: Use the large, touch-friendly keypad
4. **Scan Card**: Camera opens in full-screen mode with guides
5. **Process Payment**: Secure tokenization and immediate charge
6. **Receipt**: Digital receipt with email/print options

### Offline Behavior
- **Prepare Intents**: Create payment drafts with amount and description
- **No Card Storage**: Card details never stored offline
- **Online Processing**: Card must be re-scanned when connectivity returns
- **Security First**: Compliance over convenience

## 🧪 Testing

### Security Tests
```bash
# Test card data is never persisted
npm run test:security

# Test lockout mechanisms
npm run test:fraud-prevention

# Test offline queue (no sensitive data)
npm run test:offline-queue
```

### E2E Tests
```bash
# Mobile POS workflow
npm run test:e2e:mobile-pos

# Password reset flow
npm run test:e2e:password-reset

# Offline/online transaction flow
npm run test:e2e:offline-transactions
```

## 🚀 Deployment

### Production Checklist
- [ ] Configure real payment provider (Stripe/Paystack/Flutterwave)
- [ ] Set up email service (SMTP/Resend)
- [ ] Configure database with proper indexes
- [ ] Set strong JWT secrets
- [ ] Enable rate limiting
- [ ] Configure monitoring and alerting
- [ ] Review PCI-DSS compliance requirements
- [ ] Test fraud detection thresholds

### Environment Variables (Production)
```env
# Security (REQUIRED)
JWT_SECRET=<strong-random-secret>
MAX_FAILED_ATTEMPTS=3
LOCKOUT_MINUTES=30

# Payment Provider (REQUIRED)
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email (REQUIRED for password reset)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...

# Database (REQUIRED)
DATABASE_URL=postgresql://...
```

## ⚠️ Known Limitations

### Security Constraints
- **No Offline Card Processing**: Cards cannot be charged without internet connection
- **Card Re-entry Required**: Users must re-scan cards after going offline
- **Limited Offline Functionality**: Only payment intent drafts supported offline
- **Provider Dependency**: Real card processing requires certified payment provider SDKs

### Technical Limitations
- **Browser Support**: Requires modern browsers with Web Crypto API and Camera API
- **Camera Quality**: OCR accuracy depends on lighting and card condition
- **Network Dependency**: All sensitive operations require active internet connection
- **Memory Constraints**: Large transaction histories may impact performance

### Compliance Notes
- **PCI-DSS**: This application is designed for PCI-DSS compliance but requires proper provider integration
- **Data Residency**: Payment processing may involve data transfer to provider servers
- **Audit Requirements**: Production deployments should implement comprehensive audit logging
- **Certification**: Real-world usage requires payment provider certification and compliance review

## 🔄 Recent Updates (v2.1.0)

### Security Enhancements
- ✅ Implemented zero card storage policy
- ✅ Added single-use token enforcement
- ✅ Implemented 3-strike lockout system
- ✅ Added fraud detection algorithms
- ✅ Implemented automatic memory zeroization
- ✅ Added comprehensive log redaction

### Mobile Improvements
- ✅ Made POS accessible on all screen sizes
- ✅ Added bottom navigation for mobile users
- ✅ Implemented responsive button system
- ✅ Added touch-friendly interfaces
- ✅ Removed authentication redirects from POS

### UI/UX Refresh
- ✅ Applied light grey background globally
- ✅ Implemented mobile-first responsive design
- ✅ Added comprehensive theme system
- ✅ Enhanced accessibility features
- ✅ Added loading states and error handling

## 📞 Support & Documentation

### Security Questions
For security-related questions or to report vulnerabilities:
- **Email**: security@voltai.app
- **Response Time**: 24 hours for critical issues

### Integration Support
For payment provider integration assistance:
- **Documentation**: [docs.voltai.app/payments](https://docs.voltai.app/payments)
- **Email**: integrations@voltai.app

### General Support
- **Email**: support@voltai.app
- **Status Page**: [status.voltai.app](https://status.voltai.app)

---

## 📋 Implementation Checklist

### ✅ Completed Features
- [x] Secure password reset with tokenized links
- [x] AI-powered card scanner with OCR
- [x] Mobile-accessible POS system
- [x] Zero card storage implementation
- [x] Single-use token enforcement
- [x] 3-strike lockout system
- [x] Fraud detection algorithms
- [x] Offline payment intent drafts
- [x] Responsive UI with mobile-first design
- [x] Light grey background theme
- [x] Bottom navigation for mobile
- [x] Comprehensive security testing

### 🔄 In Progress
- [ ] Real payment provider integration (Stripe/Paystack/Flutterwave)
- [ ] Email service integration (SMTP/Resend)
- [ ] Database schema implementation
- [ ] Production deployment configuration

### 📋 Roadmap
- [ ] Biometric authentication
- [ ] Hardware terminal integration
- [ ] Multi-language support
- [ ] Advanced fraud detection ML models
- [ ] Merchant dashboard
- [ ] Mobile app (React Native)

---

© 2025 Volt AI. All rights reserved.