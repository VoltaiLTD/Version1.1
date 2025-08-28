# Volt AI - Smart Offline Wallet

A modern AI-assisted offline wallet that integrates blockchain technology with conventional banking systems, featuring advanced card scanning, POS functionality, and secure offline transaction processing.

## 🚀 Features

### Core Functionality
- 🔐 **Secure Authentication** with password reset via tokenized email links
- 💰 **Multi-account Wallet Management** with real-time balance tracking
- 🤖 **AI-powered Financial Insights** and personalized recommendations
- 📱 **Offline Transaction Capabilities** with automatic sync when online
- 🏷️ **Volt Tag Money Transfers** for instant peer-to-peer payments
- 🏦 **Bank Integration Support** for seamless account linking

### Advanced Features
- 📷 **AI Card Scanner** with OCR for automatic card data extraction
- 🏪 **POS/ATM Interface** for merchant transactions
- 💳 **Multi-provider Payment Processing** (Stripe, Paystack, Flutterwave)
- 🔒 **Advanced Security** with encryption and PCI-DSS compliance
- 🎨 **Customizable UI** with light/dark themes and accessibility options
- 📊 **Transaction Analytics** with detailed reporting and insights

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for responsive, utility-first styling
- **Framer Motion** for smooth animations and transitions
- **Zustand** for lightweight state management
- **React Query** for server state management

### Backend & Services
- **Supabase** for authentication and database
- **IndexedDB** for offline data persistence
- **Web Crypto API** for client-side encryption
- **Tesseract.js** for OCR card scanning
- **OpenAI** for AI insights and recommendations

### Payment Processing
- **Stripe** for card processing and tokenization
- **Paystack** for African market payments
- **Flutterwave** for multi-currency support
- **Mock Provider** for development and testing

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
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Payment Provider (start with mock for development)
   VITE_PAYMENT_PROVIDER=mock
   
   # Feature Flags
   ENABLE_CARD_SCANNER=true
   ENABLE_OFFLINE_MODE=true
   ENABLE_POS_MODE=true
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open [http://localhost:5173](http://localhost:5173)
   - Create an account or sign in
   - Explore the dashboard and features

## 🔐 Security & Compliance

### Password Reset Security
- **Tokenized Reset Links**: Single-use, time-limited tokens (15 minutes)
- **Rate Limiting**: Prevents brute force attacks
- **User Enumeration Protection**: Generic success messages
- **Strong Password Policy**: Enforced with zxcvbn strength checking

### Card Data Security
- **No PAN Storage**: Full card numbers never stored server-side
- **Client-side Encryption**: Sensitive data encrypted using Web Crypto API
- **Tokenization**: Cards tokenized through payment providers
- **PCI-DSS Awareness**: Architecture designed for compliance
- **Log Scrubbing**: Automatic removal of sensitive data from logs

### Offline Security
- **Session-based Encryption**: Temporary encryption keys for offline data
- **Secure Queue**: Encrypted transaction queue with retry logic
- **Data Integrity**: Cryptographic signatures for offline transactions

## 📱 Card Scanner Technology

### OCR Capabilities
- **Tesseract.js Integration**: On-device optical character recognition
- **Multi-format Support**: Embossed and printed card text
- **Real-time Processing**: Live camera feed with overlay guides
- **Fallback Options**: Manual entry and image upload alternatives

### Supported Card Types
- Visa, Mastercard, American Express
- Discover, Verve (Nigerian cards)
- Custom BIN range detection
- Luhn algorithm validation

### Privacy Features
- **Local Processing**: OCR runs entirely on device
- **No Data Transmission**: Card images never leave the device
- **Secure Disposal**: Automatic cleanup of temporary data

## 🏪 POS/ATM Functionality

### Transaction Processing
- **Online Mode**: Real-time payment processing
- **Offline Mode**: Queued transactions with auto-sync
- **Receipt Generation**: Digital receipts with email/print options
- **Refund Support**: Full and partial refund capabilities

### Merchant Features
- **Transaction History**: Detailed reporting and analytics
- **Export Capabilities**: CSV export for accounting
- **Multi-currency Support**: Configurable currency options
- **Keyboard Shortcuts**: Efficient POS operation

## 🔄 Offline Transaction System

### Queue Management
- **IndexedDB Storage**: Persistent offline transaction queue
- **Exponential Backoff**: Smart retry logic for failed transactions
- **Conflict Resolution**: Idempotency keys prevent duplicates
- **Background Sync**: Automatic processing when connectivity returns

### Data Synchronization
- **Incremental Sync**: Only sync changed data
- **Conflict Detection**: Handle concurrent modifications
- **Error Recovery**: Robust error handling and recovery
- **Status Tracking**: Real-time sync status indicators

## 🎨 UI/UX Design System

### Theme System
- **Light/Dark Modes**: System preference detection
- **Custom Themes**: Configurable color schemes
- **Density Options**: Compact, comfortable, spacious layouts
- **Motion Controls**: Reduced motion for accessibility

### Accessibility
- **WCAG 2.1 Compliance**: AA level accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **High Contrast**: Enhanced visibility options

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Core business logic and utilities
- **Integration Tests**: API endpoints and data flow
- **E2E Tests**: Complete user workflows
- **Security Tests**: Authentication and authorization

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Configuration
- Configure production environment variables
- Set up payment provider webhooks
- Configure email service for password resets
- Set up monitoring and logging

### Deployment Options
- **Netlify**: Static site deployment
- **Vercel**: Full-stack deployment
- **AWS S3 + CloudFront**: CDN deployment
- **Docker**: Containerized deployment

## 🔧 Payment Provider Integration

### Mock Provider (Development)
```typescript
VITE_PAYMENT_PROVIDER=mock
```
- Simulates payment processing
- Configurable success/failure rates
- No external dependencies

### Stripe Integration
```typescript
VITE_PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Paystack Integration
```typescript
VITE_PAYMENT_PROVIDER=paystack
PAYSTACK_SECRET_KEY=sk_test_...
```

### Flutterwave Integration
```typescript
VITE_PAYMENT_PROVIDER=flutterwave
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
```

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking
- **Error Tracking**: Automatic error reporting
- **User Analytics**: Privacy-focused usage analytics

### Business Metrics
- **Transaction Volume**: Payment processing metrics
- **User Engagement**: Feature usage analytics
- **Conversion Rates**: Funnel analysis

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Standardized commit messages

## 📄 License

© 2025 Volt AI. All rights reserved.

## 🆘 Support

### Documentation
- **API Reference**: Detailed API documentation
- **Integration Guides**: Step-by-step integration instructions
- **Troubleshooting**: Common issues and solutions

### Contact
- **Email**: support@voltai.app
- **Documentation**: [docs.voltai.app](https://docs.voltai.app)
- **Status Page**: [status.voltai.app](https://status.voltai.app)

---

## 🔄 Recent Updates

### Version 2.0.0 - Enhanced Security & POS Features
- ✅ Secure password reset with tokenized links
- ✅ AI-powered card scanner with OCR
- ✅ POS/ATM interface for merchant transactions
- ✅ Offline transaction queue with encryption
- ✅ Multi-provider payment processing
- ✅ Enhanced UI with theme system
- ✅ Comprehensive security improvements

### Known Limitations
- **Card Scanner**: Requires good lighting and clear card images
- **Offline Mode**: Limited to pre-tokenized cards for full offline support
- **Payment Providers**: Full integration requires production API keys
- **Browser Support**: Modern browsers with Web Crypto API support required

### Roadmap
- [ ] Biometric authentication
- [ ] Multi-language support
- [ ] Advanced fraud detection
- [ ] Merchant dashboard
- [ ] Mobile app (React Native)
- [ ] Hardware terminal integration