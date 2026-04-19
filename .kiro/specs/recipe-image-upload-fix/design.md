# Recipe Image Upload Fix - Bugfix Design

## Overview

This bugfix addresses an API path configuration error in the RecipeEdit component that prevents users from uploading recipe cover images. The issue occurs because the frontend calls `/api/upload` while the backend endpoint is actually located at `/api/recipes/upload`, resulting in HTTP 405 Method Not Allowed errors. The fix involves updating the API path in `src/lib/api.js` to match the actual backend endpoint location.

**Impact**: All recipe image upload scenarios (both creating new recipes and editing existing ones)

**Fix Strategy**: Update the frontend API path from `/api/upload` to `/api/recipes/upload` to align with the backend endpoint structure

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when the upload API path is incorrectly configured as `/api/upload`
- **Property (P)**: The desired behavior - successful image upload using the correct path `/api/recipes/upload` with HTTP 201 response
- **Preservation**: Existing validation logic, error handling, UI interactions, and file type/size checks that must remain unchanged
- **uploadApi.image**: The function in `src/lib/api.js` that handles image upload requests
- **onFileChange**: The event handler in `src/views/RecipeEdit.vue` that processes file selection and triggers upload
- **R2_PUBLIC_URL**: The Cloudflare R2 public domain used by the backend to construct image URLs

## Bug Details

### Bug Condition

The bug manifests when a user selects an image file in the RecipeEdit component. The `uploadApi.image` function constructs the upload request using an incorrect API path `/api/upload`, which does not match the actual backend endpoint at `/api/recipes/upload`. This causes the Cloudflare Pages Functions router to return HTTP 405 Method Not Allowed, as no handler exists at the requested path.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type UploadRequest
  OUTPUT: boolean
  
  RETURN input.apiPath = "/api/upload"
         AND input.method = "POST"
         AND input.hasValidImageFile = true
         AND backendEndpointExists("/api/recipes/upload")
         AND NOT backendEndpointExists("/api/upload")
END FUNCTION
```

### Examples

- **Example 1**: User selects a valid JPEG file (2MB) → Frontend calls `POST /api/upload` → Backend returns 405 → User sees error "the string did not match the expected pattern"
- **Example 2**: User selects a valid PNG file (1.5MB) → Frontend calls `POST /api/upload` → Backend returns 405 → Upload fails, cover field remains empty
- **Example 3**: User selects a valid WebP file (800KB) → Frontend calls `POST /api/upload` → Backend returns 405 → Error toast displayed
- **Edge Case**: User selects a 6MB file → Frontend validation catches size error BEFORE API call → Shows "图片不能超过 5MB" (correct behavior, unaffected by bug)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Frontend validation for file type (must be image/jpeg, image/png, image/webp, or image/gif) must continue to work
- Frontend validation for file size (must be ≤ 5MB) must continue to work
- Success toast message "上传成功 ✓" must continue to display after successful upload
- Image preview display after upload must continue to work
- "更换图片" (replace image) and "移除" (remove) buttons must continue to function
- Form validation requiring cover image must continue to work
- Upload progress indicator (uploading state) must continue to display during upload

**Scope:**
All inputs that do NOT involve the API path configuration should be completely unaffected by this fix. This includes:
- File selection UI interactions (clicking picker, file input change events)
- Frontend validation logic (file type and size checks)
- Error handling for non-405 errors (network errors, server errors, etc.)
- Form state management (cover field updates, uploading flag)
- UI state transitions (empty state, preview state, uploading state)

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is:

1. **API Path Mismatch**: The frontend `uploadApi.image` function in `src/lib/api.js` uses the path `/api/upload`
   - Line 48: `const res = await fetch(\`${BASE}/upload\`, { ... })`
   - This constructs the URL as `/api/upload`
   - However, the backend endpoint is located at `functions/api/recipes/upload.js`
   - Cloudflare Pages Functions maps this file to `/api/recipes/upload`

2. **Incorrect BASE Path Concatenation**: The code uses `${BASE}/upload` where BASE is `/api`
   - Should be `${BASE}/recipes/upload` to match the backend file structure
   - The `/recipes/` segment is missing from the frontend path

3. **No Fallback or Redirect**: The backend does not have a handler at `/api/upload`
   - No redirect from `/api/upload` to `/api/recipes/upload`
   - Results in 405 Method Not Allowed instead of 404 Not Found

4. **Misleading Error Message**: The error message "the string did not match the expected pattern" does not clearly indicate the 405 error
   - This is likely a generic error message from the JSON parsing or response handling
   - The actual HTTP 405 status is not surfaced to the user

## Correctness Properties

Property 1: Bug Condition - Correct API Path Usage

_For any_ upload request where a valid image file is selected and the API path is currently `/api/upload`, the fixed uploadApi.image function SHALL call the correct endpoint `/api/recipes/upload`, receive HTTP 201 response, and successfully return the image URL and key.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Frontend Validation and UI Behavior

_For any_ upload scenario that does NOT involve the API path (file type validation, file size validation, UI state management, error handling for non-path-related errors), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing validation logic, error messages, and UI interactions.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/lib/api.js`

**Function**: `uploadApi.image`

**Specific Changes**:
1. **Update API Path**: Change the fetch URL from `/api/upload` to `/api/recipes/upload`
   - Line 48: Change `${BASE}/upload` to `${BASE}/recipes/upload`
   - This aligns the frontend path with the backend endpoint location

2. **Verify Error Handling**: Ensure error messages properly surface HTTP status codes
   - Line 52: The existing error handling `throw new Error(data.error || \`上传失败 HTTP ${res.status}\`)` should correctly display 405 errors
   - No changes needed if the error message is already adequate

3. **No Backend Changes Required**: The backend endpoint at `functions/api/recipes/upload.js` is correctly implemented
   - Validates file type and size
   - Uploads to R2 with proper key generation
   - Returns correct response format `{ ok: true, data: { url, key } }`

4. **No Component Changes Required**: The `RecipeEdit.vue` component correctly calls `uploadApi.image(file)`
   - The component does not need to know about the API path
   - All validation and error handling logic remains unchanged

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate file upload with valid images and observe the API path being called. Run these tests on the UNFIXED code to observe 405 failures and confirm the path mismatch.

**Test Cases**:
1. **Valid JPEG Upload Test**: Select a valid JPEG file (2MB) and trigger upload (will fail with 405 on unfixed code)
2. **Valid PNG Upload Test**: Select a valid PNG file (1.5MB) and trigger upload (will fail with 405 on unfixed code)
3. **Valid WebP Upload Test**: Select a valid WebP file (800KB) and trigger upload (will fail with 405 on unfixed code)
4. **Network Inspection Test**: Use browser DevTools to observe the actual request URL being `/api/upload` instead of `/api/recipes/upload` (will confirm path mismatch on unfixed code)

**Expected Counterexamples**:
- HTTP 405 Method Not Allowed responses when calling `/api/upload`
- Network tab shows requests to `/api/upload` instead of `/api/recipes/upload`
- Possible causes: incorrect path concatenation in `uploadApi.image`, missing `/recipes/` segment

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := uploadApi.image_fixed(input.file)
  ASSERT result.url IS NOT NULL
  ASSERT result.url STARTS_WITH R2_PUBLIC_URL
  ASSERT result.key STARTS_WITH "recipes/"
  ASSERT httpStatusCode = 201
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT uploadApi.image_original(input) = uploadApi.image_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for validation errors and UI interactions, then write property-based tests capturing that behavior.

**Test Cases**:
1. **File Type Validation Preservation**: Observe that selecting non-image files shows "请选择图片文件" on unfixed code, then verify this continues after fix
2. **File Size Validation Preservation**: Observe that selecting >5MB files shows "图片不能超过 5MB" on unfixed code, then verify this continues after fix
3. **Success Message Preservation**: Observe that successful uploads (if we manually fix the path temporarily) show "上传成功 ✓" on unfixed code, then verify this continues after fix
4. **UI State Preservation**: Observe that uploading state, preview display, and button interactions work correctly on unfixed code (for non-upload scenarios), then verify these continue after fix

### Unit Tests

- Test that `uploadApi.image` constructs the correct URL `/api/recipes/upload`
- Test that valid image files (JPEG, PNG, WebP, GIF) are successfully uploaded
- Test that the response contains valid `url` and `key` fields
- Test that HTTP 201 status is returned on success
- Test that frontend validation catches invalid file types before API call
- Test that frontend validation catches oversized files before API call
- Test error handling for network errors, server errors, and malformed responses

### Property-Based Tests

- Generate random valid image files (varying sizes, types) and verify all uploads succeed with correct API path
- Generate random invalid inputs (non-image files, oversized files) and verify frontend validation catches them before API call
- Generate random upload scenarios and verify UI state transitions (uploading → success/error) work correctly
- Test that all error paths (validation errors, network errors, server errors) display appropriate messages

### Integration Tests

- Test full upload flow: select file → validate → upload → display preview → save recipe
- Test upload in "new recipe" context and "edit recipe" context
- Test replacing an existing cover image with a new one
- Test removing a cover image and re-uploading
- Test form validation requiring cover image when submitting without upload
- Test that uploaded images are correctly saved to R2 and accessible via public URL
