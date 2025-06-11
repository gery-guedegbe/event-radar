"use client";

export default function LoadingSpinner() {
  return (
    <div className="border-light-primary inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !border-0 !p-0 !whitespace-nowrap ![clip:rect(0,0,0,0)]">
        Chargement...
      </span>
    </div>
  );
}
