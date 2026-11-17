import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("should render the starter instructions and documentation links", () => {
    const markup = renderToStaticMarkup(<Home />);

    expect(markup).toContain("To get started, edit the");
    expect(markup).toContain("https://nextjs.org/docs?");
    expect(markup).toContain('alt="Next.js logo"');
  });
});
