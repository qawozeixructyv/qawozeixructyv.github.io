"use strict";
(() => {
const ids = ["title", "date", "category", "description", "slug", "body", "cover", "audio", "audio_title", "video", "video_title"];
const fields = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
const status = document.getElementById("status");
const key = "life-elsewhere-draft-v1";
const today = () => new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
fields.date.value = today();
let dirty = false;
let coverCleared=false;
let audioCleared=false;
let videoCleared=false;
let storageOK = true;
const values = () => ({...Object.fromEntries(ids.map(id => [id, fields[id].value])),_removedCover:coverCleared,_removedAudio:audioCleared,_removedVideo:videoCleared});
function message(text) { status.textContent = text; }
const mediaPreviews = new Map();
function safeImageURL(path) {
 if(/^\/(?!\/)/.test(path))return mediaPreviews.get(path)||"https://qawozeixructyv.github.io"+path;
 if(/^https:\/\//i.test(path))return path;
 return "";
}
function removeInsertedPhoto(index) {
 const lines=fields.body.value.split("\n");
 if(!/^!\[[^\]]*\]\([^\s)]+\)\s*$/.test(lines[index]||""))return;
 lines.splice(index,1);fields.body.value=lines.join("\n");save();
 message("已从正文移除这张图片，发布更新后生效。画廊与已上传文件保留。");
}
function preview() {
 const videoPreview=document.getElementById("editor-video-preview");
 const videoURL=safeImageURL(fields.video.value.trim());
 videoPreview.hidden=!videoURL;
 if(videoURL){if(videoPreview.getAttribute("src")!==videoURL)videoPreview.src=videoURL;}
 else{videoPreview.pause();videoPreview.removeAttribute("src");videoPreview.load();}
 if(fields.cover.value.trim())videoPreview.poster=safeImageURL(fields.cover.value.trim());else videoPreview.removeAttribute("poster");
 const inserted=document.getElementById("inserted-photos");inserted.replaceChildren();
 const audioPreview=document.getElementById("editor-audio-preview");
 const audioURL=safeImageURL(fields.audio.value.trim());
 audioPreview.hidden=!audioURL;
 if(audioURL){if(audioPreview.getAttribute("src")!==audioURL)audioPreview.src=audioURL;}
 else {audioPreview.pause();audioPreview.removeAttribute("src");audioPreview.load();}
 const coverImage=document.getElementById("cover-preview");
 const coverURL=safeImageURL(fields.cover.value.trim());
 coverImage.hidden=!coverURL;
 if(coverURL)coverImage.src=coverURL;else coverImage.removeAttribute("src");
  document.getElementById("count").textContent = `${Array.from(fields.body.value.replace(/\s/g, "")).length} 字`;
  document.getElementById("preview-title").textContent = fields.title.value || "未命名的文章";
  document.getElementById("preview-desc").textContent = fields.description.value;
  const container = document.getElementById("preview-body");
  container.replaceChildren();
  let para = [], code = [], inCode = false;
  const append = (tag, text, className) => { const el = document.createElement(tag); el.textContent = text; if(className) el.className=className; container.append(el); };
  const flush = () => { if(para.length) { append("p",para.join("\n")); para=[]; } };
  for(const [lineIndex,line] of fields.body.value.split("\n").entries()) {
    if(/^```/.test(line)) { flush(); if(inCode) {append("pre",code.join("\n"));code=[];} inCode=!inCode;continue; }
    if(inCode) {code.push(line);continue;}
    if(!line.trim()) {flush();continue;}
    const heading = /^(#{1,6})\s+(.+)/.exec(line);
    if(heading) {flush();append("h"+heading[1].length,heading[2]);continue;}
    if(/^>\s?/.test(line)) {flush();append("blockquote",line.replace(/^>\s?/,""));continue;}
    if(/^[-*]\s+/.test(line)) {flush();const ul=document.createElement("ul");const li=document.createElement("li");li.textContent=line.slice(2);ul.append(li);container.append(ul);continue;}
    if(/^!\[/.test(line)) {
     flush();const photo=/^!\[([^\]]*)\]\(([^\s)]+)\)\s*$/.exec(line);
     if(photo&&safeImageURL(photo[2])){
      const image=document.createElement("img");image.src=safeImageURL(photo[2]);image.alt=photo[1];image.loading="lazy";
      const row=document.createElement("div");row.className="inserted-photo-row";
      const thumb=document.createElement("img");thumb.src=image.src;thumb.alt=photo[1];
      const label=document.createElement("span");label.textContent=photo[1]||"正文图片";
      const remove=document.createElement("button");remove.type="button";remove.textContent="从正文删除";remove.addEventListener("click",()=>removeInsertedPhoto(lineIndex));
      row.append(thumb,label,remove);inserted.append(row);
      const figure=document.createElement("figure");figure.className="editable-photo";figure.append(image);
      const previewRemove=document.createElement("button");previewRemove.type="button";previewRemove.textContent="删除这张图片";previewRemove.addEventListener("click",()=>removeInsertedPhoto(lineIndex));figure.append(previewRemove);container.append(figure);
     }else append("div","照片格式："+line,"imagehint");continue;
    }
    if(line.trim()==="<!--more-->") {flush();continue;}
    para.push(line);
  }
  flush();if(inCode)append("pre",code.join("\n"));
 if(!inserted.children.length){const note=document.createElement("p");note.textContent="正文中还没有插入图片。";inserted.append(note);}
}
function save() {
  dirty = true;
  try { localStorage.setItem(key,JSON.stringify(values()));storageOK=true;message("草稿已保存到当前浏览器 · "+new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"})); }
  catch { storageOK=false;message("浏览器无法保存草稿，请立即导出文章或备份草稿。"); }
  preview();
}
try {
 const raw=localStorage.getItem(key);
 if(raw) {const saved=JSON.parse(raw);coverCleared=saved._removedCover===true;audioCleared=saved._removedAudio===true;videoCleared=saved._removedVideo===true;for(const id of ids)if(typeof saved[id]==="string")fields[id].value=saved[id];if(!["游记","随笔"].includes(fields.category.value))fields.category.value="随笔";message("已恢复当前浏览器中的草稿");}
} catch {storageOK=false;message("无法读取本机草稿，请使用导出备份。");}
for(const id of ids)fields[id].addEventListener("input",save);
function download(filename, text, type) {
 const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportMarkdown(d) {
 const title=d.title.trim();if(!title)throw new Error("请先填写文章标题。");
 if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date))throw new Error("请选择有效日期。");
 if(!d.body.trim())throw new Error("请先写下正文。");
 const slug=d.slug.trim() || "note-"+Date.now().toString(36);
 if(!/^[a-zA-Z0-9-]+$/.test(slug))throw new Error("文件名只支持英文字母、数字和短横线。");
 const quote=JSON.stringify;
 for(const id of ['cover','audio','video'])if(d[id]&&!safeImageURL(d[id].trim()))throw new Error("封面、音频与视频请使用 /assets/ 路径或 https:// 地址。");
 return {filename:d.date+"-"+slug+".md",content:"---\ntitle: "+quote(title)+"\ndate: "+d.date+"\ncategories: ["+quote(d.category)+"]\ndescription: "+quote(d.description.trim())+(["cover","audio","audio_title","video","video_title"].filter(id=>d[id].trim()).map(id=>"\n"+id+": "+quote(d[id].trim())).join(""))+"\n---\n\n"+d.body.trim()+"\n"};
}
document.getElementById("editor").addEventListener("submit",e=>{
 e.preventDefault();try {const result=exportMarkdown(values());download(result.filename,result.content,"text/markdown;charset=utf-8");dirty=false;message(fields.date.value>today()?"已导出；文章日期在未来，上线后会暂时隐藏。":"已导出 Markdown。上传到仓库 _posts 后才会发布。");}catch(err){message(err.message);}
});
document.getElementById("backup").addEventListener("click",()=>{download("life-elsewhere-draft-"+today()+".json",JSON.stringify(values(),null,2),"application/json");dirty=false;message("已导出草稿备份，正文仍保留在编辑器。");});
document.getElementById("clear").addEventListener("click",()=>{
 if(!confirm("清空当前草稿？未导出的内容将无法恢复。"))return;
 coverCleared=true;audioCleared=true;videoCleared=true;for(const id of ids)fields[id].value="";fields.date.value=today();fields.category.value="随笔";
 try{localStorage.removeItem(key);}catch{}dirty=false;preview();message("当前草稿已清空。");
});
document.getElementById("import").addEventListener("change",async e=>{
 const file=e.target.files[0];if(!file)return;
 try {
   if(file.size>5*1024*1024)throw new Error("草稿文件过大（最多 5 MB）。");
   const data=JSON.parse(await file.text());
   if(data&&typeof data=== "object"&&!Array.isArray(data))for(const id of ["cover","audio","audio_title","video","video_title"])if(data[id]===undefined)data[id]="";
   if(!data || typeof data!=="object" || Array.isArray(data) || ids.some(id=>typeof data[id]!=="string") || !["随笔","游记"].includes(data.category) || !/^\d{4}-\d{2}-\d{2}$/.test(data.date))throw new Error("请选择由此写作工具导出的 JSON 草稿。");
   if(ids.some(id=>fields[id].value && !["date","category"].includes(id)) && !confirm("导入会替换当前草稿。请先导出备份。继续导入？"))return;
   coverCleared=data._removedCover===true;audioCleared=data._removedAudio===true;videoCleared=data._removedVideo===true;for(const id of ids)fields[id].value=data[id];save();message("草稿已导入。"+(storageOK?"":"请导出备份，当前浏览器无法保存。"));
 }catch(err){message("导入失败："+err.message);}finally{e.target.value="";}
});
for(const button of document.querySelectorAll("[data-insert]"))button.addEventListener("click",()=>{
 const snippets={heading:"\n\n## 小标题\n\n",quote:"\n\n> 在这里写引用\n\n",image:"\n\n![照片说明]("+"{"+"{ '/assets/images/photo.jpg' | relative_url }"+"})\n\n"};
 const body=fields.body;body.setRangeText(snippets[button.dataset.insert],body.selectionStart,body.selectionEnd,"end");body.focus();save();
});
window.addEventListener("beforeunload",e=>{if(dirty&&!storageOK){e.preventDefault();e.returnValue="";}});

const publishButton = document.getElementById("publish");
const tokenField = document.getElementById("github-token");
document.getElementById("forget-token").addEventListener("click",()=>{tokenField.value="";message("Token 已清除。");});
publishButton.addEventListener("click", async () => {
 let token = tokenField.value.trim();
 let snapshot;
 try {
  snapshot=values();
  if(!snapshot.slug.trim()){snapshot.slug="note-"+Date.now().toString(36);fields.slug.value=snapshot.slug;save();}
  let result=exportMarkdown(snapshot);
  if(!token)throw new Error("请先输入仅授权博客仓库的 GitHub Token。");
  if(!confirm(`将《${snapshot.title.trim()}》提交到公开仓库的 _posts/${result.filename}。正文提交后可被查看。${snapshot.date>today()?"日期在未来，博客暂不展示，但源文件公开。":""}继续发布？`))return;
  publishButton.disabled=true;message("正在验证账号并检查文章……");
  const headers={Accept:"application/vnd.github+json",Authorization:"Bearer "+token};
  async function request(url, options={}) {
   const response=await fetch(url,{...options,headers:{...headers,...options.headers},cache:"no-store"});
   if(response.status===401)throw new Error("Token 无效或已过期，请重新创建。");
   if(response.status===403)throw new Error("权限不足或请求受限，请检查仓库选择、Contents 读写权限和 GitHub 状态。");
   return response;
  }
  const userResponse=await request("https://api.github.com/user");
  if(!userResponse.ok)throw new Error("无法验证 GitHub 账号，请稍后重试。");
  const user=await userResponse.json();
  if(user.login!=="qawozeixructyv")throw new Error("请使用博客所有者 qawozeixructyv 的 Token。");
  const endpoint="https://api.github.com/repos/qawozeixructyv/qawozeixructyv.github.io/contents/_posts/"+encodeURIComponent(result.filename);
  const existing=await request(endpoint+"?ref=main");
  let sha;
  if(existing.ok){
   const data=await existing.json();
   if(data.type!=="file")throw new Error("同名路径不是文件，请更换文章文件名。");
   sha=data.sha;
   if(data.content){
    const original=decodeBase64Text(data.content);
    const fm=/^---\r?\n([\s\S]*?)\r?\n---/.exec(original);
    for(const id of ['cover','audio','audio_title','video','video_title']){
     if(snapshot[id].trim()||(id==='cover'?coverCleared:id.startsWith('video')?videoCleared:audioCleared))continue;
     const match=fm&&new RegExp('^'+id+':\\s*(.+)$','m').exec(fm[1]);
     if(match){let value=match[1].trim();try{value=JSON.parse(value);}catch{value=value.replace(/^'(.*)'$/,"$1");}if(typeof value==='string'&&(id.endsWith('_title')||safeImageURL(value))){snapshot[id]=value;fields[id].value=value;}}
    }
    result=exportMarkdown(snapshot);save();
   }
   if(!confirm(`仓库已有 ${result.filename}，将替换该文章的全部内容。确定更新？`)){message("已取消更新，草稿保留。");return;}
  } else if(existing.status!==404)throw new Error("检查文章失败，请稍后重试。");
  const bytes=new TextEncoder().encode(result.content);
  let binary="";for(const byte of bytes)binary+=String.fromCharCode(byte);
  const payload={message:(sha?"更新文章：":"发布文章：")+snapshot.title.trim(),content:btoa(binary),branch:"main"};
  if(sha)payload.sha=sha;
  message("正在提交文章……");
  const response=await request(endpoint,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  if(!response.ok){
   if(response.status===409)throw new Error("仓库内容已变化，请重新发布并确认更新。");
   if(response.status===404)throw new Error("找不到仓库，请检查 Token 是否选中了博客仓库。");
   if(response.status===422)throw new Error("提交被拒绝，请检查分支规则或文件名。");
   throw new Error("提交失败，请到 GitHub 检查文章是否存在后再重试。");
  }
  message("文章已提交到 GitHub；这不代表网页已上线。请到仓库 Actions 查看 Pages 构建结果。"+(snapshot.date>today()?"文章日期在未来，博客暂不展示。":""));
 } catch(err) {
  message(err instanceof TypeError?"网络请求失败，请到 GitHub 检查是否已提交后再重试。":err.message);
 } finally {token="";publishButton.disabled=false;}
});

const mediaStatus=document.getElementById('media-status');
const photoLibrary=document.getElementById('photo-library');
const photoInput=document.getElementById('photo-files');
const drop=document.getElementById('photo-drop');
let uploading=false;
const apiRoot='https://api.github.com/repos/qawozeixructyv/qawozeixructyv.github.io/contents/';
function encodeBytes(bytes){let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary);}
function decodeBase64Text(text){return new TextDecoder().decode(Uint8Array.from(atob(text.replace(/\s/g,'')),c=>c.charCodeAt(0)));}
function encodeText(text){return encodeBytes(new TextEncoder().encode(text));}
async function mediaAPI(path,token,options={}){
 const response=await fetch(apiRoot+path,{...options,cache:'no-store',headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,...options.headers}});
 if(response.status===401)throw new Error('Token 无效或已过期。');
 if(response.status===403)throw new Error('权限不足，请检查 Contents 读写权限。');
 return response;
}
async function verifyMediaOwner(token){
 if(!token)throw new Error('请先在下方输入 GitHub Token。');
 const r=await fetch('https://api.github.com/user',{cache:'no-store',headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token}});
 if(!r.ok)throw new Error('无法验证账号，请检查 Token 或网络。');
 if((await r.json()).login!=='qawozeixructyv')throw new Error('请使用博客所有者的 Token。');
}
async function readPhotos(token){
 const r=await mediaAPI('_data/photos.json?ref=main',token);
 if(r.status===404)return {photos:[],sha:null};
 if(!r.ok)throw new Error('读取画廊目录失败。');
 const file=await r.json();
 const photos=JSON.parse(decodeBase64Text(file.content));
 if(!Array.isArray(photos)||photos.some(p=>!p||typeof p.path!=='string'||typeof p.caption!=='string'))throw new Error('画廊目录格式异常，未覆盖原文件。');
 return {photos,sha:file.sha};
}
async function syncPhoto(photo,token){
 for(let attempt=0;attempt<3;attempt++){
  const {photos,sha}=await readPhotos(token);
  if(photos.some(p=>p.path===photo.path))return;
  const payload={message:'照片加入画廊：'+photo.caption,branch:'main',content:encodeText(JSON.stringify([...photos,photo],null,2)+'\n')};
  if(sha)payload.sha=sha;
  const r=await mediaAPI('_data/photos.json',token,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(r.ok)return;
  if(r.status===409||r.status===422)continue;
  throw new Error('照片已上传，但画廊同步失败。请点击「重试同步」。');
 }
 throw new Error('画廊同步发生冲突，请点击「重试同步」。');
}
function insertPhoto(photo,caption){
 const alt=caption.replace(/[\[\]\r\n]/g,' ').trim()||'照片';
 const text='\n\n!['+alt+']('+photo.path+')\n\n';
 const body=fields.body;body.setRangeText(text,body.selectionStart,body.selectionEnd,'end');body.focus();save();
}
async function checkPhotoReferences(photo,token){
 const basename=photo.path.split('/').pop();
 for(const folder of ['_posts','_drafts']){
  const response=await mediaAPI(folder+'?ref=main',token);
  if(response.status===404)continue;
  if(!response.ok)throw new Error('无法检查文章引用，未删除图片。');
  const entries=await response.json();
  if(!Array.isArray(entries)||entries.length>=1000||entries.some(x=>x.type==='dir'))throw new Error('文章目录较大或包含子目录，无法完整检查，未删除图片。');
  for(const entry of entries){
   if(entry.type!=='file'||! /\.(md|markdown|html)$/i.test(entry.name))continue;
   const r=await mediaAPI(entry.path.split('/').map(encodeURIComponent).join('/')+'?ref=main',token);
   if(!r.ok)throw new Error('读取文章失败，未删除图片。');
   const file=await r.json();
   if(file.encoding!=='base64'||typeof file.content!=='string')throw new Error('无法完整读取文章，未删除图片。');
   const text=decodeBase64Text(file.content);
   if(text.includes(photo.path)||text.includes(basename)||text.includes(encodeURIComponent(basename)))throw new Error('图片仍被 '+entry.path+' 使用。请先从该文章中移除图片或封面并发布更新，再删除仓库文件。');
  }
 }
}
async function removePhotoRecord(photo,token){
 for(let attempt=0;attempt<3;attempt++){
  const {photos,sha}=await readPhotos(token);
  const kept=photos.filter(p=>p.path!==photo.path);
  if(kept.length===photos.length)return false;
  const r=await mediaAPI('_data/photos.json',token,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({branch:'main',sha,message:'从画廊移除照片：'+photo.caption,content:encodeText(JSON.stringify(kept,null,2)+'\n')})});
  if(r.ok)return true;
  if(r.status===409||r.status===422)continue;
  throw new Error('移除画廊记录失败，未删除图片文件。');
 }
 throw new Error('画廊更新冲突，未删除图片，请重试。');
}
async function deleteRepositoryPhoto(photo,token){
 if(!/^\/assets\/images\/[A-Za-z0-9_-][A-Za-z0-9_.-]*\.(?:jpe?g|png|webp|gif)$/i.test(photo.path))throw new Error('只能删除 assets/images 中的照片，不能删除外部图片或其他代码文件。');
 await verifyMediaOwner(token);
 await checkPhotoReferences(photo,token);
 const endpoint=photo.path.slice(1).split('/').map(encodeURIComponent).join('/');
 const response=await mediaAPI(endpoint+'?ref=main',token);
 if(!response.ok&&response.status!==404)throw new Error('无法读取图片文件，未执行删除。');
 const file=response.ok?await response.json():null;
 if(file&&(file.type!=='file'||!file.sha))throw new Error('目标不是普通图片文件，未删除。');
 if(!confirm('将从仓库当前版本删除 '+photo.path+'，同时移除画廊记录和当前草稿里的图片引用。Git 历史中的旧副本仍可能存在。确定删除？'))return false;
 const removedRecord=await removePhotoRecord(photo,token);
 if(!file)return true;
 try{
  const r=await mediaAPI(endpoint,token,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({branch:'main',sha:file.sha,message:'删除照片：'+photo.caption})});
  if(r.ok||r.status===404)return true;
  throw new Error('图片删除被拒绝（'+r.status+'）。');
 }catch(err){
  // A lost response may still mean the deletion succeeded; resolve before restoring.
  try{const current=await mediaAPI(endpoint+'?ref=main',token);if(current.status===404)return true;}catch{}
  if(removedRecord){try{await syncPhoto(photo,token);}catch{throw new Error('图片删除未确认，画廊恢复也失败。请检查 GitHub 文件和 _data/photos.json 后再操作。');}}
  throw new Error('图片删除失败或未确认，画廊记录已保留或恢复。请检查仓库后重试。');
 }
}
function removePhotoFromDraft(path){
 let fenced=false;
 fields.body.value=fields.body.value.split('\n').filter(line=>{
  if(/^```/.test(line)){fenced=!fenced;return true;}if(fenced)return true;
  const m=/^!\[[^\]]*\]\(([^\s)]+)\)\s*$/.exec(line);
  return !(m&&(m[1]===path||m[1]==='https://qawozeixructyv.github.io'+path));
 }).join('\n');
 if(fields.cover.value.trim()===path||fields.cover.value.trim()==='https://qawozeixructyv.github.io'+path){fields.cover.value='';coverCleared=true;}
 const blob=mediaPreviews.get(path);if(blob){URL.revokeObjectURL(blob);mediaPreviews.delete(path);}save();
}

function addPhotoTile(photo,pending=false){
 if(!safeImageURL(photo.path))return;
 const tile=document.createElement('div');tile.className='photo-tile';
 const image=document.createElement('img');image.src=safeImageURL(photo.path);image.alt=photo.caption;
 const caption=document.createElement('input');caption.className='photo-caption';caption.value=photo.caption;caption.setAttribute('aria-label','正文图片说明');
 const path=document.createElement('p');path.textContent=photo.path;
 const insert=document.createElement('button');insert.type='button';insert.textContent='插入正文';insert.addEventListener('click',()=>insertPhoto(photo,caption.value));
 const cover=document.createElement('button');cover.type='button';cover.textContent='设为封面';cover.addEventListener('click',()=>{fields.cover.value=photo.path;coverCleared=false;save();});
 tile.append(image,caption,path,insert,cover);
 const permanentlyDelete=document.createElement('button');permanentlyDelete.type='button';permanentlyDelete.className='delete-from-repo';permanentlyDelete.textContent='从仓库删除';
 permanentlyDelete.addEventListener('click',async()=>{
  if(uploading||publishButton.disabled){mediaStatus.textContent='请等待当前上传或发布完成。';return;}
  uploading=true;publishButton.disabled=true;permanentlyDelete.disabled=true;
  try{
   mediaStatus.textContent='正在检查文章引用……';
   const deleted=await deleteRepositoryPhoto(photo,tokenField.value.trim());
   if(!deleted){mediaStatus.textContent='已取消删除。';return;}
   removePhotoFromDraft(photo.path);tile.remove();
   mediaStatus.textContent='已从仓库当前版本和画廊移除图片。当前草稿引用也已移除，页面更新需等待 Pages 构建。';
  }catch(err){mediaStatus.textContent=err.message;}
  finally{uploading=false;publishButton.disabled=false;permanentlyDelete.disabled=false;}
 });tile.append(permanentlyDelete);
 if(pending){const retry=document.createElement('button');retry.type='button';retry.textContent='重试同步';retry.addEventListener('click',async()=>{retry.disabled=true;try{const token=tokenField.value.trim();await verifyMediaOwner(token);await syncPhoto(photo,token);retry.remove();mediaStatus.textContent='画廊同步成功，等待 Pages 构建。';}catch(err){mediaStatus.textContent=err.message;}finally{retry.disabled=false;}});tile.append(retry);}
 photoLibrary.prepend(tile);
}
async function validatePhoto(file){
 if(!file.size||file.size>8*1024*1024)throw new Error(file.name+'：单张图片须在 8 MB 以内。');
 const bytes=new Uint8Array(await file.arrayBuffer());
 const head=String.fromCharCode(...bytes.subarray(0,12));
 let ext;
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)ext='jpg';
 else if(bytes[0]===137&&head.slice(1,4)==='PNG'&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10)ext='png';
 else if(head.startsWith('GIF87a')||head.startsWith('GIF89a'))ext='gif';
 else if(head.startsWith('RIFF')&&head.slice(8,12)==='WEBP')ext='webp';
 else throw new Error(file.name+'：支持 JPG、PNG、WebP、GIF，暂不支持 HEIC 或 SVG。');
 return {bytes,ext};
}
async function uploadPhotos(files){
 if(uploading){mediaStatus.textContent='已有图片在上传，请稍候。';return;}
 files=Array.from(files);if(!files.length)return;
 if(publishButton.disabled){mediaStatus.textContent="请等待发布完成后再上传照片。";return;}
 const token=tokenField.value.trim();uploading=true;photoInput.disabled=true;publishButton.disabled=true;
 try{
  await verifyMediaOwner(token);
  if(!confirm('所选图片将立即上传到公开仓库和画廊，即使文章尚未发布。继续？'))return;
  for(let i=0;i<files.length;i++){
   const file=files[i];mediaStatus.textContent='上传 '+(i+1)+' / '+files.length+'：'+file.name;
   try{
    const {bytes,ext}=await validatePhoto(file);
    const path='assets/images/'+today()+'-'+crypto.randomUUID()+'.'+ext;
    const photo={path:'/'+path,caption:file.name.replace(/\.[^.]+$/,'').slice(0,160)||'照片',date:today()};
    const r=await mediaAPI(path,token,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({branch:'main',message:'上传照片：'+photo.caption,content:encodeBytes(bytes)})});
    if(!r.ok)throw new Error('图片提交失败（'+r.status+'），请检查网络及仓库权限。');
    mediaPreviews.set(photo.path,URL.createObjectURL(file));
    let pending=false;try{await syncPhoto(photo,token);}catch{pending=true;}
    addPhotoTile(photo,pending);
    insertPhoto(photo,photo.caption);
    mediaStatus.textContent=pending?'照片已上传并插入正文；画廊尚未同步，请点照片下方「重试同步」。':'照片已上传、插入正文并同步画廊。等待 Pages 构建后网页更新。';
   }catch(err){mediaStatus.textContent=err.message;break;}
  }
 }catch(err){mediaStatus.textContent=err.message;}
 finally{uploading=false;photoInput.disabled=false;photoInput.value='';publishButton.disabled=false;}
}
photoInput.addEventListener('change',e=>uploadPhotos(e.target.files));
for(const event of ['dragenter','dragover'])drop.addEventListener(event,e=>{e.preventDefault();drop.classList.add('dragging');});
drop.addEventListener('dragleave',()=>drop.classList.remove('dragging'));
drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('dragging');uploadPhotos(e.dataTransfer.files);});
fields.body.addEventListener('paste',e=>{const images=Array.from(e.clipboardData?.files||[]).filter(f=>f.type.startsWith('image/'));if(images.length){e.preventDefault();uploadPhotos(images);}});
document.getElementById('clear-cover').addEventListener('click',()=>{fields.cover.value='';coverCleared=true;save();});
fields.cover.addEventListener('input',()=>{coverCleared=true;save();});
document.getElementById('load-photos').addEventListener('click',async()=>{
 if(uploading)return;const button=document.getElementById('load-photos');button.disabled=true;
 try{const token=tokenField.value.trim();await verifyMediaOwner(token);const {photos}=await readPhotos(token);photoLibrary.replaceChildren();for(const photo of photos)addPhotoTile(photo);mediaStatus.textContent=photos.length?'已载入 '+photos.length+' 张照片，可插入正文或设为封面。':'还没有通过写作页上传的照片。';}
 catch(err){mediaStatus.textContent=err.message;}finally{button.disabled=false;}
});

const audioInput=document.getElementById('audio-file');
const audioStatus=document.getElementById('audio-status');
for(const id of ['audio','audio_title'])fields[id].addEventListener('input',()=>{audioCleared=true;save();});
document.getElementById('clear-audio').addEventListener('click',()=>{fields.audio.value='';fields.audio_title.value='';audioCleared=true;save();audioStatus.textContent='文章音频已移除，仓库文件仍保留。';});
audioInput.addEventListener('change',async e=>{
 const file=e.target.files[0];if(!file)return;
 if(uploading||publishButton.disabled){audioStatus.textContent='请等待当前上传或发布完成后再选择音频。';audioInput.value='';return;}
 uploading=true;publishButton.disabled=true;photoInput.disabled=true;audioInput.disabled=true;
 try{
  const token=tokenField.value.trim();await verifyMediaOwner(token);
  if(!file.size||file.size>20*1024*1024)throw new Error('音频文件最多 20 MB。');
  const bytes=new Uint8Array(await file.arrayBuffer());
  const header=String.fromCharCode(...bytes.subarray(0,12));
  let ext;
  if(header.startsWith('ID3')||(bytes[0]===255&&(bytes[1]&224)===224))ext='mp3';
  else if(header.startsWith('RIFF')&&header.slice(8,12)==='WAVE')ext='wav';
  else if(header.startsWith('OggS'))ext='ogg';
  else if(header.slice(4,8)==='ftyp'&&(file.type==='audio/mp4'||/\.m4a$/i.test(file.name)))ext='m4a';
  else throw new Error('请选择 MP3、M4A、WAV 或 OGG 音频文件。');
  if(!confirm('音频将立即上传到公开仓库，文章发布后可供读者手动播放。继续？'))return;
  audioStatus.textContent='正在上传音频……';
  const path='assets/audio/'+today()+'-'+crypto.randomUUID()+'.'+ext;
  const r=await mediaAPI(path,token,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({branch:'main',message:'上传文章音频',content:encodeBytes(bytes)})});
  if(!r.ok)throw new Error('音频上传失败（'+r.status+'）。请检查权限与网络。');
  fields.audio.value='/'+path;mediaPreviews.set(fields.audio.value,URL.createObjectURL(file));
  if(!fields.audio_title.value.trim())fields.audio_title.value=file.name.replace(/\.[^.]+$/,'');
  audioCleared=false;save();audioStatus.textContent='音频已上传。发布文章后会出现提示，默认不播放。';
 }catch(err){audioStatus.textContent=err.message;}
 finally{uploading=false;publishButton.disabled=false;photoInput.disabled=false;audioInput.disabled=false;audioInput.value='';}
});

const videoInput=document.getElementById('video-file');
const videoStatus=document.getElementById('video-status');
for(const id of ['video','video_title'])fields[id].addEventListener('input',()=>{videoCleared=true;save();});
document.getElementById('clear-video').addEventListener('click',()=>{fields.video.value='';fields.video_title.value='';videoCleared=true;save();videoStatus.textContent='已移除文章 Vlog，发布更新后生效。仓库视频文件保留。';});
async function validateVideo(file){
 if(!file.size||file.size>50*1024*1024)throw new Error('Vlog 最多 50 MB。较大的视频请压缩，或填写外部视频直链。');
 const head=new Uint8Array(await file.slice(0,32).arrayBuffer());
 const signature=String.fromCharCode(...head);
 if(signature.slice(4,8)==='ftyp'&&(/\.mp4$/i.test(file.name)||file.type==='video/mp4'))return 'mp4';
 if(head[0]===26&&head[1]===69&&head[2]===223&&head[3]===163&&(/\.webm$/i.test(file.name)||file.type==='video/webm'))return 'webm';
 throw new Error('请选择 MP4 或 WebM 视频。MOV 请先导出为 MP4（建议 H.264 视频与 AAC 音频）。');
}
videoInput.addEventListener('change',async e=>{
 const file=e.target.files[0];if(!file)return;
 if(uploading||publishButton.disabled){videoStatus.textContent='请等待当前上传或发布完成后再选择 Vlog。';videoInput.value='';return;}
 uploading=true;publishButton.disabled=true;photoInput.disabled=true;audioInput.disabled=true;videoInput.disabled=true;
 try{
  const token=tokenField.value.trim();await verifyMediaOwner(token);
  const ext=await validateVideo(file);
  if(!confirm('Vlog 将立即上传到公开仓库。发布文章后读者可手动播放，默认不播放。继续？'))return;
  videoStatus.textContent='正在读取并上传 Vlog，大文件可能需要较长时间……';
  const path='assets/video/'+today()+'-'+crypto.randomUUID()+'.'+ext;
  const bytes=new Uint8Array(await file.arrayBuffer());
  const r=await mediaAPI(path,token,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({branch:'main',message:'上传文章 Vlog',content:encodeBytes(bytes)})});
  if(!r.ok)throw new Error('Vlog 上传失败（'+r.status+'）。请检查权限与网络，或压缩后重试。');
  fields.video.value='/'+path;
  if(!fields.video_title.value.trim())fields.video_title.value=file.name.replace(/\.[^.]+$/,'');
  mediaPreviews.set(fields.video.value,URL.createObjectURL(file));videoCleared=false;save();
  videoStatus.textContent='Vlog 已上传，可在下方手动预览。发布文章后显示 Vlog 提示与播放器。';
 }catch(err){videoStatus.textContent=err.message;}
 finally{uploading=false;publishButton.disabled=false;photoInput.disabled=false;audioInput.disabled=false;videoInput.disabled=false;videoInput.value='';}
});

preview();
})();
