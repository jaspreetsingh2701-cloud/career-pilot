export interface WebsiteAccessRules { allowlist: string[]; blocklist: string[]; includeSubdomains: boolean; }
export type AccessDecision = { allowed: true } | { allowed: false; reason: string };
const KEY = "careerPilot.websiteAccessRules";
function ipv4(value: string): boolean { const p=value.split("."); return p.length===4 && p.every(x=>/^\d{1,3}$/.test(x) && Number(x)<=255); }
function ipv6(value: string): boolean { if(!value.includes(":")) return false; try { return new URL("http://["+value+"]/").hostname.length>2; } catch { return false; } }
export function normalizeHostRule(input: string): string {
 const value=input.trim().toLowerCase().replace(/\.$/,"");
 if(!value || /[\s/@?#]/.test(value)) throw new Error("Enter a hostname or exact IP address.");
 if(ipv4(value)||ipv6(value)) return value;
 let parsed: URL; try { parsed=new URL("https://"+value); } catch { throw new Error("Invalid domain or IP address: "+input); }
 if(parsed.hostname!==value || parsed.pathname!=="/" || parsed.port || value.includes(":") || (!value.includes(".") && value!=="localhost")) throw new Error("Enter a hostname or exact IP without scheme, port, or path: "+input);
 return value;
}
export function parseHostRules(value: string): string[] { return [...new Set(value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(normalizeHostRule))]; }
function matches(host:string, rule:string, subdomains:boolean):boolean { return host===rule || (subdomains && !ipv4(rule) && !ipv6(rule) && host.endsWith("."+rule)); }
export function evaluateWebsiteAccess(url:string,rules:WebsiteAccessRules):AccessDecision {
 let parsed:URL; try { parsed=new URL(url); } catch { return {allowed:false,reason:"The active tab URL is unavailable or invalid."}; }
 if(!["http:","https:"].includes(parsed.protocol)) return {allowed:false,reason:"CareerPilot supports HTTP and HTTPS pages only."};
 const host=parsed.hostname.toLowerCase().replace(/\.$/,"");
 if(rules.blocklist.some(x=>matches(host,x,rules.includeSubdomains))) return {allowed:false,reason:"This website is on your blocklist."};
 if(rules.allowlist.length && !rules.allowlist.some(x=>matches(host,x,rules.includeSubdomains))) return {allowed:false,reason:"This website is not on your allowlist."};
 return {allowed:true};
}
export async function getWebsiteAccessRules():Promise<WebsiteAccessRules> { const r=await chrome.storage.local.get(KEY); const s=r[KEY] as Partial<WebsiteAccessRules>|undefined; return {allowlist:Array.isArray(s?.allowlist)?s.allowlist:[],blocklist:Array.isArray(s?.blocklist)?s.blocklist:[],includeSubdomains:s?.includeSubdomains??true}; }
export async function saveWebsiteAccessRules(rules:WebsiteAccessRules):Promise<void> { await chrome.storage.local.set({[KEY]:rules}); }
