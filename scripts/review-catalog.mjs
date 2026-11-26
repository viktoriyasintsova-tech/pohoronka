import {build} from 'esbuild';
import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const base=pathToFileURL(process.cwd()+'/public/').href;
const result=await build({entryPoints:['src/main.jsx'],bundle:true,write:false,format:'iife',loader:{'.css':'empty'},define:{'import.meta.env.BASE_URL':JSON.stringify(base),'process.env.NODE_ENV':'"production"'}});
const test=readFileSync(new URL('./data/catalog-ux-checks.js',import.meta.url),'utf8');

const css=readFileSync('src/style.css','utf8').replaceAll("url('/assets/",`url('${base}assets/`);
writeFileSync(process.argv[2]||'/private/tmp/istok-catalog.html',`<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><div id="root"></div><script>${result.outputFiles[0].text.replaceAll('</script','<\\/script')}</script><script>${test}</script></html>`);
