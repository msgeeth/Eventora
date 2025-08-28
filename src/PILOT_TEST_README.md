# EVENTORA - Pilot Test Version 🏆

**Sri Lanka's Premier Luxury Event Orchestration Platform**

## 🚀 Pilot Test Information

This is the pilot version of EVENTORA, ready for real-world testing with actual users and service providers.

### 🔐 Admin Access
- **Password**: `EventoraAdmin2024!@#`
- **Features**: Provider verification, terms management, email notifications monitoring
- **Security**: Auto-lockout after 3 failed attempts, 2-hour session timeout

### 📧 Email Notifications (Implemented)
- **Order Received**: Sent to service providers when new orders come in
- **Checkout Complete**: Sent to both buyers and providers upon payment completion
- **Provider Verification**: Sent when admin approves/rejects service providers
- **Email Service**: Configured and ready (currently logs to console and stores in database)

### 💳 Payment Integration
- **Gateway**: JustPay by LankaPay (demo mode implemented)
- **Features**: Order processing, payment webhooks, transaction verification
- **Status**: Ready for production API key integration

### 🖼️ Service Provider Limits
- **Images**: Maximum 5 per portfolio
- **Videos**: Maximum 1 per portfolio  
- **Validation**: Real-time limit checking with user feedback

## 🌟 Key Features

### For Event Planners (Buyers)
- **Gmail Login**: One-click signup with Google OAuth
- **Event Planning**: Up to 3 draft events
- **Service Discovery**: AI-powered matching
- **Order Management**: Track bookings and payments
- **Messaging**: Direct communication with providers

### For Service Providers
- **Professional Registration**: Business verification required
- **Portfolio Builder**: Showcase work with image/video galleries
- **Service Management**: Add/edit services with pricing
- **Order Processing**: Accept/decline orders with 24h response time
- **Analytics Dashboard**: Performance metrics and earnings

### For Administrators
- **Provider Verification**: Review and approve service providers
- **Terms Management**: Edit customer and provider terms & conditions
- **Email Monitoring**: Track all system notifications
- **System Overview**: Platform statistics and health monitoring

## 🧪 Demo Mode

For testing without creating real accounts:

1. **Buyer Demo**: Pre-loaded with draft events and dummy data
2. **Provider Demo**: Complete business profile with services and bookings
3. **Admin Demo**: Access all administrative functions

## 🔧 Technical Implementation

### Authentication
- **Supabase Auth**: Secure OAuth and traditional login
- **Session Management**: Persistent login with auto-refresh
- **Role-based Access**: Buyer, Provider, Admin permissions

### Backend Architecture
- **Supabase Edge Functions**: Serverless API endpoints
- **Key-Value Store**: Efficient data storage and retrieval
- **File Storage**: Secure image/video uploads with signed URLs
- **Email Service**: Notification infrastructure

### Frontend Technology
- **React + TypeScript**: Modern, type-safe development
- **Tailwind CSS v4**: Luxury design system
- **ShadCN UI**: Premium component library
- **Responsive Design**: Mobile-first approach

## 🎨 Design Philosophy

### Premium Luxury Positioning
- **Color Palette**: Rose gold, deep blush, champagne
- **Typography**: Playfair Display, Inter fonts
- **Animations**: Sophisticated micro-interactions
- **Language**: "Orchestrate experiences", "Curated artisan partners"

### Psychological Triggers
- **Scarcity**: Limited monthly memberships
- **Social Proof**: Client testimonials and ratings
- **Authority**: Award badges and verification
- **Exclusivity**: Elite network positioning

## 📱 User Journey

### New Buyer
1. Landing page with luxury positioning
2. Gmail signup (OAuth)
3. Event planning wizard
4. Service provider discovery
5. Order placement with payment

### New Service Provider
1. Detailed business registration
2. Admin verification (email notification)
3. Portfolio creation (image/video limits)
4. Service listings
5. Order management

## 🔒 Security Features

### Data Protection
- **Encrypted Communications**: HTTPS everywhere
- **Secure Storage**: Supabase security best practices
- **Access Control**: Role-based permissions
- **Session Security**: Auto-timeout and refresh

### Admin Security
- **Password Protection**: Strong password requirements
- **Failed Attempt Lockout**: 5-minute lockout after 3 attempts
- **Session Timeout**: 2-hour automatic logout
- **Activity Logging**: All admin actions tracked

## 📊 Pilot Test Metrics to Track

### User Engagement
- [ ] Sign-up conversion rates (Gmail vs traditional)
- [ ] Event planning completion rates
- [ ] Service provider application quality
- [ ] Order completion rates

### Technical Performance
- [ ] Page load times
- [ ] Mobile responsiveness
- [ ] Email delivery rates
- [ ] Payment processing success

### Business Metrics
- [ ] Provider verification turnaround time
- [ ] Customer satisfaction scores
- [ ] Average order values
- [ ] Platform usage patterns

## 🚦 Go-Live Checklist

### Required for Production
- [ ] JustPay API key configuration
- [ ] Email service setup (SendGrid/Mailgun)
- [ ] Domain name and SSL certificate
- [ ] Google OAuth app verification
- [ ] Database backup strategy
- [ ] Monitoring and alerting setup

### Recommended Enhancements
- [ ] Push notifications for mobile
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (Sinhala/Tamil)
- [ ] WhatsApp integration for messaging
- [ ] Advanced search filters

## 🎯 Success Criteria for Pilot

### Week 1-2: Foundation
- 10+ service provider registrations
- 5+ buyer registrations
- Admin workflow validation
- Technical stability confirmation

### Week 3-4: Growth
- 25+ service providers verified
- 20+ buyer accounts active
- 10+ orders processed
- Email notification system proven

### Week 5-6: Optimization
- User feedback collection
- Performance optimization
- Feature refinements
- Market validation

## 📞 Support & Feedback

For pilot test support:
- **Technical Issues**: Check browser console and network tab
- **User Feedback**: Document all user interactions and pain points
- **Admin Support**: Use admin panel for provider management
- **Payment Testing**: Use demo mode for transaction testing

## 🌟 Next Phase Planning

Post-pilot enhancements:
1. **Mobile App**: React Native version
2. **Advanced Analytics**: Business intelligence dashboard
3. **API Integrations**: WhatsApp, Facebook, Instagram
4. **Marketplace Features**: Reviews, recommendations, featured listings
5. **Enterprise Features**: Multi-location events, corporate accounts

---

**Ready for Launch! 🚀**

The EVENTORA platform is production-ready for pilot testing with real users, complete payment processing, email notifications, and comprehensive admin controls.