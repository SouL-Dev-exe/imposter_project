import{r as e,t}from"./motion-CQvsGfHH.js";var n=e();function r({children:e,className:r=``,glow:i=!1,onClick:a,animate:o=!0}){let s=o?t.div:`div`;return(0,n.jsx)(s,{...o?{initial:{opacity:0,y:16},animate:{opacity:1,y:0},transition:{duration:.3}}:{},onClick:a,className:`
        bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm
        ${i?`shadow-lg shadow-violet-900/30`:``}
        ${a?`cursor-pointer hover:bg-white/10 transition-colors`:``}
        ${r}
      `,children:e})}export{r as t};