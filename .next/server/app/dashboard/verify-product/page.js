(()=>{var e={};e.id=300,e.ids=[300],e.modules={55403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},94749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},25528:e=>{"use strict";e.exports=require("next/dist\\client\\components\\action-async-storage.external.js")},91877:e=>{"use strict";e.exports=require("next/dist\\client\\components\\request-async-storage.external.js")},25319:e=>{"use strict";e.exports=require("next/dist\\client\\components\\static-generation-async-storage.external.js")},71017:e=>{"use strict";e.exports=require("path")},57310:e=>{"use strict";e.exports=require("url")},43411:(e,t,s)=>{"use strict";s.r(t),s.d(t,{GlobalError:()=>n.a,__next_app__:()=>m,originalPathname:()=>u,pages:()=>p,routeModule:()=>h,tree:()=>o});var r=s(73137),a=s(54647),i=s(4183),n=s.n(i),l=s(71775),d={};for(let e in l)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(d[e]=()=>l[e]);s.d(t,d);let c=r.AppPageRouteModule,o=["",{children:["dashboard",{children:["verify-product",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.bind(s,65168)),"D:\\zsindia\\zsindia-cms\\app\\dashboard\\verify-product\\page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(s.bind(s,28963)),"D:\\zsindia\\zsindia-cms\\app\\dashboard\\layout.tsx"],metadata:{icon:[async e=>(await Promise.resolve().then(s.bind(s,24697))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]},{layout:[()=>Promise.resolve().then(s.bind(s,37928)),"D:\\zsindia\\zsindia-cms\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(s.t.bind(s,51918,23)),"next/dist/client/components/not-found-error"],metadata:{icon:[async e=>(await Promise.resolve().then(s.bind(s,24697))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}],p=["D:\\zsindia\\zsindia-cms\\app\\dashboard\\verify-product\\page.tsx"],u="/dashboard/verify-product/page",m={require:s,loadChunk:()=>Promise.resolve()},h=new c({definition:{kind:a.x.APP_PAGE,page:"/dashboard/verify-product/page",pathname:"/dashboard/verify-product",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:o}})},23580:(e,t,s)=>{Promise.resolve().then(s.bind(s,62170))},62170:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>h});var r=s(60080),a=s(9885),i=s(94829),n=s(68384),l=s(97052),d=s(70589),c=s(135),o=s(85574),p=s(75593);/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let u=(0,p.Z)("Printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);var m=s(9941);function h(){let[e,t]=(0,a.useState)([]),[s,p]=(0,a.useState)(null),[h,x]=(0,a.useState)(!0),f=(0,a.useRef)(null);(0,a.useEffect)(()=>{let e=async()=>{try{let{products:e}=await i.h.getProducts();t(e)}catch(e){m.Am.error("Failed to fetch products"),console.error("Failed to fetch products:",e)}finally{x(!1)}};e()},[]);let y=s?`https://zsindia.com/verify/${s._id}`:"";return h?r.jsx("div",{className:"flex items-center justify-center h-64",children:r.jsx("p",{className:"text-gray-500",children:"Loading products..."})}):(0,r.jsxs)("div",{className:"space-y-6",children:[(0,r.jsxs)("div",{children:[r.jsx("h1",{className:"text-3xl font-bold text-gray-900",children:"Generate QR Code"}),r.jsx("p",{className:"text-gray-500 mt-1",children:"Create QR codes for product verification"})]}),(0,r.jsxs)(l.Zb,{children:[r.jsx(l.Ol,{children:r.jsx(l.ll,{children:"Select Product"})}),r.jsx(l.aY,{className:"space-y-4",children:(0,r.jsxs)(d.Ph,{onValueChange:t=>{let s=e.find(e=>e._id===t);p(s||null)},children:[r.jsx(d.i4,{children:r.jsx(d.ki,{placeholder:"Choose a product..."})}),r.jsx(d.Bw,{children:e.map(e=>(0,r.jsxs)(d.Ql,{value:e._id,children:[e.name," - ",e.category]},e._id))})]})})]}),s&&(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(l.Zb,{children:[r.jsx(l.Ol,{children:r.jsx(l.ll,{children:"Product Information"})}),(0,r.jsxs)(l.aY,{className:"space-y-2",children:[(0,r.jsxs)("div",{className:"flex justify-between",children:[r.jsx("span",{className:"font-medium",children:"Name:"}),r.jsx("span",{className:"text-gray-700",children:s.name})]}),(0,r.jsxs)("div",{className:"flex justify-between",children:[r.jsx("span",{className:"font-medium",children:"Category:"}),r.jsx("span",{className:"text-gray-700",children:s.category})]}),(0,r.jsxs)("div",{className:"flex justify-between",children:[r.jsx("span",{className:"font-medium",children:"Family:"}),r.jsx("span",{className:"text-gray-700",children:s.family})]})]})]}),(0,r.jsxs)(l.Zb,{children:[r.jsx(l.Ol,{children:r.jsx(l.ll,{children:"QR Code Preview"})}),(0,r.jsxs)(l.aY,{className:"space-y-4",children:[(0,r.jsxs)("div",{ref:f,className:"flex flex-col items-center justify-center p-8 bg-white rounded-lg border",children:[r.jsx(c.t,{value:y,size:256,level:"H"}),r.jsx("p",{className:"mt-4 text-sm text-gray-600 break-all max-w-md text-center",children:y})]}),(0,r.jsxs)("div",{className:"flex gap-4 justify-center",children:[(0,r.jsxs)(n.z,{onClick:()=>{if(!s)return;let e=f.current?.querySelector("svg");if(!e)return;let t=new XMLSerializer().serializeToString(e),r=document.createElement("canvas"),a=r.getContext("2d"),i=new Image;r.width=512,r.height=512,i.onload=()=>{a?.drawImage(i,0,0),r.toBlob(e=>{if(e){let t=URL.createObjectURL(e),r=document.createElement("a");r.href=t,r.download=`qr-${s.slug}.png`,r.click(),URL.revokeObjectURL(t),m.Am.success("QR code downloaded")}})},i.src="data:image/svg+xml;base64,"+btoa(t)},variant:"outline",children:[r.jsx(o.Z,{className:"mr-2 h-4 w-4"}),"Download QR"]}),(0,r.jsxs)(n.z,{onClick:()=>{if(!s)return;let e=window.open("","_blank");if(!e){m.Am.error("Please allow pop-ups to print");return}let t=f.current?.querySelector("svg");if(!t)return;let r=new XMLSerializer().serializeToString(t);e.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${s.name}</title>
          <style>
            @media print {
              body {
                margin: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: Arial, sans-serif;
              }
              .print-container {
                text-align: center;
                padding: 20px;
              }
              h1 {
                margin-bottom: 10px;
                font-size: 24px;
              }
              p {
                margin-bottom: 20px;
                color: #666;
              }
              svg {
                width: 300px;
                height: 300px;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h1>${s.name}</h1>
            <p>Scan to verify product authenticity</p>
            ${r}
            <p style="margin-top: 20px; font-size: 12px;">https://zsindia.com/verify/${s._id}</p>
          </div>
        </body>
      </html>
    `),e.document.close(),e.focus(),setTimeout(()=>{e.print(),e.close()},250)},children:[r.jsx(u,{className:"mr-2 h-4 w-4"}),"Print QR"]})]}),(0,r.jsxs)("div",{className:"text-sm text-gray-600 space-y-2",children:[r.jsx("p",{className:"font-medium",children:"Usage Instructions:"}),(0,r.jsxs)("ul",{className:"list-disc list-inside space-y-1 ml-2",children:[r.jsx("li",{children:"Customers can scan this QR code to verify product authenticity"}),(0,r.jsxs)("li",{children:["The QR code links to: ",y]}),r.jsx("li",{children:"Print and attach to product packaging or documentation"})]})]})]})]})]})]})}},65168:(e,t,s)=>{"use strict";s.r(t),s.d(t,{$$typeof:()=>n,__esModule:()=>i,default:()=>d});var r=s(17536);let a=(0,r.createProxy)(String.raw`D:\zsindia\zsindia-cms\app\dashboard\verify-product\page.tsx`),{__esModule:i,$$typeof:n}=a,l=a.default,d=l}};var t=require("../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[9131,4280,7739,1297,7183,7240,3181,2412,3609,5436,7052,8384,161,4829,589],()=>s(43411));module.exports=r})();