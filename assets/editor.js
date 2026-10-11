"use strict";
(() => {
const ids = ["title", "date", "category", "description", "slug", "body"];
const fields = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
const status = document.getElementById("status");
const key = "life-elsewhere-draft-v1";
const today = () => new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
fields.date.value = today();
let dirty = false;
let storageOK = true;
const values = () => Object.fromEntries(ids.map(id => [id, fields[id].value]));
function message(text) { status.textContent = text; }
function preview() {
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
    if(/^!\[/.test(line)) {flush();append("div","照片格式："+line,"imagehint");continue;}
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
 return {filename:d.date+"-"+slug+".md",content:"---\ntitle: "+quote(title)+"\ndate: "+d.date+"\ncategories: ["+quote(d.category)+"]\ndescription: "+quote(d.description.trim())+"\n---\n\n"+d.body.trim()+"\n"};
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
  const result=exportMarkdown(snapshot);
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

preview();
})();
