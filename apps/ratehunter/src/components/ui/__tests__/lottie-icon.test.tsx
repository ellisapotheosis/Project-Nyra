import { render } from "@testing-library/react";
import { LottieIcon } from "../lottie-icon";

jest.mock("lottie-react", () => ({
  __esModule: true,
  default: ({ "aria-label": label }: { "aria-label"?: string }) => (
    <div data-testid="lottie" aria-label={label} />
  ),
}));

describe("LottieIcon", () => {
  it("renders with aria-label", () => {
    const { getByLabelText } = render(
      <LottieIcon animationData={{}} aria-label="loading" />
    );
    expect(getByLabelText("loading")).toBeTruthy();
  });

  it("applies size class", () => {
    const { container } = render(
      <LottieIcon animationData={{}} size={32} aria-label="icon" />
    );
    expect(container.firstChild).toHaveStyle({ width: "32px", height: "32px" });
  });
});
