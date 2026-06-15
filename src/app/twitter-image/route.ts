import {
  createEliteGoldSocialImageHeadResponse,
  createEliteGoldSocialImageResponse,
} from "@/app/social-image";

export async function GET() {
  return createEliteGoldSocialImageResponse();
}

export function HEAD() {
  return createEliteGoldSocialImageHeadResponse();
}
