export interface DirectUploadError {
  id: string;
  error: string | Error;
}

export interface DirectUploadedFile {
  id: string;
  name?: string;
  size?: number;
  type?: string;
  blob?: File;
  signedId?: string | null;
  percent?: number;
  done?: boolean;
  error?: string | Error | null;
}
