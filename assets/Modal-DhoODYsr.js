import{d as e}from"./sfx-itRt3rjM.js";import{i as t,n,r,t as i}from"./motion-CQvsGfHH.js";var a=e(t(),1),o=r();function s({isOpen:e,onClose:t,title:r,children:s,size:c=`md`}){return(0,a.useEffect)(()=>(e?(document.body.style.overflow=`hidden`,document.body.style.touchAction=`none`):(document.body.style.overflow=``,document.body.style.touchAction=``),()=>{document.body.style.overflow=``,document.body.style.touchAction=``}),[e]),(0,o.jsx)(n,{children:e&&(0,o.jsxs)(i.div,{className:`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4`,initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},children:[(0,o.jsx)(i.div,{className:`absolute inset-0 bg-black/70 backdrop-blur-sm`,onClick:t}),(0,o.jsxs)(i.div,{className:`
              relative w-full ${{sm:`max-w-sm`,md:`max-w-md`,lg:`max-w-lg`,xl:`max-w-2xl`}[c]}
              flex flex-col
              max-h-[90vh]
              bg-gray-900 border border-white/10
              rounded-t-2xl sm:rounded-2xl
              shadow-2xl shadow-black/60
              overflow-hidden
            `,initial:{y:`100%`,opacity:0},animate:{y:0,opacity:1},exit:{y:`100%`,opacity:0},transition:{type:`spring`,damping:30,stiffness:320},children:[(0,o.jsxs)(`div`,{className:`shrink-0`,children:[(0,o.jsx)(`div`,{className:`flex justify-center pt-2.5 pb-1 sm:hidden`,children:(0,o.jsx)(`div`,{className:`w-10 h-1 rounded-full bg-white/20`})}),(0,o.jsx)(`div`,{className:`h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500`}),r&&(0,o.jsxs)(`div`,{className:`px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/5`,children:[(0,o.jsx)(`h2`,{className:`text-xl font-bold text-white`,children:r}),(0,o.jsx)(`button`,{onClick:t,className:`text-white/40 hover:text-white transition-colors text-xl leading-none p-1`,"aria-label":`Close`,children:`×`})]})]}),(0,o.jsxs)(`div`,{className:`\r
                flex-1 overflow-y-auto overscroll-contain\r
                p-6 space-y-4\r
                [&::-webkit-scrollbar]:w-1.5\r
                [&::-webkit-scrollbar-track]:bg-transparent\r
                [&::-webkit-scrollbar-thumb]:bg-white/15\r
                [&::-webkit-scrollbar-thumb]:rounded-full\r
                [&::-webkit-scrollbar-thumb:hover]:bg-white/30\r
              `,style:{WebkitOverflowScrolling:`touch`},children:[s,(0,o.jsx)(`div`,{style:{paddingBottom:`env(safe-area-inset-bottom, 8px)`}})]})]})]})})}export{s as t};