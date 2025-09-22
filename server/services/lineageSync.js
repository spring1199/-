import Horse from "../models/Horse.js";

export async function syncOffspring({ horseId, prevSireId, prevDamId, newSireId, newDamId }) {
  const ops = [];
  if (prevSireId && String(prevSireId) !== String(newSireId || "")) {
    ops.push(Horse.updateOne({ _id: prevSireId }, { $pull: { offspring: horseId } }));
  }
  if (newSireId && String(prevSireId || "") !== String(newSireId)) {
    ops.push(Horse.updateOne({ _id: newSireId }, { $addToSet: { offspring: horseId } }));
  }
  if (prevDamId && String(prevDamId) !== String(newDamId || "")) {
    ops.push(Horse.updateOne({ _id: prevDamId }, { $pull: { offspring: horseId } }));
  }
  if (newDamId && String(prevDamId || "") !== String(newDamId)) {
    ops.push(Horse.updateOne({ _id: newDamId }, { $addToSet: { offspring: horseId } }));
  }
  if (ops.length) await Promise.all(ops);
}
