import { proxyFaceAssess } from "../../_lib/face_assess_proxy.js";

/** `/api/face-assess/*` subpaths (e.g. `/v1/web/assess`). */
export async function onRequest(context) {
  return proxyFaceAssess(context.request, context.env);
}
