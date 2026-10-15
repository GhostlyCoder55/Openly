import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { describe, expect, it } from "vitest";
import { SearchField } from "../components/SearchField";
import { FormatsPage } from "./FormatsPage";

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

describe("format directory", () => {
  it("explains an unknown search instead of inventing a format", () => {
    render(
      <MemoryRouter initialEntries={["/formats?q=zzzznotarealformatqqq"]}>
        <Routes>
          <Route path="/formats" element={<FormatsPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole("status")).toHaveTextContent(/No format matched/);
    expect(screen.getByRole("status")).toHaveTextContent(/will not invent a result/i);
  });

  it("does not present an ambiguous extension as one certain format", () => {
    render(
      <MemoryRouter initialEntries={["/formats?q=song.mod"]}>
        <Routes>
          <Route path="/formats" element={<FormatsPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole("status")).toHaveTextContent(/not treating one interpretation as certain/i);
  });
});

describe("search keyboard", () => {
  it("opens the highlighted suggestion with Enter", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LocationProbe />
        <Routes>
          <Route path="/" element={<SearchField />} />
          <Route path="/formats/:extension" element={<h1>Opened format</h1>} />
        </Routes>
      </MemoryRouter>,
    );
    const box = screen.getByRole("combobox", { name: /search an extension/i });
    await user.type(box, ".pdf");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(await screen.findByRole("heading", { name: "Opened format" })).toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("/formats/pdf");
  });

  it("closes suggestions with Escape", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchField />
      </MemoryRouter>,
    );
    const box = screen.getByRole("combobox", { name: /search an extension/i });
    await user.type(box, "pdf");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
