import { ImageResponse } from 'next/og';
export const alt = 'Cast & Render — Motion, material, and possibility';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() { return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center',padding:90,background:'#f2f0ec',color:'#172722'}}><div style={{fontSize:26,letterSpacing:8}}>CAST & RENDER</div><div style={{fontSize:92,marginTop:38}}>Endless possibilities.</div><div style={{fontSize:30,marginTop:28}}>Motion. Material. Imagination.</div></div>, size); }
