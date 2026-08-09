"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "GATE-PORT-1.0";

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
 * GATE-PORT 1.0
 * -------------
 * A gate has exactly ONE geometry point. That point is simultaneously:
 *   1. the label anchor,
 *   2. the channel endpoint,
 *   3. the center-boundary port.
 * No channel owns an independent start/end coordinate anymore.
 */
const SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 44 }, { x: 408, y: 116 }, { x: 492, y: 116 }] },
  Ajna: { kind: "polygon", points: [{ x: 408, y: 144 }, { x: 492, y: 144 }, { x: 450, y: 214 }] },
  Throat: { kind: "rect", x: 406, y: 242, width: 88, height: 82, rx: 4 },
  G: { kind: "polygon", points: [{ x: 450, y: 348 }, { x: 492, y: 390 }, { x: 450, y: 432 }, { x: 408, y: 390 }] },
  Ego: { kind: "polygon", points: [{ x: 518, y: 352 }, { x: 500, y: 405 }, { x: 548, y: 405 }] },
  Spleen: { kind: "polygon", points: [{ x: 285, y: 430 }, { x: 392, y: 492 }, { x: 285, y: 554 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 615, y: 430 }, { x: 508, y: 492 }, { x: 615, y: 554 }] },
  Sacral: { kind: "rect", x: 408, y: 470, width: 84, height: 86, rx: 4 },
  Root: { kind: "rect", x: 394, y: 590, width: 112, height: 78, rx: 4 },
};

const CENTER_LABEL: Record<CenterId, Point> = {
  Head: { x: 450, y: 84 },
  Ajna: { x: 450, y: 178 },
  Throat: { x: 450, y: 287 },
  G: { x: 450, y: 396 },
  Ego: { x: 521, y: 389 },
  Spleen: { x: 330, y: 497 },
  "Solar Plexus": { x: 570, y: 497 },
  Sacral: { x: 450, y: 518 },
  Root: { x: 450, y: 636 },
};

/*
 * Fixed MAIA-like gate ports.
 * Every point is on (or immediately inside) the visible center boundary.
 */
const GATE: Record<number, Point> = {
  // Head bottom edge
  64:{x:423,y:113}, 61:{x:450,y:113}, 63:{x:477,y:113},

  // Ajna top / side / bottom
  47:{x:423,y:147}, 24:{x:450,y:147}, 4:{x:477,y:147},
  17:{x:417,y:160}, 11:{x:483,y:160}, 43:{x:450,y:210},

  // Throat boundary
  62:{x:425,y:245}, 23:{x:450,y:245}, 56:{x:475,y:245},
  16:{x:409,y:258}, 20:{x:409,y:301},
  45:{x:491,y:258}, 12:{x:491,y:279}, 35:{x:491,y:301},
  31:{x:425,y:321}, 8:{x:450,y:321}, 33:{x:475,y:321},

  // G boundary clockwise from top
  7:{x:450,y:351}, 1:{x:424,y:374}, 13:{x:476,y:374},
  10:{x:411,y:390}, 25:{x:489,y:390}, 2:{x:426,y:416},
  46:{x:474,y:416}, 15:{x:450,y:429},

  // Ego boundary
  21:{x:516,y:356}, 51:{x:504,y:384}, 26:{x:505,y:402}, 40:{x:542,y:402},

  // Spleen: gates distributed along the two diagonal edges, not clustered at the tip
  48:{x:381,y:458}, 57:{x:369,y:466}, 44:{x:357,y:473}, 50:{x:345,y:480},
  32:{x:326,y:505}, 18:{x:306,y:519}, 28:{x:288,y:548},

  // Solar Plexus: mirrored distribution
  36:{x:519,y:458}, 22:{x:531,y:466}, 37:{x:543,y:473}, 6:{x:555,y:480},
  49:{x:574,y:505}, 55:{x:594,y:519}, 30:{x:612,y:548},

  // Sacral boundary
  5:{x:426,y:473}, 14:{x:450,y:473}, 29:{x:474,y:473},
  34:{x:411,y:487}, 27:{x:411,y:511}, 59:{x:411,y:542},
  3:{x:426,y:553}, 9:{x:450,y:553}, 42:{x:474,y:553},

  // Root top edge + right edge
  54:{x:402,y:593}, 58:{x:418,y:593}, 38:{x:434,y:593}, 60:{x:450,y:593},
  52:{x:466,y:593}, 53:{x:482,y:593}, 19:{x:498,y:593},
  39:{x:503,y:620}, 41:{x:503,y:652},
};

function canonical(a:number,b:number){return `${Math.min(a,b)}-${Math.max(a,b)}`;}

function gateSource(gate:number, personality:Set<number>, design:Set<number>):GateSource{
  const p=personality.has(gate); const d=design.has(gate);
  if(p&&d)return "both";
  if(p)return "personality";
  if(d)return "design";
  return "inactive";
}

function channelPath(a:number,b:number){
  const p1=GATE[a];
  const p2=GATE[b];
  if(!p1||!p2)return "";
  return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
}

function renderCenter(center:CenterId, defined:boolean){
  const s=SHAPES[center];
  const common={fill:defined?CENTER_FILL[center]:"#fff",stroke:"#171720",strokeWidth:2.7};
  if(s.kind==="rect") return <rect x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx} {...common}/>;
  return <polygon points={s.points.map(p=>`${p.x},${p.y}`).join(" ")} {...common}/>;
}

function GateLabel({gate,source}:{gate:number;source:GateSource}){
  const p=GATE[gate];
  if(!p)return null;
  const fill=source==="design"?"#d64a42":source==="both"?"#9d3833":source==="personality"?"#171720":"#6d6963";
  return <g>
    <circle cx={p.x} cy={p.y} r="5.8" fill="#fbfaf7" opacity="0.99"/>
    <text x={p.x} y={p.y+2.5} textAnchor="middle" fontSize="7" fontWeight="900" fill={fill}>{gate}</text>
  </g>;
}

function activeStroke(source:GateSource){
  return source==="design"?"#d64a42":"#171720";
}

function ActivePath({d,aSource,bSource}:{d:string;aSource:GateSource;bSource:GateSource}){
  if(!d || (aSource==="inactive"&&bSource==="inactive"))return null;
  return <g>
    {aSource!=="inactive"&&<path d={d} pathLength={100} fill="none" stroke={activeStroke(aSource)} strokeWidth="5.4" strokeLinecap="butt" strokeDasharray="50 50"/>}
    {bSource!=="inactive"&&<path d={d} pathLength={100} fill="none" stroke={activeStroke(bSource)} strokeWidth="5.4" strokeLinecap="butt" strokeDasharray="50 50" strokeDashoffset="-50"/>}
  </g>;
}

function HangingPath({d,source,fromEnd=false}:{d:string;source:GateSource;fromEnd?:boolean}){
  if(!d || source==="inactive")return null;
  return <path d={d} pathLength={100} fill="none" stroke={activeStroke(source)} strokeWidth="5.4" strokeLinecap="butt" strokeDasharray="18 82" strokeDashoffset={fromEnd?"-82":"0"}/>;
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

  return <svg viewBox="0 0 900 700" width="100%" style={{maxWidth:width,height:"auto"}} role="img" aria-label="Human Design BodyGraph">
    <rect width="900" height="700" rx="22" fill="#fbfaf7"/>
    <ActivationPanel x={34} title="Design" color="#d84238" activations={designActivations} align="left"/>
    <ActivationPanel x={866} title="Personality" color="#191820" activations={personalityActivations} align="right"/>

    {/* Every rail starts and ends at the exact same points used by gate labels. */}
    <g>
      {CHANNELS.map(c=>{
        const d=channelPath(c.gateA,c.gateB);
        const id=canonical(c.gateA,c.gateB);
        if(!d)return null;
        return <g key={`rail-${id}`}>
          <path d={d} fill="none" stroke="#fbfaf7" strokeWidth="5.8" strokeLinecap="butt"/>
          <path d={d} fill="none" stroke="#aaa69f" strokeWidth="1.55" strokeLinecap="butt" opacity="0.88"/>
        </g>;
      })}
    </g>

    <g>
      {CHANNELS.map(c=>{
        const id=canonical(c.gateA,c.gateB);
        const d=channelPath(c.gateA,c.gateB);
        const sa=gateSource(c.gateA,personality,design);
        const sb=gateSource(c.gateB,personality,design);
        if(activeChannels.has(id)) return <ActivePath key={`active-${id}`} d={d} aSource={sa} bSource={sb}/>;
        return <g key={`hang-${id}`}>
          <HangingPath d={d} source={sa}/>
          <HangingPath d={d} source={sb} fromEnd/>
        </g>;
      })}
    </g>

    {/* Centers are painted above rails, so only the intended boundary ports remain visible. */}
    <g>
      {(Object.keys(SHAPES) as CenterId[]).map(center=><g key={center}>
        {renderCenter(center,defined.has(center))}
        <text x={CENTER_LABEL[center].x} y={CENTER_LABEL[center].y+4} textAnchor="middle" fontSize="13.5" fontWeight="800" fill="#191820">{center==="Solar Plexus"?"Solar":center}</text>
      </g>)}
    </g>

    {/* Labels are always last, keeping gate numbers readable and attached to ports. */}
    <g>
      {Object.keys(GATE).map(g=>{
        const gate=Number(g);
        return <GateLabel key={gate} gate={gate} source={gateSource(gate,personality,design)}/>;
      })}
    </g>

    <g transform="translate(450 686)">
      <rect x="-220" y="-18" width="440" height="27" rx="13.5" fill="#fff" stroke="#ddd8cf"/>
      <text x="0" y="0" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#5a5650">{chart.type} · {chart.authority} · {chart.profile} · {chart.definition}</text>
    </g>
  </svg>;
}
