"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "CANONICAL-SLOTS-1.0";

type Props = {
  chart: CoreHumanDesignChart;
  personalityActivations?: HumanDesignActivation[];
  designActivations?: HumanDesignActivation[];
  width?: number;
};

type Point = { x:number; y:number };
type Shape =
  | { kind:"polygon"; points:Point[] }
  | { kind:"rect"; x:number; y:number; width:number; height:number; rx:number };
type GateSource = "personality"|"design"|"both"|"inactive";

const BODY_SYMBOL:Record<string,string> = {
  Sun:"☉", Earth:"⊕", Moon:"☽", NorthNode:"☊", SouthNode:"☋",
  Mercury:"☿", Venus:"♀", Mars:"♂", Jupiter:"♃", Saturn:"♄",
  Uranus:"♅", Neptune:"♆", Pluto:"♇",
};

const CENTER_FILL:Record<CenterId,string> = {
  Head:"#f2df67", Ajna:"#8cb7a5", Throat:"#b38f63", G:"#f0df67",
  Ego:"#ffffff", Spleen:"#ffffff", "Solar Plexus":"#ffffff",
  Sacral:"#cd6861", Root:"#b98561",
};

/*
 * CANONICAL-SLOTS 1.0
 * -------------------
 * Geometry is now defined from the Human Design center topology first.
 * Gates are placed on canonical center edges, not visually guessed around tips.
 * Channels are always straight gate-to-gate lines. No curve, waypoint or router.
 */
const SHAPES:Record<CenterId,Shape> = {
  Head:{kind:"polygon",points:[{x:450,y:42},{x:408,y:112},{x:492,y:112}]},
  Ajna:{kind:"polygon",points:[{x:408,y:138},{x:492,y:138},{x:450,y:208}]},
  Throat:{kind:"rect",x:407,y:244,width:86,height:82,rx:4},
  G:{kind:"polygon",points:[{x:450,y:352},{x:492,y:394},{x:450,y:436},{x:408,y:394}]},
  Ego:{kind:"polygon",points:[{x:530,y:352},{x:508,y:414},{x:566,y:414}]},
  Spleen:{kind:"polygon",points:[{x:250,y:438},{x:390,y:510},{x:250,y:582}]},
  "Solar Plexus":{kind:"polygon",points:[{x:650,y:438},{x:510,y:510},{x:650,y:582}]},
  Sacral:{kind:"rect",x:408,y:492,width:84,height:88,rx:4},
  Root:{kind:"rect",x:397,y:646,width:106,height:88,rx:4},
};

const CENTER_LABEL:Record<CenterId,Point> = {
  Head:{x:450,y:80}, Ajna:{x:450,y:174}, Throat:{x:450,y:286}, G:{x:450,y:399},
  Ego:{x:536,y:392}, Spleen:{x:306,y:517}, "Solar Plexus":{x:594,y:517},
  Sacral:{x:450,y:540}, Root:{x:450,y:697},
};

const GATE:Record<number,Point> = {
  /* Head bottom */
  64:{x:424,y:112}, 61:{x:450,y:112}, 63:{x:476,y:112},

  /* Ajna top + side + tip */
  47:{x:424,y:138}, 24:{x:450,y:138}, 4:{x:476,y:138},
  17:{x:416,y:153}, 11:{x:484,y:153}, 43:{x:450,y:208},

  /* Throat */
  62:{x:425,y:244}, 23:{x:450,y:244}, 56:{x:475,y:244},
  16:{x:407,y:262}, 20:{x:407,y:303},
  45:{x:493,y:262}, 12:{x:493,y:282}, 35:{x:493,y:303},
  31:{x:425,y:326}, 8:{x:450,y:326}, 33:{x:475,y:326},

  /* G diamond */
  7:{x:450,y:352}, 1:{x:423,y:379}, 13:{x:477,y:379},
  10:{x:408,y:394}, 25:{x:492,y:394},
  2:{x:423,y:421}, 46:{x:477,y:421}, 15:{x:450,y:436},

  /* Ego triangle */
  21:{x:530,y:352}, 51:{x:515,y:394}, 26:{x:518,y:414}, 40:{x:556,y:414},

  /* Spleen triangle: gates distributed along BOTH sloping edges */
  48:{x:278,y:452}, 57:{x:318,y:473}, 44:{x:358,y:494},
  50:{x:370,y:520}, 32:{x:336,y:538}, 18:{x:298,y:558}, 28:{x:260,y:577},

  /* Solar Plexus triangle: mirrored canonical distribution */
  36:{x:622,y:452}, 22:{x:582,y:473}, 37:{x:542,y:494},
  6:{x:530,y:520}, 49:{x:564,y:538}, 55:{x:602,y:558}, 30:{x:640,y:577},

  /* Sacral */
  5:{x:426,y:492}, 14:{x:450,y:492}, 29:{x:474,y:492},
  34:{x:408,y:510}, 27:{x:408,y:536}, 59:{x:408,y:562},
  3:{x:426,y:580}, 9:{x:450,y:580}, 42:{x:474,y:580},

  /* Root: canonical placement — left side / top / right side */
  54:{x:397,y:666}, 38:{x:397,y:688}, 58:{x:397,y:711},
  53:{x:424,y:646}, 60:{x:450,y:646}, 52:{x:476,y:646},
  19:{x:503,y:666}, 39:{x:503,y:688}, 41:{x:503,y:711},
};

function canonical(a:number,b:number){return `${Math.min(a,b)}-${Math.max(a,b)}`;}

function gateSource(gate:number,personality:Set<number>,design:Set<number>):GateSource{
  const p=personality.has(gate), d=design.has(gate);
  if(p&&d)return "both"; if(p)return "personality"; if(d)return "design"; return "inactive";
}

function sourceColor(source:GateSource){
  return source==="design"?"#d84a40":source==="both"?"#9c3d39":source==="personality"?"#171720":"#6b6761";
}

function renderCenter(center:CenterId,defined:boolean){
  const s=SHAPES[center];
  const common={fill:defined?CENTER_FILL[center]:"#fff",stroke:"#171720",strokeWidth:2.8};
  if(s.kind==="rect")return <rect x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx} {...common}/>;
  return <polygon points={s.points.map(p=>`${p.x},${p.y}`).join(" ")} {...common}/>;
}

function GateLabel({gate,source}:{gate:number;source:GateSource}){
  const p=GATE[gate]; if(!p)return null;
  return <g>
    <circle cx={p.x} cy={p.y} r="6" fill="#fbfaf7"/>
    <text x={p.x} y={p.y+2.55} textAnchor="middle" fontSize="7.1" fontWeight="900" fill={sourceColor(source)}>{gate}</text>
  </g>;
}

function lerp(a:Point,b:Point,t:number):Point{return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}

function ChannelActivation({a,b,aSource,bSource,active}:{a:Point;b:Point;aSource:GateSource;bSource:GateSource;active:boolean}){
  if(active){
    const m=lerp(a,b,.5);
    return <g>
      {aSource!=="inactive"&&<line x1={a.x} y1={a.y} x2={m.x} y2={m.y} stroke={sourceColor(aSource)} strokeWidth="5.4" strokeLinecap="butt"/>}
      {bSource!=="inactive"&&<line x1={m.x} y1={m.y} x2={b.x} y2={b.y} stroke={sourceColor(bSource)} strokeWidth="5.4" strokeLinecap="butt"/>}
    </g>;
  }
  const aEnd=lerp(a,b,.24), bStart=lerp(a,b,.76);
  return <g>
    {aSource!=="inactive"&&<line x1={a.x} y1={a.y} x2={aEnd.x} y2={aEnd.y} stroke={sourceColor(aSource)} strokeWidth="5.1" strokeLinecap="butt"/>}
    {bSource!=="inactive"&&<line x1={bStart.x} y1={bStart.y} x2={b.x} y2={b.y} stroke={sourceColor(bSource)} strokeWidth="5.1" strokeLinecap="butt"/>}
  </g>;
}

function ActivationPanel({x,title,color,activations,align}:{x:number;title:string;color:string;activations:HumanDesignActivation[];align:"left"|"right"}){
  return <g>
    <text x={x} y="38" textAnchor={align==="left"?"start":"end"} fontSize="15" fontWeight="800" fill={color}>{title}</text>
    {activations.map((a,i)=>{const y=63+i*23;return <g key={`${title}-${a.body}`}>
      <text x={x} y={y} textAnchor={align==="left"?"start":"end"} fontSize="13" fontWeight="700" fill={color}>{BODY_SYMBOL[a.body]??"•"}</text>
      <text x={x+(align==="left"?20:-20)} y={y} textAnchor={align==="left"?"start":"end"} fontSize="12" fontWeight="700" fill="#24232e">{a.gate}.{a.line}</text>
    </g>;})}
  </g>;
}

export function BodyGraph({chart,personalityActivations=[],designActivations=[],width=900}:Props){
  const defined=new Set(chart.centers);
  const activeChannels=new Set(chart.channels.map(id=>{const[a,b]=id.split("-").map(Number);return canonical(a,b);}));
  const personality=new Set(personalityActivations.map(a=>a.gate));
  const design=new Set(designActivations.map(a=>a.gate));

  return <svg viewBox="0 0 900 760" width="100%" style={{maxWidth:width,height:"auto"}} role="img" aria-label="Human Design BodyGraph">
    <rect width="900" height="760" rx="22" fill="#fbfaf7"/>
    <ActivationPanel x={34} title="Design" color="#d84238" activations={designActivations} align="left"/>
    <ActivationPanel x={866} title="Personality" color="#191820" activations={personalityActivations} align="right"/>

    {/* Thin inactive rails. White halo keeps overlapping rails visually separated. */}
    <g>
      {CHANNELS.map(c=>{const a=GATE[c.gateA],b=GATE[c.gateB];if(!a||!b)return null;const id=canonical(c.gateA,c.gateB);return <g key={`rail-${id}`}>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#fbfaf7" strokeWidth="4.4"/>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#aaa79f" strokeWidth="1.35" opacity="0.76"/>
      </g>;})}
    </g>

    {/* Active and hanging segments remain straight gate-to-gate. */}
    <g>
      {CHANNELS.map(c=>{const a=GATE[c.gateA],b=GATE[c.gateB];if(!a||!b)return null;const id=canonical(c.gateA,c.gateB);return <ChannelActivation key={`act-${id}`} a={a} b={b} aSource={gateSource(c.gateA,personality,design)} bSource={gateSource(c.gateB,personality,design)} active={activeChannels.has(id)}/>;})}
    </g>

    {/* Centers mask lines in their interior. */}
    <g>
      {(Object.keys(SHAPES) as CenterId[]).map(center=><g key={center}>
        {renderCenter(center,defined.has(center))}
        <text x={CENTER_LABEL[center].x} y={CENTER_LABEL[center].y+4} textAnchor="middle" fontSize="13.4" fontWeight="800" fill="#191820">{center==="Solar Plexus"?"Solar":center}</text>
      </g>)}
    </g>

    {/* Gate labels last: every label sits exactly on its center boundary slot. */}
    <g>{Object.keys(GATE).map(g=>{const gate=Number(g);return <GateLabel key={gate} gate={gate} source={gateSource(gate,personality,design)}/>;})}</g>

    <g transform="translate(450 750)">
      <rect x="-220" y="-18" width="440" height="27" rx="13.5" fill="#fff" stroke="#ddd8cf"/>
      <text x="0" y="0" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#5a5650">{chart.type} · {chart.authority} · {chart.profile} · {chart.definition}</text>
    </g>
  </svg>;
}
