import DialogContent from '@mui/material/DialogContent';
import { styled } from '@mui/material/styles';

export const getCroppedImageBlob = async (
  imageSrc: string,
  crop: { x: number; y: number; width: number; height: number },
  imageName: string,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasAlpha = imageData.data.some((value, index) => index % 4 === 3 && value < 255);

      const mimeType = hasAlpha ? 'image/png' : 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedImageFile = new File([blob], imageName, { type: 'image/jpeg' });
            resolve(croppedImageFile);
          } else {
            reject(new Error('Error creating blob from cropped image.'));
          }
        },
        mimeType,
        hasAlpha ? 1.0 : undefined,
      );
    };

    img.onerror = (error) => reject(error);
  });
};

export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  minHeight: 500,
  minWidth: 600,
  position: 'relative',
  backgroundColor: theme.palette.grey[100],
}));
