// ============================================================================
// 1. UI ATOM ELEMENTS
// ============================================================================
export * from "./ui/Card";
export * from "./ui/BackButton";
export * from "./ui/ClearFormButton";
export * from "./ui/Grid";
export * from "./ui/PageHeader";
export * from "./ui/StatusPill";
export * from "./Skeleton";

// Temporarily bypassed atom blocks to keep the build safe during migration
// export * from "./ui/Snackbar";
// export * from "./ui/NotificationProvider";
// export * from "./ui/FormField";

// ============================================================================
// 2. STRUCTURAL LAYOUTS
// ============================================================================
export { SellerLayout } from "./layout/SellerLayout";
export { Sidebar } from "./layout/Sidebar";

// ============================================================================
// 3. BUSINESS FEATURES LAYER
// ============================================================================
// 🔥 REMOVED: Feature-specific elements have been safely decoupled from here.
// They now live isolated inside their own public feature modules:
// - Login flow -> @/features/auth
// - Onboarding and Mapbox nodes -> @/features/stores
