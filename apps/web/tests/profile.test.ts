import { describe, it, expect } from "vitest";
import {
  describeProfile,
  INITIAL_PROFILE,
  profileFromParams,
  profileKey,
  profileToParams,
} from "../src/lib/profile";

describe("profile utilities", () => {
  it("round-trips valid profiles through URLSearchParams", () => {
    const params = profileToParams(INITIAL_PROFILE);
    const parsed = profileFromParams(params);
    expect(parsed).toEqual(INITIAL_PROFILE);
    expect(profileKey(parsed!)).toBe(profileKey(INITIAL_PROFILE));
  });

  it("clamps out-of-range numeric URL params and rejects invalid enums", () => {
    const clamped = profileFromParams(
      new URLSearchParams("age=200&sex=female&bmi=5&children=-2&smoker=yes&region=northeast")
    );
    expect(clamped).toEqual({
      age: 100,
      sex: "female",
      bmi: 10.0,
      children: 0,
      smoker: "yes",
      region: "northeast",
    });

    expect(
      profileFromParams(
        new URLSearchParams("age=30&sex=invalid&bmi=24&children=0&smoker=no&region=northwest")
      )
    ).toBeNull();
    expect(profileFromParams(new URLSearchParams())).toBeNull();
  });

  it("describes profile attributes cleanly", () => {
    expect(describeProfile(INITIAL_PROFILE)).toEqual([
      "Age 35",
      "Male",
      "BMI 26.5",
      "0 children",
      "Non-smoker",
      "Northwest",
    ]);
  });
});

