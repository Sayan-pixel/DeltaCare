import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResultActions } from "../src/components/ResultActions";
import { QuoteRequest, QuoteResponse } from "../src/types/quote";

const MOCK_PROFILE: QuoteRequest = {
  age: 35,
  sex: "male",
  bmi: 26.5,
  children: 0,
  smoker: "no",
  region: "northwest",
};

const MOCK_QUOTE: QuoteResponse = {
  predicted_annual: 4350,
  predicted_monthly: 362.5,
  confidence_margin_annual: 1645.52,
  confidence_margin_monthly: 137.13,
  range_annual: [2704.48, 5995.52],
  range_monthly: [225.37, 499.63],
  currency: "USD",
};

describe("ResultActions Component", () => {
  it("keeps pin button enabled when already pinned so user can unpin", () => {
    const onPin = vi.fn();
    render(
      <ResultActions
        profile={MOCK_PROFILE}
        quote={MOCK_QUOTE}
        isPinned={true}
        canPin={true}
        pinLabel="Unpin"
        onPin={onPin}
      />
    );

    const button = screen.getByRole("button", { name: /Unpin/i });
    expect((button as HTMLButtonElement).disabled).toBe(false);
    expect(button.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(button);
    expect(onPin).toHaveBeenCalledTimes(1);
  });
});

