import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="No items" description="Nothing to show here." />);
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("Nothing to show here.")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(
      <EmptyState
        icon={<FileText data-testid="empty-icon" />}
        title="Empty"
        description="No data"
      />
    );
    expect(screen.getByTestId("empty-icon")).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        title="Empty"
        description="No data"
        action={<button>Add Item</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Add Item" })).toBeInTheDocument();
  });

  it("does not render action when not provided", () => {
    render(<EmptyState title="Empty" description="No data" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
