# CLAUDE.md Template: Mobile Development

**Project Type**: Native & Hybrid Mobile Applications
**Framework**: {{FRAMEWORK}} (iOS/Android/React Native/Flutter)
**Technology Stack**: {{TECH_STACK}}

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**Mobile development requires specialized agents:**

1. **iOS Specialist**: Swift/Objective-C development
2. **Android Specialist**: Kotlin/Java development
3. **React Native Specialist**: Cross-platform development
4. **DevOps/Mobile DevOps**: Build optimization and release

### Initialization

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized

# Spawn platform-specific agents
npx @claude-flow/cli@latest agent spawn -t coder --name ios-specialist --capabilities "swift,xcode,ios,cocoapods"
npx @claude-flow/cli@latest agent spawn -t coder --name android-specialist --capabilities "kotlin,gradle,android-studio"
npx @claude-flow/cli@latest agent spawn -t coder --name mobile-qa --capabilities "appium,detox,mobile-testing"
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Platforms**: {{PLATFORMS}} (iOS/Android/Cross-platform)
- **Target OS Versions**: iOS {{IOS_MIN}}, Android {{ANDROID_MIN}}
- **Package Manager**: {{PACKAGE_MANAGER}} (CocoaPods/Gradle/npm)
- **Backend API**: {{API_ENDPOINT}}

## 🔧 Development Patterns & Standards

### Project Structure - React Native
```
mobile/
├── src/
│   ├── screens/        # Screen components
│   ├── components/     # Reusable components
│   ├── navigation/     # Navigation configuration
│   ├── services/       # API services
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utility functions
│   ├── assets/         # Images, fonts
│   └── types/          # TypeScript types
├── ios/                # iOS native code
├── android/            # Android native code
├── tests/              # Test suites
└── package.json
```

### iOS Project Structure
```
ios/
├── {{PROJECT_NAME}}/
│   ├── ViewControllers/
│   ├── Models/
│   ├── Services/
│   ├── Utilities/
│   └── Resources/
├── {{PROJECT_NAME}}Tests/
└── Podfile
```

### Android Project Structure
```
android/
├── app/
│   └── src/
│       ├── main/
│       │   ├── java/
│       │   ├── res/
│       │   └── AndroidManifest.xml
│       ├── test/
│       └── androidTest/
└── build.gradle
```

## 🐝 Swarm Orchestration

### Phase 1: Architecture & Design
- **Duration**: 2-3 days
- **Agents**: Mobile Architect, Platform Specialists
- **Output**: UI mockups, API contracts, navigation flow

### Phase 2: Platform-Specific Development
- **Duration**: 10-15 days per platform
- **Agents**: iOS Specialist, Android Specialist (parallel)
- **Focus**: Native features, performance optimization, platform guidelines

### Phase 3: Feature Development
- **Duration**: 10-20 days
- **Agents**: Cross-platform team
- **Focus**: Business logic, integrations, offline support

### Phase 4: Testing & QA
- **Duration**: 5-10 days
- **Agents**: Mobile QA, Platform Specialists
- **Focus**: Unit tests, integration tests, device testing

### Phase 5: Release & Deployment
- **Duration**: 3-5 days
- **Agents**: Mobile DevOps, Release Manager
- **Focus**: App Store/Play Store submission, beta testing

## 🧠 Memory Management

### Store Platform-Specific Patterns
```bash
npx @claude-flow/cli@latest memory store --key "ios-patterns-{{PROJECT_NAME}}" \
  --value "Swift patterns, lifecycle management, native APIs" \
  --namespace mobile --tags "ios,{{PROJECT_NAME}}"

npx @claude-flow/cli@latest memory store --key "android-patterns-{{PROJECT_NAME}}" \
  --value "Kotlin patterns, lifecycle management, native APIs" \
  --namespace mobile --tags "android,{{PROJECT_NAME}}"
```

### Store Navigation Patterns
```bash
npx @claude-flow/cli@latest memory store --key "navigation-patterns-{{FRAMEWORK}}" \
  --value "Tab navigation, stack navigation, deep linking" \
  --namespace patterns --tags "mobile,navigation"
```

## 🚀 Build & Deployment

### iOS Build Pipeline
```bash
# Pod installation
pod install

# Build for simulator
xcodebuild -scheme {{PROJECT_NAME}} -configuration Debug -destination 'platform=iOS Simulator'

# Build for device
xcodebuild -scheme {{PROJECT_NAME}} -configuration Release

# Archive and sign
xcodebuild -scheme {{PROJECT_NAME}} -archivePath build/{{PROJECT_NAME}}.xcarchive archive
xcodebuild -exportArchive -archivePath build/{{PROJECT_NAME}}.xcarchive \
  -exportOptionsPlist ExportOptions.plist -exportPath build/ipa
```

### Android Build Pipeline
```bash
# Debug build
./gradlew assembleDebug

# Release build
./gradlew assembleRelease

# Bundle for Play Store
./gradlew bundleRelease

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore {{KEYSTORE_PATH}} app/build/outputs/apk/release/app-release-unsigned.apk \
  {{KEY_ALIAS}}
```

### React Native Build
```bash
# iOS build
cd ios && pod install && cd ..
xcodebuild -workspace ios/{{PROJECT_NAME}}.xcworkspace -scheme {{PROJECT_NAME}} -configuration Release

# Android build
cd android && ./gradlew assembleRelease && cd ..
```

## 📊 Monitoring & Analytics

### Crash Reporting
- Firebase Crashlytics
- Sentry
- Bugsnag

### Performance Monitoring
- App startup time
- Memory usage
- Battery consumption
- Network requests

### Analytics
- User sessions
- Feature usage
- Conversion funnels
- Retention metrics

## 🔒 Security & Compliance

### Data Security
- Keychain/Keystore for sensitive data
- TLS/SSL for network requests
- Code signing certificates
- App signing keys management

### Platform Guidelines Compliance
- App Store Review Guidelines
- Google Play Policies
- GDPR compliance
- CCPA compliance

### Permission Management
- Minimal permission requests
- Runtime permission handling
- Privacy policy compliance

## ✅ Testing Strategy

### Unit Testing
```
tests/
├── unit/
│   ├── services/
│   ├── utils/
│   └── hooks/
├── integration/
│   └── navigation/
├── e2e/
│   └── scenarios/
└── fixtures/
```

### Device Testing
- iPhone/iPad multiple screen sizes
- Android multiple devices and versions
- Tablet compatibility
- Orientation changes
- Low-end device performance

### Test Coverage Targets
- Unit test coverage: 70%+
- Integration test coverage: 50%+
- Critical user flows: 100% E2E coverage

## 🎯 Performance Targets

- App startup time: <2s (cold start)
- Frame rate: 60 FPS (smooth scrolling)
- Memory usage: <100MB normal operation
- Battery drain: <5% per hour
- Network requests: <1s average

## 📋 Development Checklist

- [ ] Project template initialized
- [ ] Development environment configured (Xcode/Android Studio)
- [ ] Git repository and CI/CD set up
- [ ] Navigation structure implemented
- [ ] Authentication system configured
- [ ] API integration layer created
- [ ] Core screens implemented
- [ ] Offline support (if required)
- [ ] Testing framework configured
- [ ] Crash reporting configured
- [ ] Analytics configured
- [ ] Performance profiling done
- [ ] Security audit completed
- [ ] Store submission preparation

---

**Generated from**: claude-flow CLAUDE.md Mobile Development Template
