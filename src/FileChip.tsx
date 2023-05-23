import { Chip, Stack } from '@mui/material';
import prettyBytes from 'pretty-bytes';

import { FileUploader } from './FileUploader';
import { DirectUploadedFile } from './types';

type Props = {
  file: DirectUploadedFile;
  uploadUrl: string;
  externalError?: string;
  onFileError?: (file: DirectUploadedFile) => void;
  onRemove?: (file: DirectUploadedFile) => void;
  onProgress?: (file: DirectUploadedFile) => void;
};

export const FileChip = ({
  file,
  uploadUrl,
  externalError,
  onFileError,
  onRemove,
  onProgress,
}: Props): JSX.Element => {
  const { done, error, name, size } = file;

  const handleRemove = (remove: boolean) => {
    if (onRemove && remove) onRemove(file);
  };

  const handleProgress = (file: DirectUploadedFile) => {
    if (onProgress) onProgress(file);
  };

  const handleError = (file: DirectUploadedFile) => {
    if (onFileError) onFileError(file);
  };

  return (
    <Stack spacing={1}>
      <Chip
        sx={{ maxWidth: 250 }}
        variant={done ? 'filled' : 'outlined'}
        color={error || externalError ? 'error' : 'primary'}
        label={`${name} ${size && `(${prettyBytes(size)})`}`}
        onDelete={() => handleRemove(done || !!error)}
      />
      {!done && (
        <FileUploader
          file={file}
          url={uploadUrl}
          onProgress={handleProgress}
          onError={handleError}
        />
      )}
    </Stack>
  );
};
