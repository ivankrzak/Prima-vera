import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";

interface BunnyCdnFile {
  Guid: string;
  StorageZoneName: string;
  Path: string;
  ObjectName: string;
  Length: number;
  LastChanged: string;
  ServerId: number;
  IsDirectory: boolean;
  UserId: string;
  DateCreated: string;
  StorageZoneId: number;
}

export const mediaRouter = createTRPCRouter({
  list: adminProcedure
    .input(z.object({ path: z.string().optional().default("/") }))
    .query(async ({ input }) => {
      if (!process.env.BUNNY_CDN_API_KEY) {
        throw new Error("Bunny CDN API key not configured");
      }
      if (!process.env.BUNNY_CDN_STORAGE_ZONE_BASE_URL) {
        throw new Error("Bunny CDN storage zone URL not configured");
      }
      if (!process.env.BUNNY_CDN_PUBLIC_URL) {
        throw new Error("Bunny CDN public URL not configured");
      }

      const url = `${process.env.BUNNY_CDN_STORAGE_ZONE_BASE_URL}${input.path}/`;
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          AccessKey: process.env.BUNNY_CDN_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch from Bunny CDN");
      }

      const files = (await response.json()) as BunnyCdnFile[];

      return files.map((file) => ({
        ...file,
        url: `${process.env.BUNNY_CDN_PUBLIC_URL}${file.Path.replace(
          `/${file.StorageZoneName}`,
          "",
        )}${file.ObjectName}`,
      }));
    }),

  upload: adminProcedure
    .input(
      z.object({
        path: z.string(),
        fileName: z.string(),
        fileContent: z.string(), // base64 encoded string
      }),
    )
    .mutation(async ({ input }) => {
      const { path, fileName, fileContent } = input;

      if (!process.env.BUNNY_CDN_API_KEY) {
        throw new Error("Bunny CDN API key not configured");
      }
      if (!process.env.BUNNY_CDN_STORAGE_ZONE_BASE_URL) {
        throw new Error("Bunny CDN storage zone URL not configured");
      }

      const buffer = Buffer.from(fileContent, "base64");
      const url = `${process.env.BUNNY_CDN_STORAGE_ZONE_BASE_URL}${path}${fileName}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          AccessKey: process.env.BUNNY_CDN_API_KEY,
          "Content-Type": "application/octet-stream",
        },
        body: buffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Bunny CDN Upload Error:", errorText);
        throw new Error(
          `Failed to upload to Bunny CDN. Status: ${response.status}`,
        );
      }

      return { success: true };
    }),

  delete: adminProcedure
    .input(
      z.object({
        path: z.string(),
        fileName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { path, fileName } = input;

      if (!process.env.BUNNY_CDN_API_KEY) {
        throw new Error("Bunny CDN API key not configured");
      }
      if (!process.env.BUNNY_CDN_STORAGE_ZONE_BASE_URL) {
        throw new Error("Bunny CDN storage zone URL not configured");
      }

      const url = `${process.env.BUNNY_CDN_STORAGE_ZONE_BASE_URL}${path}${fileName}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          AccessKey: process.env.BUNNY_CDN_API_KEY,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Bunny CDN Delete Error:", errorText);
        throw new Error(
          `Failed to delete from Bunny CDN. Status: ${response.status}`,
        );
      }

      return { success: true };
    }),
});
