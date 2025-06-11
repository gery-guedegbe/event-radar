"use client";

import Lightbox from "yet-another-react-lightbox";

interface ImageLightboxProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
}

export default function ImageLightbox({
  open,
  onClose,
  imageSrc,
}: ImageLightboxProps) {
  return <Lightbox open={open} close={onClose} slides={[{ src: imageSrc }]} />;
}
