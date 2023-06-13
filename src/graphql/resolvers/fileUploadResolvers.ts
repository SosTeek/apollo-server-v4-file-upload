import { createWriteStream, unlink } from "node:fs";
import { UPLOAD_DIRECTORY_URL } from "../../configs";

export const fileUploadResolvers = {
  Query : {},
  Mutation : {
    singleFileUpload : async (parent : any, args : any, contextValue : any, info : any) => {
      const { createReadStream, filename, mimetype, encoding } : {
        createReadStream : any;
        filename : string;
        mimetype : string;
        encoding : string;
      } = await args.file.file;
      const stream = createReadStream();
      const storedFileName = `${new Date().getTime()}-${filename}`;
      const storedFileUrl = new URL(storedFileName, UPLOAD_DIRECTORY_URL);

      await new Promise((resolve, reject) => {
        const writeStream = createWriteStream(storedFileUrl);

        writeStream.on("finish", resolve);

        writeStream.on("error", (error) => {
          unlink(storedFileUrl, () => {
            reject(error);
          });
        });

        stream.on("error", (error : any) => writeStream.destroy(error));

        stream.pipe(writeStream);
      });
      const data = {
        name: storedFileName,
        url: storedFileUrl
      }
      return data;
    }
  } 
}