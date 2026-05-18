import{c as o,v as k,m as l,l as s}from"./index-Sz_H7th2.js";/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=o("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=o("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=o("MapPin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]),c="owner",r={async get(){return s.linkPages.get(c)},async upsert(e){const n=await s.linkPages.get(c),t=new Date;if(n){const i={...n,...e,updatedAt:t};return await s.linkPages.put(i),i}const a={id:c,username:e.username??"meiflow",displayName:e.displayName??"Meu Nome",bio:e.bio,avatarUrl:e.avatarUrl,theme:e.theme??"dark",accentColor:e.accentColor??"#3B8CE8",links:e.links??[],createdAt:t,updatedAt:t};return await s.linkPages.put(a),a},async addLink(e,n){const t=await r.get();if(!t)throw new Error("Link Page não configurada.");const a={id:l(),label:e,url:n.startsWith("http")?n:`https://${n}`,clicks:0};return r.upsert({links:[...t.links,a]})},async updateLink(e,n){const t=await r.get();if(!t)throw new Error("Link Page não configurada.");const a=t.links.map(i=>i.id===e?{...i,...n}:i);return r.upsert({links:a})},async deleteLink(e){const n=await r.get();if(!n)throw new Error("Link Page não configurada.");return r.upsert({links:n.links.filter(t=>t.id!==e)})},async reorderLinks(e){return r.upsert({links:e})},async incrementClick(e){const n=await r.get();if(!n)return;const t=n.links.map(a=>a.id===e?{...a,clicks:a.clicks+1}:a);await r.upsert({links:t})},generateUsername(e){return k(e)}};export{g as E,u as G,d as M,r as l};
