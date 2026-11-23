export const W=1600,H=980;
export const entrance={x:397,y:270};
export const depot={x:770,y:510};
const paths=[
  [[0,284],[450,171],[980,328],[1600,275]],
  [[730,270],[604,613],[880,741],[870,H]],
  [[210,270],[150,606],[470,740],[1320,676]],
  [[1180,620],[1180,638],[1190,659],[1194,686]]
];
const segments=paths.map(path=>Array.from({length:65},(_,i)=>{
  const t=i/64,u=1-t;
  return [0,1].map(k=>u**3*path[0][k]+3*u*u*t*path[1][k]+3*u*t*t*path[2][k]+t**3*path[3][k]);
}));
export function drawPaths(c,color,width){
  c.lineCap='round';c.strokeStyle=color;c.lineWidth=width;
  for(const [start,...points] of paths){
    c.beginPath();c.moveTo(...start);c.bezierCurveTo(...points.flat());c.stroke();
  }
}
function distanceSquared(x,y,line){
  let best=Infinity;
  for(let i=1;i<line.length;i++){
    const [a,b]=line[i-1], dx=line[i][0]-a,dy=line[i][1]-b;
    const t=Math.max(0,Math.min(1,((x-a)*dx+(y-b)*dy)/(dx*dx+dy*dy)));
    best=Math.min(best,(x-a-t*dx)**2+(y-b-t*dy)**2);
  }
  return best;
}
export const roadWidth=54;
export function onRoad(x,y,margin=0){
  return segments.some(line=>distanceSquared(x,y,line)<=(roadWidth+margin)**2);
}
export function zoneAt(x,y){
  if(distanceSquared(x,y,segments[0])<=roadWidth**2)return 0;
  if(segments.slice(1).some(line=>distanceSquared(x,y,line)<=roadWidth**2))return 1;
  return x<W/2?2:3;
}
