export type ImageCropProps = {
  open?: boolean;
  image?: string | null;
  fileName?: string;
  aspectRatio?: number;
  onClose: () => void;
  onApply: (newFile: File) => void;
};
