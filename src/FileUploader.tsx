import { useEffect } from 'react';
import { DirectUpload } from '@rails/activestorage';
import { LinearProgress, Typography } from '@mui/material';

import { DirectUploadError, DirectUploadedFile } from './types';

type Props = {
  file: DirectUploadedFile;
  url: string;
  onProgress: (file: DirectUploadedFile) => void;
  onError: (error: DirectUploadError) => void;
};

export const FileUploader = ({ file, url, onProgress, onError }: Props): JSX.Element => {
  useEffect(() => {
    if (!file.blob || file.percent === 100 || file.error || !url) {
      return;
    }

    const directUpload = new DirectUpload(file.blob, url);

    directUpload.create((error, blob) => {
      if (error) {
        onError({ id: file.id, error });
      } else {
        onProgress({
          id: file.id,
          done: true,
          percent: 100,
          signedId: blob.signed_id,
        });
      }
    });
  }, [file.id, file.blob, file.percent, file.error, onError, url, onProgress]);
  return (
    <>
      {!file.error && <LinearProgress />}
      {file.error && (
        <Typography color="error" variant="caption" sx={{ pl: 2 }}>
          Error uploading file!
        </Typography>
      )}
    </>
  );
};
