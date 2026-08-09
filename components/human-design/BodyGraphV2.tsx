"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "REFERENCE-MAPPED-1.0";

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

const BODY_SYMBOL: Record<string, string> = {
  Sun: "☉", Earth: "⊕", Moon: "☽", NorthNode: "☊", SouthNode: "☋",
  Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
  Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

const CENTER_FILL: Record<CenterId, string> = {
  Head: "#f2df68",
  Ajna: "#8cb9a6",
  Throat: "#b18d61",
  G: "#f0df69",
  Ego: "#ffffff",
  Spleen: "#ffffff",
  "Solar Plexus": "#ffffff",
  Sacral: "#ce6963",
  Root: "#b98762",
};

/*
 * Reference-Mapped 1.0
 * --------------------
 * The visual layer is now authored independently from chart calculation.
 * 1) centers use a fixed reference skeleton;
 * 2) every gate owns a fixed anchor;
 * 3) every channel owns an explicit SVG route;
 * 4) activation only changes stroke colour/visibility, never geometry.
 *
 * This intentionally replaces the former "connect two gate points with a
 * straight line" renderer, which produced unavoidable intersections.
 */
const SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 46 }, { x: 408, y: 118 }, { x: 492, y: 118 }] },
  Ajna: { kind: "polygon", points: [{ x: 408, y: 142 }, { x: 492, y: 142 }, { x: 450, y: 210 }] },
  Throat: { kind: "rect", x: 408, y: 238, width: 84, height: 78, rx: 4 },
  G: { kind: "polygon", points: [{ x: 450, y: 336 }, { x: 488, y: 374 }, { x: 450, y: 412 }, { x: 412, y: 374 }] },
  Ego: { kind: "polygon", points: [{ x: 520, y: 348 }, { x: 502, y: 398 }, { x: 548, y: 398 }] },
  Spleen: { kind: "polygon", points: [{ x: 306, y: 402 }, { x: 392, y: 456 }, { x: 306, y: 510 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 594, y: 402 }, { x: 508, y: 456 }, { x: 594, y: 510 }] },
  Sacral: { kind: "rect", x: 410, y: 438, width: 80, height: 82, rx: 4 },
  Root: { kind: "rect", x: 405, y: 554, width: 90, height: 82, rx: 4 },
};

const CENTER_LABEL: Record<CenterId, Point> = {
  Head: { x: 450, y: 84 },
  Ajna: { x: 450, y: 174 },
  Throat: { x: 450, y: 279 },
  G: { x: 450, y: 380 },
  Ego: { x: 526, y: 382 },
  Spleen: { x: 342, y: 460 },
  "Solar Plexus": { x: 558, y: 460 },
  Sacral: { x: 450, y: 482 },
  Root: { x: 450, y: 600 },
};

/* Gate label anchors. These are visual slots, not channel routing points. */
const GATE: Record<number, Point> = {
  64:{x:422,y:114},61:{x:450,y:114},63:{x:478,y:114},
  47:{x:422,y:147},24:{x:450,y:147},4:{x:478,y:147},17:{x:420,y:166},43:{x:450,y:205},11:{x:480,y:166},
  62:{x:425,y:244},23:{x:450,y:244},56:{x:475,y:244},16:{x:413,y:258},20:{x:413,y:294},45:{x:487,y:258},12:{x:487,y:277},35:{x:487,y:297},31:{x:425,y:310},8:{x:450,y:310},33:{x:475,y:310},
  7:{x:450,y:342},1:{x:430,y:356},13:{x:470,y:356},10:{x:416,y:374},25:{x:484,y:374},2:{x:431,y:394},46:{x:469,y:394},15:{x:450,y:407},
  21:{x:516,y:359},51:{x:507,y:377},26:{x:510,y:394},40:{x:541,y:394},
  48:{x:385,y:442},57:{x:391,y:455},44:{x:376,y:465},50:{x:361,y:475},32:{x:345,y:485},18:{x:329,y:495},28:{x:312,y:505},
  36:{x:515,y:442},22:{x:509,y:455},37:{x:524,y:465},6:{x:539,y:475},49:{x:555,y:485},55:{x:571,y:495},30:{x:588,y:505},
  5:{x:426,y:444},14:{x:450,y:444},29:{x:474,y:444},34:{x:416,y:458},27:{x:416,y:480},59:{x:416,y:504},3:{x:426,y:514},9:{x:450,y:514},42:{x:474,y:514},
  54:{x:414,y:560},58:{x:426,y:560},38:{x:438,y:560},60:{x:450,y:560},52:{x:462,y:560},53:{x:474,y:560},19:{x:486,y:560},39:{x:489,y:585},41:{x:489,y:615},
};

/*
 * Explicit channel rails. Each route is hand-authored against the same fixed
 * skeleton so parallel corridors stay parallel and major families do not
 * collapse onto one another.
 */
const CHANNEL_PATH: Record<string, string> = {
  "47-64":"M422 118 L422 142",
  "24-61":"M450 118 L450 142",
  "4-63":"M478 118 L478 142",
  "17-62":"M420 176 L420 232 L425 238",
  "23-43":"M450 210 L450 238",
  "11-56":"M480 176 L480 232 L475 238",

  "16-48":"M408 258 L385 442",
  "20-57":"M408 292 L398 362 L391 455",
  "10-20":"M408 292 L408 338 L416 374",
  "20-34":"M408 292 L397 366 L397 438 L410 458",
  "12-22":"M492 277 L503 360 L509 455",
  "35-36":"M492 297 L508 370 L515 442",
  "21-45":"M492 258 L510 258 L516 359",
  "7-31":"M425 316 L438 330 L450 336",
  "8-1":"M450 316 L444 337 L430 356",
  "13-33":"M475 316 L462 330 L470 356",

  "2-14":"M431 394 L431 428 L450 438",
  "5-15":"M426 438 L438 426 L450 412",
  "29-46":"M474 438 L466 426 L469 394",
  "10-34":"M416 374 L403 404 L410 458",
  "34-57":"M410 458 L400 458 L391 455",
  "27-50":"M410 480 L385 480 L361 475",

  "32-54":"M345 485 L365 520 L414 554",
  "18-58":"M329 495 L365 535 L426 554",
  "28-38":"M312 505 L360 547 L438 554",
  "3-60":"M426 520 L438 538 L450 554",
  "9-52":"M450 520 L456 538 L462 554",
  "42-53":"M474 520 L474 538 L474 554",

  "19-49":"M486 554 L520 532 L555 485",
  "39-55":"M495 585 L532 548 L571 495",
  "30-41":"M495 615 L548 570 L588 505",

  "25-51":"M484 374 L496 374 L507 377",
  "26-44":"M510 394 L470 430 L420 452 L376 465",
  "37-40":"M541 394 L545 430 L524 465",
  "10-57":"M416 374 L400 410 L391 455",
  "6-59":"M416 504 L450 500 L500 490 L539 475",
};

function canonical(a:number,b:number){return `${Math.min(a,b)}-${Math.max(a,b)}`;}

function gateSource(gate:number, personality:Set<number>, design:Set<number>):GateSource{
  const p=personality.has(gate); const d=design.has(gate);
  if(p&&d)return "both"; if(p)return "personality"; if(d)return "design"; return "inactive";
}

function renderCenter(center:CenterId, defined:boolean){
  const s=SHAPES[center];
  const common={fill:defined?CENTER_FILL[center]:"#fff",stroke:"#171720",strokeWidth:2.6};
  if(s.kind==="rect") return <rect x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx} {...common}/>;
  return <polygon points={s.points.map(p=>`${p.x},${p.y}`).join(" ")} {...common}/>;
}

function GateLabel({gate,source}:{gate:number;source:GateSource}){
  const p=GATE[gate]; if(!p)return null;
  const fill=source==="design"?"#d64a42":source==="both"?"#9d3833":source==="personality"?"#171720":"#68645e";
  return <g>
    <circle cx={p.x} cy={p.y} r="6.5" fill="#fbfaf7" opacity="0.98"/>
    <text x={p.x} y={p.y+2.7} textAnchor="middle" fontSize="7.6" fontWeight="900" fill={fill}>{gate}</text>
  </g>;
}

function ActivePath({d,aSource,bSource}:{d:string;aSource:GateSource;bSource:GateSource}){
  const color=(s:GateSource)=>s==="design"?"#d64a42":"#171720";
  if(aSource==="inactive"&&bSource==="inactive")return null;
  return <g>
    {aSource!=="inactive"&&<path d={d} pathLength={100} fill="none" stroke={color(aSource)} strokeWidth="5.6" strokeLinecap="butt" strokeDasharray="50 50"/>}
    {bSource!=="inactive"&&<path d={d} pathLength={100} fill="none" stroke={color(bSource)} strokeWidth="5.6" strokeLinecap="butt" strokeDasharray="50 50" strokeDashoffset="-50"/>}
  </g>;
}

function HangingPath({d,source,fromEnd=false}:{d:string;source:GateSource;fromEnd?:boolean}){
  if(source==="inactive")return null;
  const stroke=source==="design"?"#d64a42":"#171720";
  return <path d={d} pathLength={100} fill="none" stroke={stroke} strokeWidth="5.6" strokeLinecap="butt" strokeDasharray="17 83" strokeDashoffset={fromEnd?"-83":"0"}/>;
}

function ActivationPanel({x,title,color,activations,align}:{x:number;title:string;color:string;activations:HumanDesignActivation[];align:"left"|"right"}){
  return <g>
    <text x={x} y="40" textAnchor={align==="left"?"start":"end"} fontSize="15" fontWeight="800" fill={color}>{title}</text>
    {activations.map((a,i)=>{const y=65+i*24; return <g key={`${title}-${a.body}`}>
      <text x={x} y={y} textAnchor={align==="left"?"start":"end"} fontSize="13" fontWeight="700" fill={color}>{BODY_SYMBOL[a.body]??"•"}</text>
      <text x={x+(align==="left"?20:-20)} y={y} textAnchor={align==="left"?"start":"end"} fontSize="12" fontWeight="700" fill="#24232e">{a.gate}.{a.line}</text>
    </g>;})}
  </g>;
}

export function BodyGraph({chart,personalityActivations=[],designActivations=[],width=900}:Props){
  const defined=new Set(chart.centers);
  const activeChannels=new Set(chart.channels.map(id=>{const [a,b]=id.split("-").map(Number);return canonical(a,b);}));
  const personality=new Set(personalityActivations.map(a=>a.gate));
  const design=new Set(designActivations.map(a=>a.gate));

  return <svg viewBox="0 0 900 670" width="100%" style={{maxWidth:width,height:"auto"}} role="img" aria-label="Human Design BodyGraph">
    <rect width="900" height="670" rx="22" fill="#fbfaf7"/>
    <ActivationPanel x={34} title="Design" color="#d84238" activations={designActivations} align="left"/>
    <ActivationPanel x={866} title="Personality" color="#191820" activations={personalityActivations} align="right"/>

    {/* Fixed reference rails. */}
    <g>
      {CHANNELS.map(c=>{
        const id=canonical(c.gateA,c.gateB); const d=CHANNEL_PATH[id]; if(!d)return null;
        return <g key={`rail-${id}`}>
          <path d={d} fill="none" stroke="#ffffff" strokeWidth="6.6" strokeLinecap="butt" strokeLinejoin="round"/>
          <path d={d} fill="none" stroke="#b5b1aa" strokeWidth="1.8" strokeLinecap="butt" strokeLinejoin="round"/>
        </g>;
      })}
    </g>

    {/* Activation is paint only; geometry never changes. */}
    <g>
      {CHANNELS.map(c=>{
        const id=canonical(c.gateA,c.gateB); const d=CHANNEL_PATH[id]; if(!d)return null;
        const sa=gateSource(c.gateA,personality,design); const sb=gateSource(c.gateB,personality,design);
        if(activeChannels.has(id)) return <ActivePath key={`active-${id}`} d={d} aSource={sa} bSource={sb}/>;
        return <g key={`hang-${id}`}><HangingPath d={d} source={sa}/><HangingPath d={d} source={sb} fromEnd/></g>;
      })}
    </g>

    {/* Centers sit above rails, exactly like a printed circuit diagram. */}
    <g>
      {(Object.keys(SHAPES) as CenterId[]).map(center=><g key={center}>
        {renderCenter(center,defined.has(center))}
        <text x={CENTER_LABEL[center].x} y={CENTER_LABEL[center].y+4} textAnchor="middle" fontSize="14" fontWeight="800" fill="#191820">{center==="Solar Plexus"?"Solar":center}</text>
      </g>)}
    </g>

    <g>{Object.keys(GATE).map(g=>{const gate=Number(g);return <GateLabel key={gate} gate={gate} source={gateSource(gate,personality,design)}/>;})}</g>

    <g transform="translate(450 652)">
      <rect x="-220" y="-18" width="440" height="27" rx="13.5" fill="#fff" stroke="#ddd8cf"/>
      <text x="0" y="0" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#5a5650">{chart.type} · {chart.authority} · {chart.profile} · {chart.definition}</text>
    </g>
  </svg>;
}
