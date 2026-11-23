export interface DetectedOption { label:string; value:string; selected:boolean; disabled:boolean; }
export interface DetectedField { id:string; index:number; tagName:string; controlType:string; name?:string; elementId?:string; label:string; placeholder?:string; accessibleDescription?:string; helperText?:string; exampleText?:string; currentValue:string; required:boolean; disabled:boolean; readOnly:boolean; hidden:boolean; options?:DetectedOption[]; }
const EXCLUDED=new Set(["hidden","password","submit","button","reset","image"]);
const SENSITIVE=/password|one.?time|otp|verification.?code|security.?code|credit.?card|card.?number|cvv|cvc|bank|routing|ssn|social.?security|passport|national.?id|work.?authorization|gender|ethnicity|race|disability|veteran|consent|attest/i;
function described(root:ParentNode,ids:string|null):string { if(!ids)return ""; return ids.split(/\s+/).map(id=>root.querySelector<HTMLElement>("#"+CSS.escape(id))?.innerText??"").filter(Boolean).join(" ").trim(); }
export function detectApplicationFields(root:ParentNode=document):DetectedField[] {
 return Array.from(root.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>("input,textarea,select")).flatMap((el,index)=>{
  const type=el instanceof HTMLInputElement?el.type.toLowerCase():el.tagName.toLowerCase();
  const identity=[el.name,el.id,el.getAttribute("autocomplete"),el.getAttribute("aria-label"),el.getAttribute("placeholder"),el.labels?Array.from(el.labels).map(x=>x.innerText).join(" "):""].filter(Boolean).join(" ");
  if(SENSITIVE.test(identity)||EXCLUDED.has(type)||el.disabled||("readOnly" in el && el.readOnly)||el.getAttribute("aria-hidden")==="true")return [];
  const style=window.getComputedStyle(el); const hidden=el.hidden||style.display==="none"||style.visibility==="hidden"; if(hidden)return [];
  const labelledBy = el.getAttribute("aria-labelledby");
  const labelledByText = labelledBy
    ? labelledBy.split(/\\s+/).map(id => {
        const node = root.querySelector<HTMLElement>("#" + CSS.escape(id));
        return node?.innerText ?? node?.textContent ?? "";
      }).filter(Boolean).join(" ")
    : "";
  const rawLabel=(el.labels?Array.from(el.labels).map(x=>x.innerText).join(" "):"")||labelledByText||el.getAttribute("aria-label")||el.getAttribute("title")||"";
  // Some application forms mark required fields visually with a trailing asterisk only.
  const requiredMarker=/\*\s*$/.test(rawLabel.trim());
  const label=rawLabel.replace(/\s*\*\s*$/,"").trim();
  const required=el.required||el.getAttribute("aria-required")==="true"||requiredMarker;
  const options=el instanceof HTMLSelectElement?Array.from(el.options).map(o=>({label:o.label.trim(),value:o.value,selected:o.selected,disabled:o.disabled})):undefined;
  return [{id:el.id||((el.name||"field")+"-"+index),index,tagName:el.tagName.toLowerCase(),controlType:type,name:el.name||undefined,elementId:el.id||undefined,label,placeholder:el.getAttribute("placeholder")||undefined,accessibleDescription:el.getAttribute("aria-description")||undefined,helperText:described(root,el.getAttribute("aria-describedby"))||undefined,exampleText:el.getAttribute("data-example")||el.getAttribute("title")||undefined,currentValue:el instanceof HTMLInputElement&&el.type==="checkbox"?String(el.checked):el.value,required,disabled:el.disabled,readOnly:"readOnly" in el ? el.readOnly : false,hidden,options}];
 });
}
