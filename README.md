# BillAdvocate 🏥⚖️

> **Medical Billing Defense & Patient Advocacy Platform**  
> Accessible, localized mobile app empowering patients to audit hospital bills against regional fair-cash benchmarks and generate dual-track dispute packages with one click.

---

## Key Features

- **Direction 1 UI (Spectrum Meters & Cheaper Nearby)**: Clear visual comparison bars for price multipliers against median cash and regional benchmarks, paired with localized clinic and online pharmacy alternatives.
- **Multilingual & RTL Support**: First-class support for English, Hindi (हिंदी), Tamil (தமிழ்), and Urdu (اردو with RTL).
- **Zero Redundant UI**: Built exclusively using primitives from `@amitsingh0880/cnnative-ui` (`ComparisonMeter`, `ComparisonRow`, `DocumentScrubber`, `Card`, `Badge`, `Button`, `Separator`, etc.).
- **Dual-Track Dispute Generator**: Automated drafting of:
  1. Formal Hospital Dispute & Itemized Billing Demand (citing Surprise Billing & No Surprises Act protections).
  2. Provider Financial Hardship Reduction Application.
- **Offline-First Guest Mode**: Embedded local SQLite repository with zero mandatory account creation or tracking.
- **Multi-Page Document Scanner**: Page scrubbing and reordering engine powered by `DocumentScrubber`.

---

## Tech Stack

- **Framework**: Expo React Native (SDK 52)
- **Component Library**: `@amitsingh0880/cnnative-ui`
- **Styling**: NativeWind & Tailwind CSS
- **Animations**: React Native Reanimated
- **Database**: `expo-sqlite` (Local-first storage)
- **Document Generation**: `expo-print` & `expo-sharing`
- **Testing**: Jest & React Native Testing Library (10/10 test suites, 35 unit & integration tests)

---

## Getting Started

### Prerequisites

- Node.js >= 20
- npm / pnpm

### Installation

```bash
cd bill-advocate
npm install
```

### Running Locally

```bash
# Start Expo development server (Web, iOS, Android)
npm start

# Or start directly for web
npm run web
```

### Running Tests

```bash
# Run unit and integration tests
npm test

# Run TypeScript typecheck
npx tsc --noEmit
```

---

## License

MIT
