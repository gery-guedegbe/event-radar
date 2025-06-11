"use client";

interface SearchBarProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder: string;
}

export default function SearchBar({ onChange, ...props }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        onChange={(e) => onChange(e.target.value)}
        className="border-light-border dark:border-dark-border dark:bg-dark-background dark:text-dark-text focus:border-light-primary focus:ring-light-primary dark:focus:ring-dark-primary dark:focus:border-dark-primary w-full rounded-lg border bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm transition-all focus:ring-1 focus:outline-none lg:py-2"
        {...props}
      />

      <div className="absolute top-3.5 right-3 text-gray-400 lg:top-2.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
}
