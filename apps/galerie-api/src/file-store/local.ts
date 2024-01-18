import { FileStorageType, FileStore, Photo } from ".";

export const createLocalFileStore = (): FileStore => {
  return {
    type: FileStorageType.Local,
    save: async (photo: Photo): Promise<string> => {
      return new Promise((resolve, _) => resolve("https://example.com"));
    },
  };
};
