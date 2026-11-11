import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { NumberStepper } from "../src/components/NumberStepper";

describe("NumberStepper Component", () => {
  it("allows typing multi-digit values without premature min-clamping and commits via debounce or blur", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();

    render(<NumberStepper id="age" label="Age" value={35} min={18} max={100} onChange={onChange} />);

    const input = screen.getByLabelText("Age") as HTMLInputElement;
    fireEvent.focus(input);

    // Clear and type first digit "4" (below min 18) -> should remain "4" without clamping to 18
    fireEvent.change(input, { target: { value: "4" } });
    expect(input.value).toBe("4");
    expect(onChange).not.toHaveBeenCalled();

    // Type second digit "2" -> "42"
    fireEvent.change(input, { target: { value: "42" } });
    expect(input.value).toBe("42");

    // Debounce commits settled in-range value automatically
    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(onChange).toHaveBeenCalledWith(42);

    vi.useRealTimers();
  });

  it("clamps out-of-range input and restores empty input on blur", () => {
    const onChange = vi.fn();
    render(<NumberStepper id="age" label="Age" value={35} min={18} max={100} onChange={onChange} />);

    const input = screen.getByLabelText("Age") as HTMLInputElement;
    fireEvent.focus(input);

    // Out-of-range value clamps on blur
    fireEvent.change(input, { target: { value: "150" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(100);
    expect(input.value).toBe("100");

    // Empty input restores current prop value on blur
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);
    expect(input.value).toBe("35");
  });

  it("supports stepper buttons immediately", () => {
    const onChange = vi.fn();
    render(<NumberStepper id="children" label="Children" value={1} min={0} max={10} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Increase Children"));
    expect(onChange).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByLabelText("Decrease Children"));
    expect(onChange).toHaveBeenCalledWith(0);
  });
});

