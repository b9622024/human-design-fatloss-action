"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "MAIA-REFERENCE-1.0";

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
 * MAIA reference geometry
 * -----------------------
 * This is the single source of truth for the visual BodyGraph. Nothing below
 * is derived from center dimensions at render time. Centers, 64 gate anchors
 * and 36 channel rails are authored together against one fixed coordinate
 * system, so changing activation never changes geometry.
 */
const SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 42 }, { x: 412, y: 108 }, { x: 488, y: 108 }] },
  Ajna: { kind: "polygon", points: [{ x: 412, y: 132 }, { x: 488, y: 132 }, { x: 450, y: 198 }] },
  Throat: { kind: "rect", x: 410, y: 226, width: 80, height: 74, rx: 4 },
  G: { kind: "polygon", points: [{ x: 450, y: 322 }, { x: 484, y: 356 }, { x: 450, y: 390 }, { x: 416, y: 356 }] },
  Ego: { kind: "polygon", points: [{ x: 510, y: 332 }, { x: 495, y: 382 }, { x: 535, y: 382 }] },
  Spleen: { kind: "polygon", points: [{ x: 320, y: 406 }, { x: 392, y: 456 }, { x: 320, y: 506 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 580, y: 406 }, { x: 508, y: 456 }, { x: 580, y: 506 }] },
  Sacral: { kind: "rect", x: 414, y: 430, width: 72, height: 78, rx: 4 },
  Root: { kind: "rect", x: 404, y: 548, width: 92, height: 80, rx: 4 },
};

const CENTER_LABEL: Record<CenterId, Point> = {
  Head: { x: 450, y: 78 },
  Ajna: { x: 450, y: 164 },
  Throat: { x: 450, y: 265 },
  G: { x: 450, y: 362 },
  Ego: { x: 515, y: 365 },
  Spleen: { x: 350, y: 458 },
  "Solar Plexus": { x: 550, y: 458 },
  Sacral: { x: 450, y: 472 },
  Root: { x: 450, y: 594 },
};

/* Gate labels are deliberately spaced along the actual center edges. */
const GATE: Record<number, Point> = {
  64:{x:425,y:105},61:{x:450,y:105},63:{x:475,y:105},
  47:{x:425,y:135},24:{x:450,y:135},4:{x:475,y:135},17:{x:422,y:154},43:{x:450,y:194},11:{x:478,y:154},

  62:{x:426,y:231},23:{x:450,y:231},56:{x:474,y:231},16:{x:414,y:245},20:{x:414,y:278},45:{x:486,y:245},12:{x:486,y:263},35:{x:486,y:283},31:{x:426,y:295},8:{x:450,y:295},33:{x:474,y:295},

  7:{x:450,y:327},1:{x:432,y:343},13:{x:468,y:343},10:{x:418,y:356},25:{x:482,y:356},2:{x:433,y:374},46:{x:467,y:374},15:{x:450,y:387},

  21:{x:508,y:342},51:{x:499,y:356},26:{x:501,y:378},40:{x:528,y:378},

  /* Spleen: ordered from the upper inner edge around the perimeter. */
  48:{x:386,y:442},57:{x:376,y:449},44:{x:366,y:456},50:{x:356,y:463},32:{x:345,y:471},18:{x:333,y:481},28:{x:322,y:497},

  /* Solar Plexus mirrors the same spacing. */
  36:{x:514,y:442},22:{x:524,y:449},37:{x:534,y:456},6:{x:544,y:463},49:{x:555,y:471},55:{x:567,y:481},30:{x:578,y:497},

  5:{x:428,y:435},14:{x:450,y:435},29:{x:472,y:435},34:{x:418,y:448},27:{x:418,y:470},59:{x:418,y:494},3:{x:428,y:503},9:{x:450,y:503},42:{x:472,y:503},

  /* Root top edge uses seven equal slots, matching the reference topology. */
  54:{x:414,y:553},58:{x:426,y:553},38:{x:438,y:553},60:{x:450,y:553},52:{x:462,y:553},53:{x:474,y:553},19:{x:486,y:553},39:{x:491,y:579},41:{x:491,y:611},
};

/*
 * Fixed rail corridors. Every channel has an authored route. The routes are
 * intentionally lane-based around the central stack instead of shortest-path
 * connections, which keeps the major channel families visually separated.
 */
const CHANNEL_PATH: Record<string, string> = {
  "47-64":"M425 108 L425 132",
  "24-61":"M450 108 L450 132",
  "4-63":"M475 108 L475 132",
  "17-62":"M422 160 L422 216 L426 226",
  "23-43":"M450 198 L450 226",
  "11-56":"M478 160 L478 216 L474 226",

  "16-48":"M410 245 L396 322 L386 442",
  "20-57":"M410 278 L400 334 L390 395 L376 449",
  "10-20":"M410 278 L410 318 L418 356",
  "20-34":"M410 278 L398 340 L402 405 L414 448",
  "12-22":"M490 263 L500 330 L506 394 L524 449",
  "35-36":"M490 283 L503 345 L508 400 L514 442",
  "21-45":"M490 245 L502 245 L508 342",

  "7-31":"M426 300 L438 314 L450 322",
  "8-1":"M450 300 L444 324 L432 343",
  "13-33":"M474 300 L463 316 L468 343",

  "2-14":"M433 374 L433 409 L450 430",
  "5-15":"M428 430 L438 410 L450 390",
  "29-46":"M472 430 L466 408 L467 374",
  "10-34":"M418 356 L406 392 L414 448",
  "34-57":"M414 448 L395 448 L376 449",
  "27-50":"M414 470 L384 470 L356 463",

  /* Left root family is fanned into three parallel lanes. */
  "32-54":"M345 471 L362 505 L382 530 L414 548",
  "18-58":"M333 481 L356 516 L388 538 L426 548",
  "28-38":"M322 497 L350 528 L392 545 L438 548",

  /* Sacral-to-root family remains vertical and parallel. */
  "3-60":"M428 508 L438 528 L450 548",
  "9-52":"M450 508 L456 528 L462 548",
  "42-53":"M472 508 L474 528 L474 548",

  /* Right root family is symmetrically fanned. */
  "19-49":"M486 548 L518 530 L540 500 L555 471",
  "39-55":"M496 579 L528 545 L552 514 L567 481",
  "30-41":"M496 611 L540 566 L560 532 L578 497",

  "25-51":"M482 356 L493 356 L499 356",
  "26-44":"M501 378 L470 405 L420 438 L366 456",
  "37-40":"M528 378 L535 414 L534 456",
  "10-57":"M418 356 L402 400 L376 449",
  "6-59":"M418 494 L450 491 L505 480 L544 463",
};

function canonical(a:number,b:number){return `${Math.min(a,b)}-${Math.max(a,b)}`;}

function gateSource(gate:number, personality:Set<number>, design:Set<number>):GateSource{
  const p=personality.has(gate); const d=design.has(gate);
  if(p&&d)return "both"; if(p)return "personality"; if(d)return "design"; return "inactive";
}

function renderCenter(center:CenterId, defined:boolean){
  const s=SHAPES[center];
  const common={fill:defined?CENTER_FILL[center]:"#fff",stroke:"#171720",strokeWidth:2.5};
  if(s.kind==="rect") return <rect x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx} {...common}/>;
  return <polygon points={s.points.map(p=>`${p.x},${p.y}`).join(" ")} {...common}/>;
}

function GateLabel({gate,source}:{gate:number;source:GateSource}){
  const p=GATE[gate]; if(!p)return null;
  const fill=source==="design"?"#d64a42":source==="both"?"#9d3833":source==="personality"?"#171720":"#6d6963";
  return <g>
    <circle cx={p.x} cy={p.y} r="5.3" fill="#fbfaf7" opacity="0.99"/>
    <text x={p.x} y={p.y+2.35} textAnchor="middle" fontSize="6.6" fontWeight="900" fill={fill}>{gate}</text>
  </g>;
}

function activeStroke(source:GateSource){
  return source==="design"?"#d64a42":"#171720";
}

function ActivePath({d,aSource,bSource}:{d:string;aSource:GateSource;bSource:GateSource}){
  if(aSource==="inactive"&&bSource==="inactive")return null;
  return <g>
    {aSource!=="inactive"&&<path d={d} pathLength={100} fill="none" stroke={activeStroke(aSource)} strokeWidth="5.2" strokeLinecap="butt" strokeLinejoin="round" strokeDasharray="50 50"/>}
    {bSource!=="inactive"&&<path d={d} pathLength={100} fill="none" stroke={activeStroke(bSource)} strokeWidth="5.2" strokeLinecap="butt" strokeLinejoin="round" strokeDasharray="50 50" strokeDashoffset="-50"/>}
  </g>;
}

function HangingPath({d,source,fromEnd=false}:{d:string;source:GateSource;fromEnd?:boolean}){
  if(source==="inactive")return null;
  return <path d={d} pathLength={100} fill="none" stroke={activeStroke(source)} strokeWidth="5.2" strokeLinecap="butt" strokeLinejoin="round" strokeDasharray="18 82" strokeDashoffset={fromEnd?"-82":"0"}/>;
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

  return <svg viewBox="0 0 900 660" width="100%" style={{maxWidth:width,height:"auto"}} role="img" aria-label="Human Design BodyGraph">
    <rect width="900" height="660" rx="22" fill="#fbfaf7"/>
    <ActivationPanel x={34} title="Design" color="#d84238" activations={designActivations} align="left"/>
    <ActivationPanel x={866} title="Personality" color="#191820" activations={personalityActivations} align="right"/>

    {/* Background channel map. White underlay keeps crossings visually legible. */}
    <g>
      {CHANNELS.map(c=>{
        const id=canonical(c.gateA,c.gateB); const d=CHANNEL_PATH[id]; if(!d)return null;
        return <g key={`rail-${id}`}>
          <path d={d} fill="none" stroke="#fbfaf7" strokeWidth="5.8" strokeLinecap="butt" strokeLinejoin="round"/>
          <path d={d} fill="none" stroke="#a9a59e" strokeWidth="1.45" strokeLinecap="butt" strokeLinejoin="round" opacity="0.9"/>
        </g>;
      })}
    </g>

    {/* Activation paint is independent from the geometry. */}
    <g>
      {CHANNELS.map(c=>{
        const id=canonical(c.gateA,c.gateB); const d=CHANNEL_PATH[id]; if(!d)return null;
        const sa=gateSource(c.gateA,personality,design); const sb=gateSource(c.gateB,personality,design);
        if(activeChannels.has(id)) return <ActivePath key={`active-${id}`} d={d} aSource={sa} bSource={sb}/>;
        return <g key={`hang-${id}`}><HangingPath d={d} source={sa}/><HangingPath d={d} source={sb} fromEnd/></g>;
      })}
    </g>

    <g>
      {(Object.keys(SHAPES) as CenterId[]).map(center=><g key={center}>
        {renderCenter(center,defined.has(center))}
        <text x={CENTER_LABEL[center].x} y={CENTER_LABEL[center].y+4} textAnchor="middle" fontSize="13.5" fontWeight="800" fill="#191820">{center==="Solar Plexus"?"Solar":center}</text>
      </g>)}
    </g>

    <g>{Object.keys(GATE).map(g=>{const gate=Number(g);return <GateLabel key={gate} gate={gate} source={gateSource(gate,personality,design)}/>;})}</g>

    <g transform="translate(450 646)">
      <rect x="-220" y="-18" width="440" height="27" rx="13.5" fill="#fff" stroke="#ddd8cf"/>
      <text x="0" y="0" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#5a5650">{chart.type} · {chart.authority} · {chart.profile} · {chart.definition}</text>
    </g>
  </svg>;
}
