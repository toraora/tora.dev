import { ChangeEvent, useState } from "react";

const updateTheme = (theme: string) => {
  const rootEl =
    typeof document !== "undefined" ? document.documentElement : null;
  if (rootEl && theme === "light") {
    rootEl.classList.remove("theme-dark");
  } else if (rootEl && theme === "dark") {
    rootEl.classList.add("theme-dark");
  }
};

const getCurrentTheme = (): string => {
  if (typeof localStorage !== "undefined" && localStorage.getItem("theme")) {
    updateTheme(localStorage.getItem("theme")!);
    return localStorage.getItem("theme")!;
  } else if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    updateTheme("dark");
    return "dark";
  }

  updateTheme("light");
  return "light";
};

export default () => {
  const themes = ["light", "dark"];

  const [theme, setTheme] = useState(() => getCurrentTheme());

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    localStorage.setItem("theme", event.target.value);
    updateTheme(event.target.value);
    setTheme(event.target.value);
  }

  const icons = [
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
        clipRule="evenodd"
      />
    </svg>,
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>,
  ];

  return (
    <div className="theme-toggle">
      {themes.map((t, i) => (
        <label key={i} className={theme === t ? "checked" : ""}>
          {icons[i]}
          <input
            type="radio"
            name="theme-toggle"
            checked={theme === t}
            value={t}
            title={`Use ${t} theme`}
            aria-label={`Use ${t} theme`}
            onChange={handleChange}
          />
        </label>
      ))}
    </div>
  );
};
