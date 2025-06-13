"use client";

import DOMPurify from "dompurify";
import parse from "html-react-parser";

interface Props {
  description?: string;
}

function CleanDescription({ description }: Props) {
  const sanitized = DOMPurify.sanitize(description ?? "");

  return (
    <div className="text-light-text dark:text-dark-text max-w-2xl text-sm break-words lg:text-base">
      {parse(sanitized)}
    </div>
  );
}

export default CleanDescription;
