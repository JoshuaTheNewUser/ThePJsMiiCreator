/* MiiPy-inspired two-bone IK utility.
 * Independent Three.js implementation for the editor's current GLB skeleton.
 * Uses a pole vector and a bounded reach; maxFlexDeg approximates hinge safety.
 * MiiPy feature reference: https://github.com/davitizhgenti/miipy (MIT; notice in src/vendor/miipy).
 */
(function(global){
  "use strict";
  function worldPosition(THREE,object){const p=new THREE.Vector3();object.getWorldPosition(p);return p;}
  function rotateBoneInWorld(THREE,bone,fromDirection,toDirection){
    if(!bone.parent)return;
    const parentWorldQ=new THREE.Quaternion();bone.parent.getWorldQuaternion(parentWorldQ);
    const worldDelta=new THREE.Quaternion().setFromUnitVectors(fromDirection.clone().normalize(),toDirection.clone().normalize());
    const localDelta=parentWorldQ.clone().invert().multiply(worldDelta).multiply(parentWorldQ);
    bone.quaternion.premultiply(localDelta);
    bone.updateMatrixWorld(true);
  }
  function solveTwoBoneIK(THREE,root,upper,lower,end,target,swivelDeg=0,maxFlexDeg=150){
    if(!THREE||!root||!upper||!lower||!end)throw new Error("IK chain is incomplete.");
    root.updateMatrixWorld(true);
    const start=worldPosition(THREE,upper),mid=worldPosition(THREE,lower),finish=worldPosition(THREE,end);
    const upperLength=start.distanceTo(mid),lowerLength=mid.distanceTo(finish);
    if(upperLength<1e-5||lowerLength<1e-5)throw new Error("IK chain has a zero-length segment.");
    const raw=target.clone().sub(start),rawDistance=raw.length();
    if(rawDistance<1e-5)throw new Error("IK target is too close to the root joint.");
    const direction=raw.clone().normalize(),flex=Math.max(0,Math.min(175,maxFlexDeg))*Math.PI/180;
    const minReach=Math.sqrt(Math.max(0,upperLength*upperLength+lowerLength*lowerLength+2*upperLength*lowerLength*Math.cos(flex)));
    const maxReach=upperLength+lowerLength-1e-4;
    const distance=Math.max(Math.min(minReach,maxReach),Math.min(maxReach,rawDistance));
    const projection=mid.clone().sub(start).dot(direction);
    let pole=mid.clone().sub(start).addScaledVector(direction,-projection);
    if(pole.lengthSq()<1e-8){
      const fallback=Math.abs(direction.y)<0.9?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0);
      pole=fallback.addScaledVector(direction,-fallback.dot(direction));
    }
    pole.normalize().applyAxisAngle(direction,swivelDeg*Math.PI/180);
    const cosA=Math.max(-1,Math.min(1,(upperLength*upperLength+distance*distance-lowerLength*lowerLength)/(2*upperLength*distance)));
    const sinA=Math.sqrt(Math.max(0,1-cosA*cosA));
    const desiredMid=start.clone().addScaledVector(direction,cosA*upperLength).addScaledVector(pole,sinA*upperLength);
    rotateBoneInWorld(THREE,upper,mid.clone().sub(start),desiredMid.clone().sub(start));
    root.updateMatrixWorld(true);
    const newMid=worldPosition(THREE,lower),newEnd=worldPosition(THREE,end);
    const clampedTarget=start.clone().addScaledVector(direction,distance);
    rotateBoneInWorld(THREE,lower,newEnd.clone().sub(newMid),clampedTarget.clone().sub(newMid));
    root.updateMatrixWorld(true);
    const actualEnd=worldPosition(THREE,end);
    return {target:clampedTarget,actual:actualEnd,error:actualEnd.distanceTo(clampedTarget),clamped:Math.abs(distance-rawDistance)>1e-3,upperLength,lowerLength};
  }
  global.PJMiiIK={solveTwoBoneIK};
})(window);
