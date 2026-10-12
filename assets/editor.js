"use strict";
(() => {
const ids = ["title", "date", "category", "description", "slug", "body", "cover", "audio", "audio_title"];
const fields = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
const status = document.getElementById("status");
const key = "life-elsewhere-draft-v1";
const today = () => new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
fields.date.value = today();
let dirty = false;
let storageOK = true;
const values = () => Object.fromEntries(ids.map(id => [id, fields[id].value]));
function message(text) { status.textContent = text; }
const mediaPreviews = new Map();
function safeImageURL(path) {
 if(/^\/(?!\/)/.test(path))return mediaPreviews.get(path)||"https://qawozeixructyv.github.io"+path;
 if(/^https:\/\//i.test(path))return path;
 return "";
}
function preview() {
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
  for(const line of fields.body.value.split("\n")) {
    if(/^```/.test(line)) { flush(); if(inCode) {append("pre",code.join("\n"));code=[];} inCode=!inCode;continue; }
    if(inCode) {code.push(line);continue;}
    if(!line.trim()) {flush();continue;}
    const heading = /^(#{1,6})\s+(.+)/.exec(line);
    if(heading) {flush();append("h"+heading[1].length,heading[2]);continue;}
    if(/^>\s?/.test(line)) {flush();append("blockquote",line.replace(/^>\s?/,""));continue;}
    if(/^[-*]\s+/.test(line)) {flush();const ul=document.createElement("ul");const li=document.createElement("li");li.textContent=line.slice(2);ul.append(li);container.append(ul);continue;}
    if(/^!\[/.test(line)) {flush();const photo=/^!\[([^\]]*)\]\(([^\s)]+)\)\s*$/.exec(line);if(photo&&safeImageURL(photo[2])){const image=document.createElement("img");image.src=safeImageURL(photo[2]);image.alt=photo[1];image.loading="lazy";container.append(image);}else append("div","照片格式："+line,"imagehint");continue;}
    if(line.trim()==="<!--more-->") {flush();continue;}
    para.push(line);
  }
  flush();if(inCode)append("pre",code.join("\n"));
}
function save() {
  dirty = true;
  try { localStorage.setItem(key,JSON.stringify(values()));storageOK=true;message("草稿已保存到当前浏览器 · "+new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"})); }
  catch { storageOK=false;message("浏览器无法保存草稿，请立即导出文章或备份草稿。"); }
  preview();
}
try {
 const raw=localStorage.getItem(key);
 if(raw) {const saved=JSON.parse(raw);for(const id of ids)if(typeof saved[id]==="string")fields[id].value=saved[id];if(!["游记","随笔"].includes(fields.category.value))fields.category.value="随笔";message("已恢复当前浏览器中的草稿");}
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
 for(const id of ['cover','audio'])if(d[id]&&!safeImageURL(d[id].trim()))throw new Error("封面与音频请使用 /assets/ 路径或 https:// 地址。");
 return {filename:d.date+"-"+slug+".md",content:"---\ntitle: "+quote(title)+"\ndate: "+d.date+"\ncategories: ["+quote(d.category)+"]\ndescription: "+quote(d.description.trim())+(["cover","audio","audio_title"].filter(id=>d[id].trim()).map(id=>"\n"+id+": "+quote(d[id].trim())).join(""))+"\n---\n\n"+d.body.trim()+"\n"};
}
document.getElementById("editor").addEventListener("submit",e=>{
 e.preventDefault();try {const result=exportMarkdown(values());download(result.filename,result.content,"text/markdown;charset=utf-8");dirty=false;message(fields.date.value>today()?"已导出；文章日期在未来，上线后会暂时隐藏。":"已导出 Markdown。上传到仓库 _posts 后才会发布。");}catch(err){message(err.message);}
});
document.getElementById("backup").addEventListener("click",()=>{download("life-elsewhere-draft-"+today()+".json",JSON.stringify(values(),null,2),"application/json");dirty=false;message("已导出草稿备份，正文仍保留在编辑器。");});
document.getElementById("clear").addEventListener("click",()=>{
 if(!confirm("清空当前草稿？未导出的内容将无法恢复。"))return;
 for(const id of ids)fields[id].value="";fields.date.value=today();fields.category.value="随笔";
 try{localStorage.removeItem(key);}catch{}dirty=false;preview();message("当前草稿已清空。");
});
document.getElementById("import").addEventListener("change",async e=>{
 const file=e.target.files[0];if(!file)return;
 try {
   if(file.size>5*1024*1024)throw new Error("草稿文件过大（最多 5 MB）。");
   const data=JSON.parse(await file.text());
   if(data&&typeof data=== "object"&&!Array.isArray(data))for(const id of ["cover","audio","audio_title"])if(data[id]===undefined)data[id]="";
   if(!data || typeof data!=="object" || Array.isArray(data) || ids.some(id=>typeof data[id]!=="string") || !["随笔","游记"].includes(data.category) || !/^\d{4}-\d{2}-\d{2}$/.test(data.date))throw new Error("请选择由此写作工具导出的 JSON 草稿。");
   if(ids.some(id=>fields[id].value && !["date","category"].includes(id)) && !confirm("导入会替换当前草稿。请先导出备份。继续导入？"))return;
   for(const id of ids)fields[id].value=data[id];save();message("草稿已导入。"+(storageOK?"":"请导出备份，当前浏览器无法保存。"));
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
    for(const id of ['cover','audio','audio_title']){
     if(snapshot[id].trim()||(id==='cover'?coverCleared:audioCleared))continue;
     const match=fm&&new RegExp('^'+id+':\\s*(.+)$','m').exec(fm[1]);
     if(match){let value=match[1].trim();try{value=JSON.parse(value);}catch{value=value.replace(/^'(.*)'$/,"$1");}if(typeof value==='string'&&(id==='audio_title'||safeImageURL(value))){snapshot[id]=value;fields[id].value=value;}}
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

let coverCleared=false;
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
function addPhotoTile(photo,pending=false){
 if(!safeImageURL(photo.path))return;
 const tile=document.createElement('div');tile.className='photo-tile';
 const image=document.createElement('img');image.src=safeImageURL(photo.path);image.alt=photo.caption;
 const caption=document.createElement('input');caption.className='photo-caption';caption.value=photo.caption;caption.setAttribute('aria-label','正文图片说明');
 const path=document.createElement('p');path.textContent=photo.path;
 const insert=document.createElement('button');insert.type='button';insert.textContent='插入正文';insert.addEventListener('click',()=>insertPhoto(photo,caption.value));
 const cover=document.createElement('button');cover.type='button';cover.textContent='设为封面';cover.addEventListener('click',()=>{fields.cover.value=photo.path;coverCleared=false;save();});
 tile.append(image,caption,path,insert,cover);
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
fields.cover.addEventListener('input',()=>{coverCleared=true;});
document.getElementById('load-photos').addEventListener('click',async()=>{
 if(uploading)return;const button=document.getElementById('load-photos');button.disabled=true;
 try{const token=tokenField.value.trim();await verifyMediaOwner(token);const {photos}=await readPhotos(token);photoLibrary.replaceChildren();for(const photo of photos)addPhotoTile(photo);mediaStatus.textContent=photos.length?'已载入 '+photos.length+' 张照片，可插入正文或设为封面。':'还没有通过写作页上传的照片。';}
 catch(err){mediaStatus.textContent=err.message;}finally{button.disabled=false;}
});

let audioCleared=false;
const audioInput=document.getElementById('audio-file');
const audioStatus=document.getElementById('audio-status');
for(const id of ['audio','audio_title'])fields[id].addEventListener('input',()=>{audioCleared=true;});
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
  fields.audio.value='/'+path;
  if(!fields.audio_title.value.trim())fields.audio_title.value=file.name.replace(/\.[^.]+$/,'');
  audioCleared=false;save();audioStatus.textContent='音频已上传。发布文章后会出现提示，默认不播放。';
 }catch(err){audioStatus.textContent=err.message;}
 finally{uploading=false;publishButton.disabled=false;photoInput.disabled=false;audioInput.disabled=false;audioInput.value='';}
});

preview();
})();
