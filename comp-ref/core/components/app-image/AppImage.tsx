import Image, { ImageProps, StaticImageData } from 'next/image';
import React, { memo, useEffect, useState } from 'react';

type Src = string | StaticImageData;

export type AppImageProps = Omit<ImageProps, 'alt' | 'src'> & {
  alt?: string;
  src?: Src;
  fallBack?: Src;
};

const AppImage = ({ src, fallBack, ...props }: AppImageProps) => {
  const [imageSrc, setImageSrc] = useState<Src>(src ?? fallBack ?? '');

  useEffect(() => {
    if (src) setImageSrc(src);
  }, [src]);

  return (
    <Image
      alt='app-image'
      loader={({ src }) => src}
      unoptimized={true}
      {...props}
      src={imageSrc}
      onError={() => fallBack && setImageSrc(fallBack)}
    />
  );
};

export default memo(AppImage);
