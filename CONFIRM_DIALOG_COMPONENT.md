# Custom Confirmation Dialog

## Overview
Replaced the browser's default `confirm()` dialog with a custom, styled confirmation modal that matches the application's design.

## Component: ConfirmDialog

### Location
`frontend/src/components/ui/ConfirmDialog.jsx`

### Features
- ✅ **Custom Styling** - Matches app theme with colors, shadows, and animations
- ✅ **Configurable** - Customizable title, message, button text, and colors
- ✅ **Icons** - Optional icon support for visual context
- ✅ **Loading State** - Shows "Processing..." during async operations
- ✅ **Animations** - Smooth fade-in and zoom-in effects
- ✅ **Backdrop** - Semi-transparent overlay to focus attention

### Props
```javascript
{
  isOpen: boolean,              // Controls visibility
  onClose: function,            // Called when cancelled
  onConfirm: function,          // Called when confirmed
  title: string,                // Dialog title (default: "Confirm Action")
  message: string,              // Dialog message
  confirmText: string,          // Confirm button text (default: "Confirm")
  cancelText: string,           // Cancel button text (default: "Cancel")
  confirmColor: string,         // Color theme: blue, green, red, orange
  icon: ReactNode,              // Optional icon element
  loading: boolean              // Shows loading state
}
```

### Color Themes
- **Blue** - For approval/confirmation actions
- **Green** - For success/proceed actions
- **Red** - For delete/destructive actions
- **Orange** - For warning/caution actions

## Implementation in BillView

### Usage
```javascript
// State
const [showApproveConfirm, setShowApproveConfirm] = useState(false);

// Button triggers dialog
<Button onClick={() => setShowApproveConfirm(true)}>
  Approve Claim
</Button>

// Dialog component
<ConfirmDialog
  isOpen={showApproveConfirm}
  onClose={() => setShowApproveConfirm(false)}
  onConfirm={handleApprove}
  title="Approve Claim"
  message="Are you sure you want to approve this claim?"
  confirmText="Yes, Approve"
  confirmColor="blue"
  loading={processing}
  icon={<CheckCircleIcon />}
/>
```

### Workflow
1. User clicks "Approve Claim" button
2. Custom confirmation dialog appears with:
   - Blue checkmark icon
   - Clear title and message
   - "Yes, Approve" and "Cancel" buttons
3. User confirms → `handleApprove()` executes
4. During processing, dialog shows "Processing..." state
5. On success/error, dialog closes and toast appears

## Benefits Over window.confirm()
1. **Better UX** - Non-blocking, styled to match app
2. **More Context** - Can show icons, detailed messages
3. **Loading States** - Shows processing feedback
4. **Customizable** - Full control over appearance
5. **Accessible** - Better keyboard and screen reader support
6. **Professional** - Modern, polished appearance

## Future Enhancements
- Add to other critical actions (delete, reject, etc.)
- Add warning/danger variants with red theme
- Add optional checkbox for "Don't ask again"
- Add custom footer content support
