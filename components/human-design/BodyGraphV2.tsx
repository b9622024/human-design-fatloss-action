"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "REFERENCE-RENDERER-1.0";

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
  Head: "#f2df67",
  Ajna: "#8cb7a5",
  Throat: "#b38f63",
  G: "#f0df67",
  Ego: "#ffffff",
  Spleen: "#ffffff",
  "Solar Plexus": "#ffffff",
  Sacral: "#cd6861",
  Root: "#b98561",
};

/*
 * REFERENCE-RENDERER 1.0
 * ----------------------
 * This is a clean-room renderer that intentionally does NOT reuse the former
 * route/corridor/edge-port machinery.  The visual contract is fixed:
 *   center geometry -> fixed gate anchor -> straight gate-to-gate channel.
 * Gate labels and channel endpoints always share the same anchor.
 */
const SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 44 }, { x: 414, y: 106 }, { x: 486, y: 106 }] },
  Ajna: { kind: "polygon", points: [{ x: 414, y: 126 }, { x: 486, y: 126 }, { x: 450, y: 188 }] },
  Throat: { kind: "rect", x: 414, y: 218, width: 72, height: 76, rx: 4 },
  G: { kind: "polygon", points: [{ x: 450, y: 318 }, { x: 484, y: 352 }, { x: 450, y: 386 }, { x: 416, y: 352 }] },
  Ego: { kind: "polygon", points: [{ x: 503, y: 323 }, { x: 490, y: 368 }, { x: 533, y: 368 }] },
  Spleen: { kind: "polygon", points: [{ x: 302, y: 397 }, { x: 398, y: 454 }, { x: 302, y: 511 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 598, y: 397 }, { x: 502, y: 454 }, { x: 598, y: 511 }] },
  Sacral: { kind: "rect", x: 414, y: 438, width: 72, height: 78, rx: 4 },
  Root: { kind: "rect", x: 402, y: 566, width: 96, height: 76, rx: 4 },
};

const CENTER_LABEL: Record<CenterId, Point> = {
  Head: { x: 450, y: 78 },
  Ajna: { x: 450, y: 158 },
  Throat: { x: 450, y: 258 },
  G: { x: 450, y: 357 },
  Ego: { x: 511, y: 355 },
  Spleen: { x: 340, y: 458 },
  "Solar Plexus": { x: 560, y: 458 },
  Sacral: { x: 450, y: 480 },
  Root: { x: 450, y: 608 },
};

/*
 * Fixed reference gate map.  These anchors are deliberately explicit instead
 * of being inferred from center edges: matching the reference diagram is the
 * goal, and the diagram places gate numbers at visually tuned edge positions.
 */
const GATE: Record<number, Point> = {
  // Head
  64:{x:425,y:106}, 61:{x:450,y:106}, 63:{x:475,y:106},

  // Ajna
  47:{x:425,y:126}, 24:{x:450,y:126}, 4:{x:475,y:126},
  17:{x:419,y:145}, 43:{x:450,y:188}, 11:{x:481,y:145},

  // Throat
  62:{x:427,y:218}, 23:{x:450,y:218}, 56:{x:473,y:218},
  16:{x:414,y:234}, 20:{x:414,y:276},
  45:{x:486,y:234}, 12:{x:486,y:255}, 35:{x:486,y:276},
  31:{x:427,y:294}, 8:{x:450,y:294}, 33:{x:473,y:294},

  // G
  7:{x:450,y:318}, 1:{x:425,y:337}, 13:{x:475,y:337},
  10:{x:416,y:352}, 25:{x:484,y:352}, 2:{x:428,y:374},
  46:{x:472,y:374}, 15:{x:450,y:386},

  // Ego
  21:{x:501,y:329}, 51:{x:493,y:350}, 26:{x:497,y:368}, 40:{x:526,y:368},

  // Spleen: separated around the right-facing tip, matching reference order
  48:{x:380,y:443}, 57:{x:388,y:448}, 44:{x:398,y:454}, 50:{x:386,y:461},
  32:{x:356,y:479}, 18:{x:330,y:495}, 28:{x:304,y:510},

  // Solar Plexus: mirror of Spleen
  36:{x:520,y:443}, 22:{x:512,y:448}, 37:{x:502,y:454}, 6:{x:514,y:461},
  49:{x:544,y:479}, 55:{x:570,y:495}, 30:{x:596,y:510},

  // Sacral
  5:{x:427,y:438}, 14:{x:450,y:438}, 29:{x:473,y:438},
  34:{x:414,y:452}, 27:{x:414,y:476}, 59:{x:414,y:500},
  3:{x:427,y:516}, 9:{x:450,y:516}, 42:{x:473,y:516},

  // Root
  54:{x:408,y:566}, 58:{x:422,y:566}, 38:{x:436,y:566}, 60:{x:450,y:566},
  52:{x:464,y:566}, 53:{x:478,y:566}, 19:{x:492,y:566},
  39:{x:498,y:592}, 41:{x:498,y:625},
};

function canonical(a:number,b:number){ return `${Math.min(a,b)}-${Math.max(a,b)}`; }

function gateSource(gate:number, personality:Set<number>, design:Set<number>):GateSource {
  const p=personality.has(gate); const d=design.has(gate);
  if(p&&d)return "both";
  if(p)return "personality";
  if(d)return "design";
  return "inactive";
}

function renderCenter(center:CenterId, defined:boolean){
  const s=SHAPES[center];
  const common={fill:defined?CENTER_FILL[center]:"#fff",stroke:"#171720",strokeWidth:2.7};
  if(s.kind==="rect") return <rect x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx} {...common}/>;
  return <polygon points={s.points.map(p=>`${p.x},${p.y}`).join(" ")} {...common}/>;
}

function sourceColor(source:GateSource){
  return source==="design"?"#d84a40":source==="both"?"#9c3d39":source==="personality"?"#171720":"#66625d";
}

function GateLabel({gate,source}:{gate:number;source:GateSource}){
  const p=GATE[gate];
  if(!p)return null;
  return <text
    x={p.x}
    y={p.y+2.4}
    textAnchor="middle"
    fontSize="7.2"
    fontWeight="900"
    fill={sourceColor(source)}
    stroke="#fbfaf7"
    strokeWidth="2.4"
    paintOrder="stroke"
  >{gate}</text>;
}

function segment(a:Point,b:Point,t0:number,t1:number){
  return {
    a:{x:a.x+(b.x-a.x)*t0,y:a.y+(b.y-a.y)*t0},
    b:{x:a.x+(b.x-a.x)*t1,y:a.y+(b.y-a.y)*t1},
  };
}

function Line({a,b,stroke,width=5}:{a:Point;b:Point;stroke:string;width?:number}){
  return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth={width} strokeLinecap="butt"/>;
}

function ActiveChannel({a,b,aSource,bSource}:{a:Point;b:Point;aSource:GateSource;bSource:GateSource}){
  const mid=segment(a,b,0,0.5);
  const tail=segment(a,b,0.5,1);
  return <g>
    {aSource!=="inactive"&&<Line a={mid.a} b={mid.b} stroke={sourceColor(aSource)} width={5.2}/>}
    {bSource!=="inactive"&&<Line a={tail.a} b={tail.b} stroke={sourceColor(bSource)} width={5.2}/>}
  </g>;
}

function HangingChannel({a,b,source,fromEnd=false}:{a:Point;b:Point;source:GateSource;fromEnd?:boolean}){
  if(source==="inactive")return null;
  const s=fromEnd?segment(a,b,0.72,1):segment(a,b,0,0.28);
  return <Line a={s.a} b={s.b} stroke={sourceColor(source)} width={5.2}/>;
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

    {/* Background rails: every channel is one direct straight gate-to-gate line. */}
    <g>
      {CHANNELS.map(c=>{
        const a=GATE[c.gateA], b=GATE[c.gateB];
        if(!a||!b)return null;
        return <line key={`rail-${canonical(c.gateA,c.gateB)}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#aaa79f" strokeWidth="1.6" opacity="0.72"/>;
      })}
    </g>

    {/* Activation overlay. */}
    <g>
      {CHANNELS.map(c=>{
        const a=GATE[c.gateA], b=GATE[c.gateB];
        if(!a||!b)return null;
        const id=canonical(c.gateA,c.gateB);
        const sa=gateSource(c.gateA,personality,design);
        const sb=gateSource(c.gateB,personality,design);
        if(activeChannels.has(id)) return <ActiveChannel key={`active-${id}`} a={a} b={b} aSource={sa} bSource={sb}/>;
        return <g key={`hang-${id}`}>
          <HangingChannel a={a} b={b} source={sa}/>
          <HangingChannel a={a} b={b} source={sb} fromEnd/>
        </g>;
      })}
    </g>

    {/* Centers mask rails in their interiors, exactly like the reference-style bodygraph. */}
    <g>
      {(Object.keys(SHAPES) as CenterId[]).map(center=><g key={center}>
        {renderCenter(center,defined.has(center))}
        <text x={CENTER_LABEL[center].x} y={CENTER_LABEL[center].y+4} textAnchor="middle" fontSize="13.4" fontWeight="800" fill="#191820">{center==="Solar Plexus"?"Solar":center}</text>
      </g>)}
    </g>

    {/* Gate labels are painted last and are never detached from the channel endpoint. */}
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
