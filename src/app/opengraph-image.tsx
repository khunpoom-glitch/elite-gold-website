import {
  createEliteGoldSocialImage,
  socialImageAlt,
  socialImageContentType,
  socialImageSize,
} from "@/app/social-image";

export const alt = socialImageAlt;
export const size = socialImageSize;
export const contentType = socialImageContentType;

export default async function Image() {
  return createEliteGoldSocialImage();
}
