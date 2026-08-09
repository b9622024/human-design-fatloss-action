"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "EDGE-PORT-2.0";

type Props = {
  chart: CoreHumanDesignChart;
  personalityActivations?: HumanDesignActivation[];
  designActivations?: HumanDesignActivation[];
  width?: number;
};

type Point = { x: number; y: number };
type Shape =
  | { kind: "polygon"; points: Point[] }
  | { kind: "rect"; x: number; y: number; width: number; height: number; rx: number };
type GateSource = "personality" | "design" | "both" | "inactive";

type EdgeSpec = { a: Point; b: Point; t: number };

const BODY_SYMBOL: Record<string, string> = {
  Sun: "☉", Earth: "⊕", Moon: "☽", NorthNode: "☊", SouthNode: "☋",
  Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
  Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

const CENTER_FILL: Record<CenterId, string> = {
  Head: "#f1df69",
  Ajna: "#8db8a7",
  Throat: "#b18e63",
  G: "#efdf68",
  Ego: "#ffffff",
  Spleen: "#ffffff",
  "Solar Plexus": "#ffffff",
  Sacral: "#cc6962",
  Root: "#b98662",
};

/*
 * EDGE-PORT 2.0
 * -------------
 * This renderer is intentionally rebuilt around center edges, not ad-hoc x/y
 * gate coordinates. Every gate is defined as a percentage on one visible
 * center edge. Gate labels and channel endpoints therefore always share the
 * exact same point and remain attached when a center moves or changes size.
 */
const SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 48 }, { x: 412, y: 112 }, { x: 488, y: 112 }] },
  Ajna: { kind: "polygon", points: [{ x: 412, y: 136 }, { x: 488, y: 136 }, { x: 450, y: 199 }] },
  Throat: { kind: "rect", x: 412, y: 228, width: 76, height: 76, rx: 4 },
  G: { kind: "polygon", points: [{ x: 450, y: 330 }, { x: 484, y: 364 }, { x: 450, y: 398 }, { x: 416, y: 364 }] },
  Ego: { kind: "polygon", points: [{ x: 506, y: 334 }, { x: 494, y: 380 }, { x: 532, y: 380 }] },
  Spleen: { kind: "polygon", points: [{ x: 322, y: 420 }, { x: 390, y: 466 }, { x: 322, y: 512 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 578, y: 420 }, { x: 510, y: 466 }, { x: 578, y: 512 }] },
  Sacral: { kind: "rect", x: 416, y: 442, width: 68, height: 76, rx: 4 },
  Root: { kind: "rect", x: 404, y: 568, width: 92, height: 72, rx: 4 },
};

const CENTER_LABEL: Record<CenterId, Point> = {
  Head: { x: 450, y: 82 },
  Ajna: { x: 450, y: 168 },
  Throat: { x: 450, y: 267 },
  G: { x: 450, y: 369 },
  Ego: { x: 512, y: 365 },
  Spleen: { x: 347, y: 470 },
  "Solar Plexus": { x: 553, y: 470 },
  Sacral: { x: 450, y: 482 },
  Root: { x: 450, y: 608 },
};

function lerp(a:Point,b:Point,t:number):Point {
  return { x: a.x + (b.x-a.x)*t, y: a.y + (b.y-a.y)*t };
}

function edgePoint(spec:EdgeSpec):Point { return lerp(spec.a,spec.b,spec.t); }

const P = {
  headBL:{x:412,y:112}, headBR:{x:488,y:112},
  ajnaTL:{x:412,y:136}, ajnaTR:{x:488,y:136}, ajnaB:{x:450,y:199},
  throatTL:{x:412,y:228}, throatTR:{x:488,y:228}, throatBL:{x:412,y:304}, throatBR:{x:488,y:304},
  gT:{x:450,y:330}, gR:{x:484,y:364}, gB:{x:450,y:398}, gL:{x:416,y:364},
  egoT:{x:506,y:334}, egoBL:{x:494,y:380}, egoBR:{x:532,y:380},
  splTop:{x:322,y:420}, splTip:{x:390,y:466}, splBot:{x:322,y:512},
  solTop:{x:578,y:420}, solTip:{x:510,y:466}, solBot:{x:578,y:512},
  sacTL:{x:416,y:442}, sacTR:{x:484,y:442}, sacBL:{x:416,y:518}, sacBR:{x:484,y:518},
  rootTL:{x:404,y:568}, rootTR:{x:496,y:568}, rootBR:{x:496,y:640},
};

const PORT_SPEC: Record<number, EdgeSpec> = {
  64:{a:P.headBL,b:P.headBR,t:0.18}, 61:{a:P.headBL,b:P.headBR,t:0.50}, 63:{a:P.headBL,b:P.headBR,t:0.82},
  47:{a:P.ajnaTL,b:P.ajnaTR,t:0.18}, 24:{a:P.ajnaTL,b:P.ajnaTR,t:0.50}, 4:{a:P.ajnaTL,b:P.ajnaTR,t:0.82},
  17:{a:P.ajnaTL,b:P.ajnaB,t:0.25}, 43:{a:P.ajnaTL,b:P.ajnaB,t:1.00}, 11:{a:P.ajnaTR,b:P.ajnaB,t:0.25},

  62:{a:P.throatTL,b:P.throatTR,t:0.18}, 23:{a:P.throatTL,b:P.throatTR,t:0.50}, 56:{a:P.throatTL,b:P.throatTR,t:0.82},
  16:{a:P.throatTL,b:P.throatBL,t:0.18}, 20:{a:P.throatTL,b:P.throatBL,t:0.72},
  45:{a:P.throatTR,b:P.throatBR,t:0.18}, 12:{a:P.throatTR,b:P.throatBR,t:0.48}, 35:{a:P.throatTR,b:P.throatBR,t:0.78},
  31:{a:P.throatBL,b:P.throatBR,t:0.18}, 8:{a:P.throatBL,b:P.throatBR,t:0.50}, 33:{a:P.throatBL,b:P.throatBR,t:0.82},

  7:{a:P.gT,b:P.gR,t:0.12}, 13:{a:P.gT,b:P.gR,t:0.62}, 25:{a:P.gT,b:P.gR,t:0.92},
  46:{a:P.gR,b:P.gB,t:0.62}, 15:{a:P.gR,b:P.gB,t:1.00},
  2:{a:P.gB,b:P.gL,t:0.62}, 10:{a:P.gB,b:P.gL,t:0.95}, 1:{a:P.gL,b:P.gT,t:0.45},

  21:{a:P.egoT,b:P.egoBL,t:0.10}, 51:{a:P.egoT,b:P.egoBL,t:0.55},
  26:{a:P.egoBL,b:P.egoBR,t:0.22}, 40:{a:P.egoBL,b:P.egoBR,t:0.82},

  48:{a:P.splTop,b:P.splTip,t:0.20}, 57:{a:P.splTop,b:P.splTip,t:0.43}, 44:{a:P.splTop,b:P.splTip,t:0.68},
  50:{a:P.splTop,b:P.splTip,t:0.88}, 32:{a:P.splTip,b:P.splBot,t:0.30}, 18:{a:P.splTip,b:P.splBot,t:0.56}, 28:{a:P.splTip,b:P.splBot,t:0.84},

  36:{a:P.solTop,b:P.solTip,t:0.20}, 22:{a:P.solTop,b:P.solTip,t:0.43}, 37:{a:P.solTop,b:P.solTip,t:0.68},
  6:{a:P.solTop,b:P.solTip,t:0.88}, 49:{a:P.solTip,b:P.solBot,t:0.30}, 55:{a:P.solTip,b:P.solBot,t:0.56}, 30:{a:P.solTip,b:P.solBot,t:0.84},

  5:{a:P.sacTL,b:P.sacTR,t:0.18}, 14:{a:P.sacTL,b:P.sacTR,t:0.50}, 29:{a:P.sacTL,b:P.sacTR,t:0.82},
  34:{a:P.sacTL,b:P.sacBL,t:0.20}, 27:{a:P.sacTL,b:P.sacBL,t:0.50}, 59:{a:P.sacTL,b:P.sacBL,t:0.82},
  3:{a:P.sacBL,b:P.sacBR,t:0.18}, 9:{a:P.sacBL,b:P.sacBR,t:0.50}, 42:{a:P.sacBL,b:P.sacBR,t:0.82},

  54:{a:P.rootTL,b:P.rootTR,t:0.08}, 58:{a:P.rootTL,b:P.rootTR,t:0.22}, 38:{a:P.rootTL,b:P.rootTR,t:0.36},
  60:{a:P.rootTL,b:P.rootTR,t:0.50}, 52:{a:P.rootTL,b:P.rootTR,t:0.64}, 53:{a:P.rootTL,b:P.rootTR,t:0.78}, 19:{a:P.rootTL,b:P.rootTR,t:0.92},
  39:{a:P.rootTR,b:P.rootBR,t:0.35}, 41:{a:P.rootTR,b:P.rootBR,t:0.80},
};

const GATE: Record<number, Point> = Object.fromEntries(
  Object.entries(PORT_SPEC).map(([g,s])=>[Number(g),edgePoint(s)])
) as Record<number,Point>;

function canonical(a:number,b:number){return `${Math.min(a,b)}-${Math.max(a,b)}`;}

function gateSource(gate:number, personality:Set<number>, design:Set<number>):GateSource{
  const p=personality.has(gate); const d=design.has(gate);
  if(p&&d)return "both";
  if(p)return "personality";
  if(d)return "design";
  return "inactive";
}

/*
 * Rail routing is separate from port ownership, but every route begins/ends at
 * the shared port. Long families use fixed corridors to reduce collisions.
 */
const ROUTE: Record<string, (a:Point,b:Point)=>Point[]> = {
  "16-48":(a,b)=>[a,{x:398,y:342},{x:388,y:404},b],
  "20-57":(a,b)=>[a,{x:402,y:346},{x:393,y:414},b],
  "20-34":(a,b)=>[a,{x:405,y:360},{x:408,y:420},b],
  "35-36":(a,b)=>[a,{x:495,y:350},{x:503,y:414},b],
  "12-22":(a,b)=>[a,{x:499,y:346},{x:507,y:414},b],
  "21-45":(a,b)=>[a,{x:498,y:244},b],
  "26-44":(a,b)=>[a,{x:475,y:404},{x:422,y:442},b],
  "6-59":(a,b)=>[a,{x:523,y:486},{x:488,y:500},b],
  "32-54":(a,b)=>[a,{x:350,y:526},{x:386,y:552},b],
  "18-58":(a,b)=>[a,{x:356,y:536},{x:394,y:558},b],
  "28-38":(a,b)=>[a,{x:362,y:546},{x:400,y:562},b],
  "19-49":(a,b)=>[a,{x:514,y:552},{x:548,y:522},b],
  "39-55":(a,b)=>[a,{x:525,y:572},{x:558,y:542},b],
  "30-41":(a,b)=>[a,{x:540,y:600},{x:575,y:560},b],
  "3-60":(a,b)=>[a,{x:434,y:540},b],
  "9-52":(a,b)=>[a,{x:450,y:540},b],
  "42-53":(a,b)=>[a,{x:466,y:540},b],
};

function channelPoints(a:number,b:number):Point[]{
  const p1=GATE[a], p2=GATE[b];
  if(!p1||!p2)return [];
  const id=canonical(a,b);
  const fn=ROUTE[id];
  return fn?fn(p1,p2):[p1,p2];
}

function polylineD(points:Point[]){
  if(!points.length)return "";
  return `M ${points.map((p,i)=>`${i?"L ":""}${p.x} ${p.y}`).join(" ")}`;
}

function renderCenter(center:CenterId, defined:boolean){
  const s=SHAPES[center];
  const common={fill:defined?CENTER_FILL[center]:"#fff",stroke:"#171720",strokeWidth:2.6};
  if(s.kind==="rect") return <rect x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx} {...common}/>;
  return <polygon points={s.points.map(p=>`${p.x},${p.y}`).join(" ")} {...common}/>;
}

function GateLabel({gate,source}:{gate:number;source:GateSource}){
  const p=GATE[gate];
  if(!p)return null;
  const fill=source==="design"?"#d64a42":source==="both"?"#9d3833":source==="personality"?"#171720":"#67635d";
  return <g>
    <circle cx={p.x} cy={p.y} r="5.4" fill="#fbfaf7" opacity="0.99"/>
    <text x={p.x} y={p.y+2.35} textAnchor="middle" fontSize="6.8" fontWeight="900" fill={fill}>{gate}</text>
  </g>;
}

function activeStroke(source:GateSource){ return source==="design"?"#d64a42":"#171720"; }

function ActivePath({d,aSource,bSource}:{d:string;aSource:GateSource;bSource:GateSource}){
  if(!d || (aSource==="inactive"&&bSource==="inactive"))return null;
  return <g>
    {aSource!=="inactive"&&<path d={d} pathLength={100} fill="none" stroke={activeStroke(aSource)} strokeWidth="5.2" strokeLinecap="butt" strokeLinejoin="round" strokeDasharray="50 50"/>}
    {bSource!=="inactive"&&<path d={d} pathLength={100} fill="none" stroke={activeStroke(bSource)} strokeWidth="5.2" strokeLinecap="butt" strokeLinejoin="round" strokeDasharray="50 50" strokeDashoffset="-50"/>}
  </g>;
}

function HangingPath({d,source,fromEnd=false}:{d:string;source:GateSource;fromEnd?:boolean}){
  if(!d || source==="inactive")return null;
  return <path d={d} pathLength={100} fill="none" stroke={activeStroke(source)} strokeWidth="5.2" strokeLinecap="butt" strokeLinejoin="round" strokeDasharray="16 84" strokeDashoffset={fromEnd?"-84":"0"}/>;
}

function ActivationPanel({x,title,color,activations,align}:{x:number;title:string;color:string;activations:HumanDesignActivation[];align:"left"|"right"}){
  return <g>
    <text x={x} y="40" textAnchor={align==="left"?"start":"end"} fontSize="15" fontWeight="800" fill={color}>{title}</text>
    {activations.map((a,i)=>{
      const y=65+i*24;
      return <g key={`${title}-${a.body}`}>
        <text x={x} y={y} textAnchor={align==="left"?"start":"end"} fontSize="13" fontWeight="700" fill={color}>{BODY_SYMBOL[a.body]??"•"}</text>
        <text x={x+(align==="left"?20:-20)} y={y} textAnchor={align==="left"?"start":"end"} fontSize="12" fontWeight="700" fill="#24232e">{a.gate}.{a.line}</text>
      </g>;
    })}
  </g>;
}

export function BodyGraph({chart,personalityActivations=[],designActivations=[],width=900}:Props){
  const defined=new Set(chart.centers);
  const activeChannels=new Set(chart.channels.map(id=>{
    const [a,b]=id.split("-").map(Number);
    return canonical(a,b);
  }));
  const personality=new Set(personalityActivations.map(a=>a.gate));
  const design=new Set(designActivations.map(a=>a.gate));

  return <svg viewBox="0 0 900 670" width="100%" style={{maxWidth:width,height:"auto"}} role="img" aria-label="Human Design BodyGraph">
    <rect width="900" height="670" rx="22" fill="#fbfaf7"/>
    <ActivationPanel x={34} title="Design" color="#d84238" activations={designActivations} align="left"/>
    <ActivationPanel x={866} title="Personality" color="#191820" activations={personalityActivations} align="right"/>

    <g>
      {CHANNELS.map(c=>{
        const id=canonical(c.gateA,c.gateB);
        const d=polylineD(channelPoints(c.gateA,c.gateB));
        if(!d)return null;
        return <g key={`rail-${id}`}>
          <path d={d} fill="none" stroke="#fbfaf7" strokeWidth="5.4" strokeLinejoin="round"/>
          <path d={d} fill="none" stroke="#aaa69f" strokeWidth="1.45" strokeLinejoin="round" opacity="0.82"/>
        </g>;
      })}
    </g>

    <g>
      {CHANNELS.map(c=>{
        const id=canonical(c.gateA,c.gateB);
        const d=polylineD(channelPoints(c.gateA,c.gateB));
        const sa=gateSource(c.gateA,personality,design);
        const sb=gateSource(c.gateB,personality,design);
        if(activeChannels.has(id)) return <ActivePath key={`active-${id}`} d={d} aSource={sa} bSource={sb}/>;
        return <g key={`hang-${id}`}>
          <HangingPath d={d} source={sa}/>
          <HangingPath d={d} source={sb} fromEnd/>
        </g>;
      })}
    </g>

    <g>
      {(Object.keys(SHAPES) as CenterId[]).map(center=><g key={center}>
        {renderCenter(center,defined.has(center))}
        <text x={CENTER_LABEL[center].x} y={CENTER_LABEL[center].y+4} textAnchor="middle" fontSize="13.2" fontWeight="800" fill="#191820">{center==="Solar Plexus"?"Solar":center}</text>
      </g>)}
    </g>

    <g>
      {Object.keys(GATE).map(g=>{
        const gate=Number(g);
        return <GateLabel key={gate} gate={gate} source={gateSource(gate,personality,design)}/>;
      })}
    </g>

    <g transform="translate(450 657)">
      <rect x="-220" y="-18" width="440" height="27" rx="13.5" fill="#fff" stroke="#ddd8cf"/>
      <text x="0" y="0" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#5a5650">{chart.type} · {chart.authority} · {chart.profile} · {chart.definition}</text>
    </g>
  </svg>;
}
