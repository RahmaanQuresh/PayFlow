import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/shared/status-badge";

describe("StatusBadge", () => {
  it("renders the status text", () => {
    render(<StatusBadge status="paid" />);
    expect(screen.getByText("paid")).toBeInTheDocument();
  });

  it("replaces underscores with spaces", () => {
    render(<StatusBadge status="partially_paid" />);
    expect(screen.getByText("partially paid")).toBeInTheDocument();
  });

  it("renders unknown status with ghost variant", () => {
    render(<StatusBadge status="unknown_status" />);
    expect(screen.getByText("unknown status")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<StatusBadge status="sent" className="custom-badge" />);
    const badge = screen.getByText("sent");
    expect(badge.className).toContain("custom-badge");
  });
});
