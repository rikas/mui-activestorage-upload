import { useState, useRef } from 'react';
import { v4 as uuid } from 'uuid';

import { Box, Button, Stack, FormHelperText, Typography } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';

import { DirectUploadedFile } from './types';
import { FileChip } from './FileChip';

type Props = {
  label: string;
  onUploaded: (files: DirectUploadedFile[]) => void;
  onFileRemove: (file: DirectUploadedFile) => void;
  uploadUrl: string;
  error?: string;
  invalid?: boolean;
  mimeTypes?: string[];
  multiple?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const DirectFileUpload = ({
  label,
  onUploaded,
  onFileRemove,
  uploadUrl,
  error,
  invalid,
  mimeTypes = ['*/*'],
  multiple,
}: Props): JSX.Element => {
  const [uploadedFiles, setUploadedFiles] = useState<DirectUploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Change the state and add the files selected in the input field. If the file is already in the
  // state, it will not be added again to avoid duplicates.
  const handleFilesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const blobs = event.target.files;

    if (!blobs) return;

    const selectedBlobs = Array.from(blobs);

    const files: DirectUploadedFile[] = selectedBlobs.map((blob) => {
      return {
        blob,
        id: uuid(),
        name: blob.name,
        size: blob.size,
        type: blob.type,
        signedId: null,
        percent: 0,
        done: false,
        error: null,
      };
    });

    console.log(files);

    // Remove duplicates
    const newUploads = files.filter((f) => !uploadedFiles.find((file) => file.name === f.name));

    setUploadedFiles([...uploadedFiles, ...newUploads]);

    // By clearing the input field we allow the user to select the same file again. This can be
    // useful if the user "removes" the uploaded file and then wants to upload it again.
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const onFileProgress = (file: DirectUploadedFile) => {
    const { id, percent, signedId } = file;
    // Simulate a delay to show the progress bar and avoid very quick flickering if the file is very
    // small (or the upload too fast).
    setTimeout(() => {
      const uploadedFile = uploadedFiles.find((file) => file.id === id);

      if (!uploadedFile) {
        return;
      }

      uploadedFile.signedId = signedId;
      uploadedFile.percent = percent;
      uploadedFile.done = true;

      setUploadedFiles(uploadedFiles.map((file) => (file.id === id ? uploadedFile : file)));

      // Notify the parent component that all files have been uploaded
      if (uploadedFiles.every((file) => file.percent === 100)) {
        onUploaded(uploadedFiles);
      }
    }, 1000);
  };

  const onFileError = ({ id, error }: DirectUploadedFile) => {
    const uploadedFile = uploadedFiles.find((file) => file.id === id);

    if (!uploadedFile) {
      return;
    }

    uploadedFile.error = error;

    setUploadedFiles(uploadedFiles.map((file) => (file.id === id ? uploadedFile : file)));
  };

  const removeFile = (file: DirectUploadedFile) => {
    const { signedId } = file;
    setUploadedFiles(uploadedFiles.filter((file) => file.signedId !== signedId));
    onFileRemove(file);
  };

  return (
    <Box>
      {(multiple || uploadedFiles.length === 0) && (
        <Button
          color={invalid ? 'error' : 'primary'}
          variant="outlined"
          component="label"
          startIcon={<AttachFileIcon />}
        >
          {label}
          <input
            hidden
            multiple={multiple}
            accept={mimeTypes.join(', ')}
            type="file"
            ref={inputRef}
            onChange={handleFilesSelect}
          />
        </Button>
      )}

      <Stack direction="row" spacing={1}>
        {uploadedFiles.map((file) => (
          <FileChip
            key={file.id}
            file={file}
            uploadUrl={uploadUrl}
            onRemove={removeFile}
            onProgress={onFileProgress}
            onFileError={onFileError}
          />
        ))}
      </Stack>

      {uploadedFiles.length === 0 && invalid && (
        <FormHelperText error sx={{ ml: 2 }}>
          <Typography variant="caption">{error}</Typography>
        </FormHelperText>
      )}
    </Box>
  );
};
