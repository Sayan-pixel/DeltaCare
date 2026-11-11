import React, { useState } from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DemographicsForm } from "../src/components/DemographicsForm";
import { INITIAL_PROFILE } from "../src/lib/profile";
import { QuoteRequest } from "../src/types/quote";

function FormHarness({ initial = INITIAL_PROFILE }: { initial?: QuoteRequest }) {
  const [values, setValues] = useState<QuoteRequest>(initial);
  return (
    <DemographicsForm
      values={values}
      onChange={setValues}
      onSubmit={(e) => e.preventDefault()}
      isLoading={false}
    />
  );
}

describe("DemographicsForm Component", () => {
  it("supports undoing an accidental preset selection and resetting back to default", () => {
    const customInitial: QuoteRequest = { ...INITIAL_PROFILE, age: 47, children: 2 };
    render(<FormHarness initial={customInitial} />);

    // Reset button is visible because profile differs from INITIAL_PROFILE
    expect(screen.getByRole("button", { name: /Reset/i })).toBeDefined();
    expect(screen.queryByRole("button", { name: /Undo preset/i })).toBeNull();

    // Selecting a preset exposes "Undo preset" and restores previous custom profile
    fireEvent.click(screen.getByRole("button", { name: /Family of 4/i }));
    const undoBtn = screen.getByRole("button", { name: /Undo preset/i });
    fireEvent.click(undoBtn);

    expect((screen.getByLabelText("Age") as HTMLInputElement).value).toBe("47");
    expect((screen.getByLabelText("Dependent children") as HTMLInputElement).value).toBe("2");

    // Clicking Reset returns to INITIAL_PROFILE (Age 35)
    fireEvent.click(screen.getByRole("button", { name: /Reset/i }));
    expect((screen.getByLabelText("Age") as HTMLInputElement).value).toBe(
      String(INITIAL_PROFILE.age)
    );
    expect(screen.queryByRole("button", { name: /Reset/i })).toBeNull();
  });
});

