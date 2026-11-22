import {describe,expect,it} from "vitest";
import {evaluateWebsiteAccess,normalizeHostRule,parseHostRules} from "./rules";
const empty={allowlist:[],blocklist:[],includeSubdomains:true};
describe("website access rules",()=>{
 it("normalizes domains and exact IPs",()=>{expect(normalizeHostRule(" Example.COM ")).toBe("example.com");expect(normalizeHostRule("192.168.1.2")).toBe("192.168.1.2");expect(normalizeHostRule("2001:db8::1")).toBe("2001:db8::1");});
 it("rejects schemes, paths, ports and invalid hosts",()=>{for(const x of ["https://example.com","example.com/path","example.com:443","999.1.1.1","not a host"])expect(()=>normalizeHostRule(x)).toThrow();});
 it("deduplicates newline entries",()=>expect(parseHostRules("Example.com\n\nexample.com")).toEqual(["example.com"]));
 it("allows all HTTP sites when lists are empty",()=>expect(evaluateWebsiteAccess("https://jobs.example.com",empty)).toEqual({allowed:true}));
 it("allows subdomains when enabled",()=>expect(evaluateWebsiteAccess("https://jobs.example.com",{...empty,allowlist:["example.com"]})).toEqual({allowed:true}));
 it("restricts sites when allowlist is populated",()=>expect(evaluateWebsiteAccess("https://other.com",{...empty,allowlist:["example.com"]}).allowed).toBe(false));
 it("gives blocklist precedence",()=>expect(evaluateWebsiteAccess("https://jobs.example.com",{...empty,allowlist:["example.com"],blocklist:["jobs.example.com"]})).toMatchObject({allowed:false,reason:"This website is on your blocklist."}));
 it("matches IPs exactly",()=>expect(evaluateWebsiteAccess("https://192.168.1.2",{...empty,allowlist:["192.168.1.1"]}).allowed).toBe(false));
 it("rejects non-web protocols",()=>expect(evaluateWebsiteAccess("chrome://extensions",empty).allowed).toBe(false));
});
