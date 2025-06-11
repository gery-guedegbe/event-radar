"use client";

import { FC } from "react";

interface Props {
  url: string;
  title: string;
}

const popup = (shareUrl: string) => {
  window.open(
    shareUrl,
    "_blank",
    "toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=400",
  );
};

const ShareButtons: FC<Props> = ({ url, title }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const linkedinUrl = `https://www.linkedin.com/shareArticle?url=${encodedUrl}&title=${encodedTitle}`;

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => popup(fbUrl)}
        aria-label="Partager sur Facebook"
        className="cursor-pointer"
      >
        <svg
          className="text-light-primary dark:text-dark-primary h-5 w-5 lg:h-8 lg:w-8"
          viewBox="0 0 24 24"
        >
          {/* icône FB */}
          <path
            fill="currentColor"
            d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2c0-2 1.2-3.2 3-3.2.9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.2v1.8h2.3l-.4 3H14v7A10 10 0 0 0 22 12"
          />
        </svg>
      </button>

      <button
        onClick={() => popup(twitterUrl)}
        aria-label="Partager sur Twitter"
        className="cursor-pointer"
      >
        <svg
          className="text-light-primary dark:text-dark-primary h-5 w-5 lg:h-8 lg:w-8"
          viewBox="0 0 24 24"
        >
          {/* icône Twitter */}
          <path
            fill="currentColor"
            d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.05 4.28 4.28 0 0 0-7.3 2.92c0 .34.04.67.11.99A12.15 12.15 0 0 1 3.2 4.8a4.28 4.28 0 0 0 1.32 5.72 4.24 4.24 0 0 1-1.94-.54v.06a4.28 4.28 0 0 0 3.43 4.2 4.3 4.3 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98A8.59 8.59 0 0 1 2 19.54a12.1 12.1 0 0 0 6.56 1.92c7.88 0 12.19-6.53 12.19-12.19 0-.19 0-.39-.01-.58A8.72 8.72 0 0 0 22.46 6"
          />
        </svg>
      </button>

      <button
        onClick={() => popup(linkedinUrl)}
        aria-label="Partager sur LinkedIn"
        className="cursor-pointer"
      >
        <svg
          className="text-light-primary dark:text-dark-primary h-5 w-5 lg:h-8 lg:w-8"
          viewBox="0 0 24 24"
        >
          {/* icône LinkedIn */}
          <path
            fill="currentColor"
            d="M4.98 3a2.5 2.5 0 1 1-.01 5.01A2.5 2.5 0 0 1 4.98 3zM4 8h2v12H4V8zm4.5 0h2v1.9h.03c.28-.53.97-1.1 2-1.1 2.14 0 2.5 1.41 2.5 3.24V20h-2V12.9c0-1.65-.03-3.78-2.3-3.78-2.3 0-2.65 1.77-2.65 3.65V20h-2V8h2v1.2h.04c.3-.58 1.1-1.2 2.4-1.2z"
          />
        </svg>
      </button>
    </div>
  );
};

export default ShareButtons;
