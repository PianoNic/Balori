# Gap Analysis: M335 Course Requirements vs. Balori Codebase

Focus on Topic 5 (React Native) and Topic 6 (Testing).

---

## Topic 5 — React Native

### Already Covered

| Requirement | Evidence |
|---|---|
| **Setup** (Node, Expo Go, GitHub) | Expo SDK 54 project, GitHub repo with CI workflow |
| **File-based routing** (Expo Router) | `app/` directory with `(tabs)/_layout.tsx`, `(pages)/` group |
| **React Navigation integration** | Tab bar uses `@react-navigation/native` CommonActions + `react-native-paper` BottomNavigation |
| **Core Components & APIs** | ScrollView, View, Pressable, StyleSheet, Animated, useWindowDimensions throughout |
| **Expo SDK sensors/actuators** | Camera via `expo-camera` (barcode scanning) |
| **UI component library** | `react-native-paper` (Text, Button, Dialog, FAB, Card, Surface, Portal, etc.) |
| **Data persistence** | `@react-native-async-storage/async-storage` in `services/storage.ts` |
| **Third-party libraries** | `react-native-gesture-handler` (Swipeable), `react-native-safe-area-context`, `@expo/vector-icons` |
| **Production build / EAS** | `.github/workflows/build-apk.yml` builds APK on release |

### Gaps / Needs Work

| Requirement | Status |
|---|---|
| **Library documentation** | Course asks to document which libraries are used and why. No such document exists in the repo. Needed for the project documentation (LB 3). |
| **EAS account + deploy** | The CI builds via `expo-doctor` and EAS, but there is no evidence of a personal EAS account setup or an `eas.json` with a production profile for manual deploy. Verify this is in place. |

---

## Topic 6 — Testing

### Already Covered

Nothing. The project has **zero tests**. No Jest config, no `@testing-library/react-native`, no test files outside `node_modules/`.

### Gaps (All Are Blockers)

| Requirement | What Is Needed |
|---|---|
| **Jest setup** | Install `jest`, `jest-expo`, `@testing-library/react-native`. Add Jest config to `package.json` or `jest.config.js`. |
| **Unit tests (min. 2 per person)** | Good candidates: `mappers/product-mapper.ts` (pure function, easy to unit-test), `services/storage.ts` (mock AsyncStorage), helper logic like `computeStreak` in `trend.tsx` (extract and test). |
| **Snapshot test (min. 1 per person)** | Good candidates: `ProgressCircle`, `MealCard`, `Calendar` -- small presentational components. |
| **E2E test concept** | Course requires a written E2E test concept (test object, environments, test cases) -- not necessarily executed code, but the document must exist for LB 3. |

---

## Summary

Topic 5 is in strong shape -- the app uses Expo Router, react-native-paper, camera, AsyncStorage, gestures, and has a CI pipeline. The only minor gap is a library-choice document for the project documentation.

Topic 6 is a complete gap. No testing infrastructure exists. Priority actions:

1. Set up Jest + jest-expo + testing-library.
2. Write unit tests for `product-mapper` and extracted pure functions.
3. Write snapshot tests for at least one presentational component.
4. Draft an E2E test concept document.
