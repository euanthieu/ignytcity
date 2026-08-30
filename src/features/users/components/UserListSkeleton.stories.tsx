import type { Meta, StoryObj } from "@storybook/react";
import { UserListSkeleton } from "@/features/users/components/UserListSkeleton";

const meta = {
  title: "Features/Users/UserListSkeleton",
  component: UserListSkeleton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Shown while the users list is loading. Renders 5 placeholder rows to prevent layout shift.",
      },
    },
    layout: "fullscreen",
  },
} satisfies Meta<typeof UserListSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
