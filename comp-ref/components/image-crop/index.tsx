'use client';

import React, { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Cropper, { Area, Point } from 'react-easy-crop';
import { ImageCropProps } from './type';
import { getCroppedImageBlob, StyledDialogContent } from './utils';

const ImageCrop: React.FC<ImageCropProps> = ({
  open = false,
  onClose,
  onApply,
  image,
  fileName = 'crop_img.jpeg',
  aspectRatio,
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropData, setCropData] = useState<Area | null>(null);
  const [aspect] = useState(aspectRatio);

  const onCropChange = useCallback(
    (location: Point) => {
      setCrop({ ...crop, x: location.x, y: location.y });
    },
    [crop],
  );

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const handleCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCropData(croppedAreaPixels);
  }, []);

  const handleOnApply = useCallback(async () => {
    if (cropData && image) {
      getCroppedImageBlob(image, cropData, fileName).then((croppedImageBlob) => {
        if (onApply) {
          onApply(croppedImageBlob);
        }
      });
    }
  }, [cropData, image, fileName, onApply]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Crop Image</DialogTitle>
      <StyledDialogContent>
        <Cropper
          image={image ?? ''}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={handleCropComplete}
          style={{ containerStyle: { position: 'absolute' } }}
          zoomWithScroll
        />
      </StyledDialogContent>
      <DialogActions>
        <Button onClick={onClose} color='error'>
          Cancel
        </Button>
        <Button onClick={handleOnApply} color='primary'>
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageCrop;
