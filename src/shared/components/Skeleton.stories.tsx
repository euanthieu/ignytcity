import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "@/shared/components/Skeleton";

const meta = {
  title: "Shared/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A loading placeholder used to represent content before it loads. Apply width/height via `className`.",
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: { className: "h-4 w-48" },
};

export const Avatar: Story = {
  args: { className: "h-12 w-12 rounded-full" },
};

export const Card: Story = {
  args: { className: "h-32 w-full rounded-2xl" },
};

export const UserRow: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4 rounded-2xl glass-light border border-white/5 w-96">
      <Skeleton className="h-12 w-12 rounded-full shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  ),
  name: "User Row (Composite)",
};
