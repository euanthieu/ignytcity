import type { Preview } from "@storybook/react";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    // ── Backgrounds ──────────────────────────────────────────────────────────
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#020617" },
        { name: "light", value: "#ffffff" },
        { name: "mid", value: "#0f172a" },
      ],
    },

    // ── Actions ───────────────────────────────────────────────────────────────
    actions: { argTypesRegex: "^on[A-Z].*" },

    // ── Controls ──────────────────────────────────────────────────────────────
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // ── Layout ────────────────────────────────────────────────────────────────
    layout: "padded",
  },

  // Apply .dark class to the body for all stories by default
  decorators: [
    (Story) => (
      <div className="dark bg-background-primary text-text-primary p-6 min-h-screen">
        <Story />
      </div>
    ),
  ],
};

export default preview;
