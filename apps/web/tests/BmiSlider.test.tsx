import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BmiSlider } from "../src/components/BmiSlider";

describe("BmiSlider Component", () => {
  it("allows typing decimal BMI values cleanly without erasing trailing dot or prematurely clamping", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();

    render(<BmiSlider value={26.5} onChange={onChange} />);
    const input = screen.getByLabelText("Numeric Body Mass Index") as HTMLInputElement;

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "2" } });
    expect(input.value).toBe("2");
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "28." } });
    expect(input.value).toBe("28.");
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "28.4" } });
    expect(input.value).toBe("28.4");

    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(onChange).toHaveBeenCalledWith(28.4);

    vi.useRealTimers();
  });

  it("clamps and formats BMI on Enter and updates immediately from range slider", () => {
    const onChange = vi.fn();
    render(<BmiSlider value={26.5} onChange={onChange} />);

    const input = screen.getByLabelText("Numeric Body Mass Index") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "75" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(60);
    expect(input.value).toBe("60.0");

    const slider = screen.getByLabelText("BMI Range Slider") as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "23.2" } });
    expect(onChange).toHaveBeenCalledWith(23.2);
  });
});

