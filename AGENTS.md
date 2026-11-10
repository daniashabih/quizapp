# Global Development Rule: Implement All Changes on Both Web and Mobile

Whenever any new feature, update, modification, bug fix, UI improvement, or functionality change is requested in the Hangbug project, you must consider and implement it on **BOTH** platforms:

1. **Web Application:** React.js frontend hosted on Vercel (`src/`, `api/`).
2. **Mobile Application:** Flutter/Dart Android application (`mobile/`).

## Mandatory Rules

### 1. Cross-Platform Implementation
- Every new feature must be evaluated for both Web and Mobile.
- Implement the same core functionality on both platforms.
- If a UI change is requested, apply an equivalent, platform-appropriate design to both.
- If a bug fix is requested, investigate and fix the issue on both platforms where applicable.
- Never assume that a requested change is only for Web or Mobile unless explicitly specified by the user.

### 2. Backend and Database Consistency
- Continue using the existing MERN backend, MongoDB Atlas, and existing Vercel APIs (`api/`).
- Reuse existing APIs and database models wherever possible.
- Both Web and Mobile must use the same backend APIs and data source.
- Ensure data synchronization between both platforms.
- Avoid duplicate database collections, APIs, or unnecessary backend logic.

### 3. UI and User Experience
- Maintain consistent Hangbug branding, colors, typography, features, and overall design language.
- Web UI should be responsive and optimized for desktop and mobile browsers.
- Flutter UI should follow native Android design practices.
- Adapt layouts according to each platform instead of blindly copying the same layout.
- Maintain consistent functionality and user experience across both platforms.

### 4. Authentication and User Data
- Keep login, signup, Google authentication, password reset, and session management consistent.
- Users should be able to access their accounts and synchronized data on both platforms.
- Ensure user permissions and authentication security remain intact.

### 5. Testing Before Completion
After every requested change:
- Check the Web implementation.
- Check the Flutter Mobile implementation.
- Verify backend/API compatibility.
- Verify MongoDB data consistency.
- Check for errors and dependency conflicts.
- Ensure existing features are not broken.
- Run relevant Web and Flutter tests/build checks where possible.

### 6. Project Safety
- Never remove existing features without explicit user permission.
- Never introduce dummy data when real database data is expected.
- Do not unnecessarily change existing APIs, database schemas, authentication, or project architecture.
- Preserve existing functionality and resolve conflicts carefully.

### 7. Final Implementation Report
After completing every task, provide:
- Web changes implemented.
- Mobile changes implemented.
- Backend/database changes, if any.
- Files modified.
- Testing results.
- Any remaining issues or manual steps.

## Most Important Rule

**ONE REQUEST = BOTH WEB + MOBILE IMPLEMENTATION.**

Treat Hangbug as one unified cross-platform product, not two separate projects. Automatically inspect the relevant Web and Flutter codebases and implement the requested changes on both platforms wherever applicable without asking repeatedly whether changes are wanted on both Web and Mobile.
